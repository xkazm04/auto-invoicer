import { describe, it, expect } from "vitest";
import { generateSpdString, canGenerateQr } from "../spd";
import type { Invoice } from "@/types/invoice";

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "test-1",
    number: "2026-0001",
    status: "sent",
    issueDate: "2026-04-01",
    dueDate: "2026-04-15",
    taxPoint: "2026-04-01",
    currency: "CZK",
    supplier: { name: "Test Supplier s.r.o.", taxId: "", vatId: "", address: "", registrationId: "" },
    customer: { name: "Customer Co", taxId: "", vatId: "", address: "", registrationId: "" },
    lineItems: [{ id: "li-1", description: "Service", quantity: 10, unitPrice: 1000 }],
    vatRate: 0.21,
    paymentDetails: {
      iban: "CZ65 0800 0000 0012 3456 7899",
      swift: "GIBACZPX",
      bankName: "Ceska sporitelna",
      reference: "20260001",
    },
    ...overrides,
  };
}

describe("canGenerateQr", () => {
  it("returns true when IBAN is present", () => {
    expect(canGenerateQr(makeInvoice())).toBe(true);
  });

  it("returns false when IBAN is empty", () => {
    expect(canGenerateQr(makeInvoice({
      paymentDetails: { iban: "", swift: "", bankName: "", reference: "" },
    }))).toBe(false);
  });

  it("returns false when IBAN is whitespace only", () => {
    expect(canGenerateQr(makeInvoice({
      paymentDetails: { iban: "   ", swift: "", bankName: "", reference: "" },
    }))).toBe(false);
  });
});

describe("generateSpdString", () => {
  it("returns null when IBAN is empty", () => {
    const inv = makeInvoice({
      paymentDetails: { iban: "", swift: "", bankName: "", reference: "" },
    });
    expect(generateSpdString(inv)).toBeNull();
  });

  it("starts with SPD*1.0 header", () => {
    const result = generateSpdString(makeInvoice())!;
    expect(result).toMatch(/^SPD\*1\.0\*/);
  });

  it("includes cleaned IBAN without spaces", () => {
    const result = generateSpdString(makeInvoice())!;
    expect(result).toContain("ACC:CZ6508000000001234567899");
  });

  it("includes amount with 2 decimal places", () => {
    const result = generateSpdString(makeInvoice())!;
    // 10 * 1000 = 10000 subtotal, * 1.21 = 12100 total
    expect(result).toContain("AM:12100.00");
  });

  it("includes currency code", () => {
    const result = generateSpdString(makeInvoice())!;
    expect(result).toContain("CC:CZK");
  });

  it("includes variable symbol when reference is set", () => {
    const result = generateSpdString(makeInvoice())!;
    expect(result).toContain("X-VS:20260001");
  });

  it("omits variable symbol when reference is empty", () => {
    const inv = makeInvoice({
      paymentDetails: { iban: "CZ6508000000001234567899", swift: "", bankName: "", reference: "" },
    });
    const result = generateSpdString(inv)!;
    expect(result).not.toContain("X-VS:");
  });

  it("includes supplier name truncated to 35 chars", () => {
    const result = generateSpdString(makeInvoice())!;
    expect(result).toContain("RN:Test Supplier s.r.o.");
  });

  it("truncates long supplier names", () => {
    const inv = makeInvoice({
      supplier: { name: "A".repeat(50), taxId: "", vatId: "", address: "", registrationId: "" },
    });
    const result = generateSpdString(inv)!;
    const rnPart = result.split("*").find((p) => p.startsWith("RN:"))!;
    expect(rnPart.slice(3).length).toBeLessThanOrEqual(35);
  });

  it("includes due date in YYYYMMDD format", () => {
    const result = generateSpdString(makeInvoice())!;
    expect(result).toContain("DT:20260415");
  });

  it("includes invoice number in message", () => {
    const result = generateSpdString(makeInvoice())!;
    expect(result).toContain("MSG:Invoice 2026-0001");
  });

  it("works with EUR currency", () => {
    const inv = makeInvoice({ currency: "EUR" });
    const result = generateSpdString(inv)!;
    expect(result).toContain("CC:EUR");
  });

  it("uses * as field separator per SPD spec", () => {
    const result = generateSpdString(makeInvoice())!;
    const parts = result.split("*");
    expect(parts.length).toBeGreaterThanOrEqual(5);
    expect(parts[0]).toBe("SPD");
    expect(parts[1]).toBe("1.0");
  });
});
