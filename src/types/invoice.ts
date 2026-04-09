export type Currency = "CZK" | "EUR" | "USD";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Party {
  name: string;
  taxId: string;
  vatId: string;
  address: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export const STATUS_ORDER: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];

export function nextStatus(current: InvoiceStatus): InvoiceStatus {
  const idx = STATUS_ORDER.indexOf(current);
  if (idx < 0 || idx >= STATUS_ORDER.length - 1) return current;
  return STATUS_ORDER[idx + 1];
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  taxPoint: string;
  currency: Currency;
  supplier: Party;
  customer: Party;
  lineItems: LineItem[];
  vatRate: number;
}

export function computeLineItemAmount(item: LineItem): number {
  return item.quantity * item.unitPrice;
}

export function computeInvoiceTotals(invoice: Invoice): {
  subtotal: number;
  vat: number;
  total: number;
} {
  const subtotal = invoice.lineItems.reduce(
    (sum, item) => sum + computeLineItemAmount(item),
    0
  );
  const vat = subtotal * invoice.vatRate;
  return {
    subtotal,
    vat,
    total: subtotal + vat,
  };
}
