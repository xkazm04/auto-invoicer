import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadSettings, saveSettings } from "../store";
import { createDefaultSettings } from "@/types/settings";

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

beforeEach(() => {
  storage.clear();
  vi.clearAllMocks();
});

describe("loadSettings", () => {
  it("returns default settings when nothing is stored", () => {
    const settings = loadSettings();
    const defaults = createDefaultSettings();
    expect(settings).toEqual(defaults);
  });

  it("returns stored settings", () => {
    const custom = { ...createDefaultSettings(), defaultCurrency: "EUR" as const };
    storage.set("app-settings", JSON.stringify(custom));
    const settings = loadSettings();
    expect(settings.defaultCurrency).toBe("EUR");
  });

  it("merges with defaults for missing fields", () => {
    storage.set("app-settings", JSON.stringify({ defaultCurrency: "USD" }));
    const settings = loadSettings();
    expect(settings.defaultCurrency).toBe("USD");
    // Should still have the default companyProfile
    expect(settings.companyProfile).toBeDefined();
    expect(settings.companyProfile.name).toBe("");
  });

  it("handles corrupted JSON gracefully", () => {
    storage.set("app-settings", "not valid json{{{");
    const settings = loadSettings();
    expect(settings).toEqual(createDefaultSettings());
  });
});

describe("saveSettings", () => {
  it("persists settings to localStorage", () => {
    const custom = { ...createDefaultSettings(), defaultVatRate: 0.15 };
    saveSettings(custom);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "app-settings",
      expect.any(String)
    );
    const stored = JSON.parse(storage.get("app-settings")!);
    expect(stored.defaultVatRate).toBe(0.15);
  });
});
