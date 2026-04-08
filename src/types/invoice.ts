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

export interface Invoice {
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
