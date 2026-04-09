import { describe, it, expect } from "vitest";
import {
  computeLineItemAmount,
  computeInvoiceTotals,
  nextStatus,
  STATUS_ORDER,
  type Invoice,
  type LineItem,
} from "@/types/invoice";

describe("computeLineItemAmount", () => {
  it("multiplies quantity by unit price", () => {
    const item: LineItem = { id: "1", description: "Test", quantity: 10, unitPrice: 150 };
    expect(computeLineItemAmount(item)).toBe(1500);
  });

  it("returns 0 for zero quantity", () => {
    const item: LineItem = { id: "1", description: "Test", quantity: 0, unitPrice: 100 };
    expect(computeLineItemAmount(item)).toBe(0);
  });

  it("returns 0 for zero price", () => {
    const item: LineItem = { id: "1", description: "Test", quantity: 5, unitPrice: 0 };
    expect(computeLineItemAmount(item)).toBe(0);
  });

  it("handles decimal prices", () => {
    const item: LineItem = { id: "1", description: "Test", quantity: 3, unitPrice: 99.99 };
    expect(computeLineItemAmount(item)).toBeCloseTo(299.97);
  });
});

function makeInvoice(lineItems: LineItem[], vatRate = 0.21): Invoice {
  return {
    id: "test-id",
    number: "TEST-001",
    status: "draft",
    issueDate: "2024-01-01",
    dueDate: "2024-01-15",
    taxPoint: "2024-01-01",
    currency: "CZK",
    supplier: { name: "S", taxId: "", vatId: "", address: "" },
    customer: { name: "C", taxId: "", vatId: "", address: "" },
    lineItems,
    vatRate,
  };
}

describe("computeInvoiceTotals", () => {
  it("computes subtotal, vat, and total for multiple items", () => {
    const invoice = makeInvoice([
      { id: "1", description: "A", quantity: 10, unitPrice: 1500 },
      { id: "2", description: "B", quantity: 40, unitPrice: 2000 },
    ]);
    const totals = computeInvoiceTotals(invoice);
    expect(totals.subtotal).toBe(95000);
    expect(totals.vat).toBeCloseTo(19950);
    expect(totals.total).toBeCloseTo(114950);
  });

  it("returns zeros for empty line items", () => {
    const invoice = makeInvoice([]);
    const totals = computeInvoiceTotals(invoice);
    expect(totals.subtotal).toBe(0);
    expect(totals.vat).toBe(0);
    expect(totals.total).toBe(0);
  });

  it("applies custom VAT rate", () => {
    const invoice = makeInvoice(
      [{ id: "1", description: "A", quantity: 1, unitPrice: 1000 }],
      0.1
    );
    const totals = computeInvoiceTotals(invoice);
    expect(totals.subtotal).toBe(1000);
    expect(totals.vat).toBe(100);
    expect(totals.total).toBe(1100);
  });

  it("handles zero VAT rate", () => {
    const invoice = makeInvoice(
      [{ id: "1", description: "A", quantity: 2, unitPrice: 500 }],
      0
    );
    const totals = computeInvoiceTotals(invoice);
    expect(totals.vat).toBe(0);
    expect(totals.total).toBe(1000);
  });
});

describe("nextStatus", () => {
  it("advances draft to sent", () => {
    expect(nextStatus("draft")).toBe("sent");
  });

  it("advances sent to paid", () => {
    expect(nextStatus("sent")).toBe("paid");
  });

  it("advances paid to overdue", () => {
    expect(nextStatus("paid")).toBe("overdue");
  });

  it("keeps overdue as overdue (terminal)", () => {
    expect(nextStatus("overdue")).toBe("overdue");
  });
});

describe("STATUS_ORDER", () => {
  it("has exactly 4 statuses in correct order", () => {
    expect(STATUS_ORDER).toEqual(["draft", "sent", "paid", "overdue"]);
  });
});
