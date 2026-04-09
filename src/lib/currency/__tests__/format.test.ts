import { describe, it, expect } from "vitest";
import { formatMoney, getCurrencySymbol } from "../format";

describe("formatMoney", () => {
  it("formats CZK with cs-CZ locale and Kc suffix", () => {
    const result = formatMoney(1500, "CZK");
    expect(result).toContain("Kc");
    // Should have thousands separator and decimals
    expect(result).toMatch(/1.*500/);
  });

  it("formats USD with $ prefix", () => {
    const result = formatMoney(2500.5, "USD");
    expect(result).toMatch(/^\$/);
    expect(result).toContain("2");
  });

  it("formats EUR with EUR suffix", () => {
    const result = formatMoney(1000, "EUR");
    expect(result).toContain("EUR");
  });

  it("respects decimals: false option", () => {
    const result = formatMoney(1500.99, "CZK", { decimals: false });
    expect(result).not.toContain("99");
  });

  it("respects symbolOnly: true option (no currency symbol)", () => {
    const result = formatMoney(1500, "CZK", { symbolOnly: true });
    expect(result).not.toContain("Kc");
  });

  it("formats zero correctly", () => {
    const result = formatMoney(0, "CZK");
    expect(result).toContain("0");
    expect(result).toContain("Kc");
  });

  it("formats large numbers with separators", () => {
    const result = formatMoney(1000000, "USD");
    // Should have some form of thousand separator
    expect(result.length).toBeGreaterThan(8);
  });
});

describe("getCurrencySymbol", () => {
  it("returns Kc for CZK", () => {
    expect(getCurrencySymbol("CZK")).toBe("Kc");
  });

  it("returns $ for USD", () => {
    expect(getCurrencySymbol("USD")).toBe("$");
  });

  it("returns EUR for EUR", () => {
    expect(getCurrencySymbol("EUR")).toBe("EUR");
  });
});
