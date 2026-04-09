import type { Invoice } from "@/types/invoice";
import { computeInvoiceTotals } from "@/types/invoice";

/**
 * Generate a Short Payment Descriptor (SPD/SPAYD) string for Czech QR payment codes.
 * Format follows the Czech Banking Association standard (version 1.0).
 *
 * Reference: https://qr-platba.cz/pro-vyvojare/specifikace-formatu/
 */
export function generateSpdString(invoice: Invoice): string | null {
  const { iban } = invoice.paymentDetails;
  if (!iban.trim()) return null;

  const totals = computeInvoiceTotals(invoice);
  const cleanIban = iban.replace(/\s/g, "").toUpperCase();

  const parts: string[] = [
    "SPD*1.0",
    `ACC:${cleanIban}`,
    `AM:${totals.total.toFixed(2)}`,
    `CC:${invoice.currency}`,
  ];

  // Variable symbol (reference)
  const ref = invoice.paymentDetails.reference.trim();
  if (ref) {
    parts.push(`X-VS:${ref}`);
  }

  // Recipient name (max 35 chars per SPD spec)
  const name = invoice.supplier.name.trim();
  if (name) {
    parts.push(`RN:${name.slice(0, 35)}`);
  }

  // Due date in YYYYMMDD format
  if (invoice.dueDate) {
    const dt = invoice.dueDate.replace(/-/g, "");
    parts.push(`DT:${dt}`);
  }

  // Message (invoice number)
  if (invoice.number) {
    parts.push(`MSG:Invoice ${invoice.number}`);
  }

  return parts.join("*");
}

/**
 * Check if an invoice has enough data to generate a QR payment code.
 */
export function canGenerateQr(invoice: Invoice): boolean {
  return invoice.paymentDetails.iban.trim().length > 0;
}
