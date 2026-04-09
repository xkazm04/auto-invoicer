import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveDraft, loadDraft, deleteDraft, listDrafts } from "@/lib/invoice/drafts";
import type { Invoice } from "@/types/invoice";

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "test-id-1",
    number: "2024-001",
    status: "draft",
    issueDate: "2024-01-01",
    dueDate: "2024-01-15",
    taxPoint: "2024-01-01",
    currency: "CZK",
    supplier: { name: "Supplier", taxId: "", vatId: "", address: "" },
    customer: { name: "Customer", taxId: "", vatId: "", address: "" },
    lineItems: [{ id: "li-1", description: "Work", quantity: 10, unitPrice: 100 }],
    vatRate: 0.21,
    paymentDetails: { iban: "", swift: "", bankName: "", reference: "" },
    ...overrides,
  };
}

// Mock localStorage
const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    key: (index: number) => [...storage.keys()][index] ?? null,
    get length() {
      return storage.size;
    },
    clear: () => storage.clear(),
  });
});

describe("saveDraft + loadDraft roundtrip", () => {
  it("saves and loads an invoice correctly", () => {
    const inv = makeInvoice();
    saveDraft(inv);
    const loaded = loadDraft("test-id-1");
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe("test-id-1");
    expect(loaded!.number).toBe("2024-001");
    expect(loaded!.lineItems).toHaveLength(1);
    expect(loaded!.lineItems[0].unitPrice).toBe(100);
  });

  it("overwrites existing draft with same id", () => {
    saveDraft(makeInvoice({ number: "OLD" }));
    saveDraft(makeInvoice({ number: "NEW" }));
    const loaded = loadDraft("test-id-1");
    expect(loaded!.number).toBe("NEW");
  });
});

describe("loadDraft", () => {
  it("returns null for non-existent id", () => {
    expect(loadDraft("nonexistent")).toBeNull();
  });
});

describe("deleteDraft", () => {
  it("removes a saved draft", () => {
    saveDraft(makeInvoice());
    deleteDraft("test-id-1");
    expect(loadDraft("test-id-1")).toBeNull();
  });

  it("does not throw for non-existent id", () => {
    expect(() => deleteDraft("nonexistent")).not.toThrow();
  });
});

describe("listDrafts", () => {
  it("returns empty array when no drafts exist", () => {
    expect(listDrafts()).toEqual([]);
  });

  it("returns summaries for saved drafts", () => {
    saveDraft(makeInvoice({ id: "a", number: "INV-A" }));
    saveDraft(makeInvoice({ id: "b", number: "INV-B" }));
    const drafts = listDrafts();
    expect(drafts).toHaveLength(2);
    const numbers = drafts.map((d) => d.number);
    expect(numbers).toContain("INV-A");
    expect(numbers).toContain("INV-B");
  });

  it("includes computed total in summary", () => {
    saveDraft(makeInvoice({ lineItems: [{ id: "1", description: "X", quantity: 5, unitPrice: 200 }] }));
    const drafts = listDrafts();
    // subtotal=1000, vat=210, total=1210
    expect(drafts[0].total).toBeCloseTo(1210);
  });

  it("sorts by updatedAt descending", () => {
    // Write entries with controlled timestamps (saveDraft uses Date.now which is too fast)
    storage.set(
      "invoice-drafts:old",
      JSON.stringify({ ...makeInvoice({ id: "old", number: "OLD" }), _updatedAt: "2024-01-01T00:00:00Z" })
    );
    storage.set(
      "invoice-drafts:new",
      JSON.stringify({ ...makeInvoice({ id: "new", number: "NEW" }), _updatedAt: "2024-06-01T00:00:00Z" })
    );
    const drafts = listDrafts();
    expect(drafts[0].number).toBe("NEW");
    expect(drafts[1].number).toBe("OLD");
  });

  it("skips corrupted entries", () => {
    saveDraft(makeInvoice({ id: "good", number: "GOOD" }));
    // Manually inject corrupted data
    storage.set("invoice-drafts:bad", "{not valid json");
    const drafts = listDrafts();
    expect(drafts).toHaveLength(1);
    expect(drafts[0].number).toBe("GOOD");
  });

  it("ignores non-draft localStorage keys", () => {
    storage.set("unrelated-key", "some value");
    saveDraft(makeInvoice());
    expect(listDrafts()).toHaveLength(1);
  });
});
