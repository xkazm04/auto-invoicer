import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveTemplate, loadTemplate, deleteTemplate, listTemplates, updateTemplateLastUsed } from "../store";
import type { RecurringTemplate } from "@/types/recurring";

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

function makeTemplate(overrides: Partial<RecurringTemplate> = {}): RecurringTemplate {
  return {
    id: "tpl-1",
    name: "Monthly Consulting",
    interval: "monthly",
    contactId: "c-1",
    contactName: "Acme Corp",
    currency: "CZK",
    vatRate: 0.21,
    lineItems: [{ id: "li-1", description: "Consulting", quantity: 10, unitPrice: 1500 }],
    paymentDetails: { iban: "", swift: "", bankName: "", reference: "" },
    createdAt: "2026-04-01T00:00:00.000Z",
    lastUsedAt: "",
    ...overrides,
  };
}

beforeEach(() => {
  storage.clear();
  vi.clearAllMocks();
});

describe("saveTemplate", () => {
  it("stores template in localStorage", () => {
    saveTemplate(makeTemplate());
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "recurring-template:tpl-1",
      expect.any(String)
    );
  });
});

describe("loadTemplate", () => {
  it("returns null for non-existent template", () => {
    expect(loadTemplate("nonexistent")).toBeNull();
  });

  it("loads a previously saved template", () => {
    saveTemplate(makeTemplate());
    const loaded = loadTemplate("tpl-1");
    expect(loaded).not.toBeNull();
    expect(loaded!.name).toBe("Monthly Consulting");
    expect(loaded!.interval).toBe("monthly");
  });
});

describe("deleteTemplate", () => {
  it("removes template from storage", () => {
    saveTemplate(makeTemplate());
    deleteTemplate("tpl-1");
    expect(loadTemplate("tpl-1")).toBeNull();
  });
});

describe("listTemplates", () => {
  it("returns empty array when none exist", () => {
    expect(listTemplates()).toEqual([]);
  });

  it("lists all templates sorted by createdAt descending", () => {
    saveTemplate(makeTemplate({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" }));
    saveTemplate(makeTemplate({ id: "b", createdAt: "2026-06-01T00:00:00.000Z" }));
    const list = listTemplates();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe("b"); // newer first
  });
});

describe("updateTemplateLastUsed", () => {
  it("updates the lastUsedAt timestamp", () => {
    saveTemplate(makeTemplate());
    updateTemplateLastUsed("tpl-1");
    const loaded = loadTemplate("tpl-1");
    expect(loaded!.lastUsedAt).not.toBe("");
  });

  it("does nothing for non-existent template", () => {
    // Should not throw
    updateTemplateLastUsed("nonexistent");
  });
});
