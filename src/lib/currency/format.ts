import type { Currency } from "@/types/invoice";

const LOCALE_MAP: Record<Currency, string> = {
  CZK: "cs-CZ",
  EUR: "de-DE",
  USD: "en-US",
};

const SYMBOL_MAP: Record<Currency, string> = {
  CZK: "Kc",
  EUR: "EUR",
  USD: "$",
};

/**
 * Format a monetary amount with locale-aware number formatting and currency symbol.
 * Uses Intl.NumberFormat for proper thousand separators and decimal handling.
 */
export function formatMoney(
  amount: number,
  currency: Currency,
  options?: { decimals?: boolean; symbolOnly?: boolean }
): string {
  const locale = LOCALE_MAP[currency] ?? "en-US";
  const showDecimals = options?.decimals ?? true;

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  if (options?.symbolOnly) return formatted;

  const symbol = SYMBOL_MAP[currency] ?? currency;
  // USD puts symbol before; CZK/EUR put symbol after
  if (currency === "USD") return `${symbol}${formatted}`;
  return `${formatted} ${symbol}`;
}

/**
 * Get just the currency symbol for display.
 */
export function getCurrencySymbol(currency: Currency): string {
  return SYMBOL_MAP[currency] ?? currency;
}
