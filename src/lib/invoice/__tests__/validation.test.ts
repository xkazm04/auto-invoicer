import { describe, it, expect } from "vitest";
import { validateInvoice } from "@/lib/invoice/validation";
import type { Invoice } from "@/types/invoice";

function validInvoice(): Invoice {
  return {
    id: "test-id",
    number: "2024-001",
    status: "draft",
    issueDate: "2024-01-01",
    dueDate: "2024-01-15",
    taxPoint: "2024-01-01",
    currency: "CZK",
    supplier: { name: "Acme Ltd", taxId: "12345", vatId: "CZ12345", address: "Main St" },
    customer: { name: "Client Co", taxId: "67890", vatId: "CZ67890", address: "Side Rd" },
    lineItems: [
      { id: "li-1", description: "Service", quantity: 5, unitPrice: 200 },
    ],
    vatRate: 0.21,
    paymentDetails: { iban: "", swift: "", bankName: "", reference: "" },
  };
}

describe("validateInvoice", () => {
  it("passes for a valid complete invoice", () => {
    const result = validateInvoice(validInvoice());
    expect(result.success).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("fails when invoice number is empty", () => {
    const inv = { ...validInvoice(), number: "" };
    const result = validateInvoice(inv);
    expect(result.success).toBe(false);
    expect(result.errors["number"]).toBeDefined();
  });

  it("fails when supplier name is missing", () => {
    const inv = { ...validInvoice(), supplier: { ...validInvoice().supplier, name: "" } };
    const result = validateInvoice(inv);
    expect(result.success).toBe(false);
    expect(result.errors["supplier.name"]).toBeDefined();
  });

  it("fails when customer name is missing", () => {
    const inv = { ...validInvoice(), customer: { ...validInvoice().customer, name: "" } };
    const result = validateInvoice(inv);
    expect(result.success).toBe(false);
    expect(result.errors["customer.name"]).toBeDefined();
  });

  it("fails when lineItems is empty", () => {
    const inv = { ...validInvoice(), lineItems: [] };
    const result = validateInvoice(inv);
    expect(result.success).toBe(false);
    expect(result.errors["lineItems"]).toBeDefined();
  });

  it("fails when a line item has zero quantity", () => {
    const inv = {
      ...validInvoice(),
      lineItems: [{ id: "li-1", description: "Test", quantity: 0, unitPrice: 100 }],
    };
    const result = validateInvoice(inv);
    expect(result.success).toBe(false);
    expect(result.errors["lineItems.0.quantity"]).toBeDefined();
  });

  it("fails when a line item has zero price", () => {
    const inv = {
      ...validInvoice(),
      lineItems: [{ id: "li-1", description: "Test", quantity: 5, unitPrice: 0 }],
    };
    const result = validateInvoice(inv);
    expect(result.success).toBe(false);
    expect(result.errors["lineItems.0.unitPrice"]).toBeDefined();
  });

  it("fails when a line item has empty description", () => {
    const inv = {
      ...validInvoice(),
      lineItems: [{ id: "li-1", description: "", quantity: 5, unitPrice: 100 }],
    };
    const result = validateInvoice(inv);
    expect(result.success).toBe(false);
    expect(result.errors["lineItems.0.description"]).toBeDefined();
  });

  it("fails when issue date is empty", () => {
    const inv = { ...validInvoice(), issueDate: "" };
    const result = validateInvoice(inv);
    expect(result.success).toBe(false);
    expect(result.errors["issueDate"]).toBeDefined();
  });

  it("collects multiple errors at once", () => {
    const inv = {
      ...validInvoice(),
      number: "",
      supplier: { ...validInvoice().supplier, name: "" },
      lineItems: [],
    };
    const result = validateInvoice(inv);
    expect(result.success).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(3);
  });
});
