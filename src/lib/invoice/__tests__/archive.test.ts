import { describe, it, expect, beforeEach, vi } from "vitest";
import { archiveInvoice, listArchived, loadArchived, deleteArchived } from "../archive";
import type { Invoice } from "@/types/invoice";

// Mock localStorage
const storage = new Map<string, string>();
const localStorageMock = {
  getItem: vi.fn((key: string) => storage.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
  removeItem: vi.fn((key: string) => storage.delete(key)),
  clear: vi.fn(() => storage.clear()),
  get length() { return storage.size; },
  key: vi.fn((i: number) => [...storage.keys()][i] ?? null),
};

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "test-1",
    number: "2026-0001",
    status: "sent",
    issueDate: "2026-04-01",
    dueDate: "2026-04-15",
    taxPoint: "2026-04-01",
    currency: "CZK",
    supplier: { name: "Supplier Co", taxId: "", vatId: "", address: "", registrationId: "" },
    customer: { name: "Customer Co", taxId: "", vatId: "", address: "", registrationId: "" },
    lineItems: [{ id: "li-1", description: "Service", quantity: 10, unitPrice: 1000 }],
    vatRate: 0.21,
    paymentDetails: { iban: "", swift: "", bankName: "", reference: "" },
    ...overrides,
  };
}

beforeEach(() => {
  storage.clear();
  vi.clearAllMocks();
});

describe("archiveInvoice", () => {
  it("stores invoice in localStorage with archive prefix", () => {
    const inv = makeInvoice();
    archiveInvoice(inv);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "invoice-archive:test-1",
      expect.any(String)
    );
  });

  it("adds _archivedAt timestamp", () => {
    const inv = makeInvoice();
    archiveInvoice(inv);
    const stored = JSON.parse(storage.get("invoice-archive:test-1")!);
    expect(stored._archivedAt).toBeDefined();
  });
});

describe("loadArchived", () => {
  it("returns null for non-existent invoice", () => {
    expect(loadArchived("nonexistent")).toBeNull();
  });

  it("loads a previously archived invoice", () => {
    const inv = makeInvoice();
    archiveInvoice(inv);
    const loaded = loadArchived("test-1");
    expect(loaded).not.toBeNull();
    expect(loaded!.number).toBe("2026-0001");
    expect(loaded!.customer.name).toBe("Customer Co");
  });
});

describe("deleteArchived", () => {
  it("removes archived invoice from storage", () => {
    archiveInvoice(makeInvoice());
    deleteArchived("test-1");
    expect(loadArchived("test-1")).toBeNull();
  });
});

describe("listArchived", () => {
  it("returns empty array when no archives exist", () => {
    expect(listArchived()).toEqual([]);
  });

  it("lists all archived invoices", () => {
    archiveInvoice(makeInvoice({ id: "a" }));
    archiveInvoice(makeInvoice({ id: "b", number: "2026-0002" }));
    const list = listArchived();
    expect(list).toHaveLength(2);
  });

  it("computes totals correctly in summaries", () => {
    archiveInvoice(makeInvoice());
    const [summary] = listArchived();
    // 10 * 1000 = 10000 subtotal, * 1.21 = 12100 total
    expect(summary.total).toBe(12100);
  });

  it("extracts customer name from invoice", () => {
    archiveInvoice(makeInvoice());
    const [summary] = listArchived();
    expect(summary.customerName).toBe("Customer Co");
  });
});
