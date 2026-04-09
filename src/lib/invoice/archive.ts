import type { Invoice } from "@/types/invoice";
import { computeInvoiceTotals } from "@/types/invoice";

const STORAGE_PREFIX = "invoice-archive:";

export interface ArchivedInvoiceSummary {
  id: string;
  number: string;
  status: Invoice["status"];
  customerName: string;
  issueDate: string;
  dueDate: string;
  total: number;
  currency: string;
  archivedAt: string;
}

function storageKey(id: string): string {
  return `${STORAGE_PREFIX}${id}`;
}

export function archiveInvoice(invoice: Invoice): void {
  try {
    const payload = JSON.stringify({
      ...invoice,
      _archivedAt: new Date().toISOString(),
    });
    localStorage.setItem(storageKey(invoice.id), payload);
  } catch (err) {
    console.error("Failed to archive invoice", err);
  }
}

export function loadArchived(id: string): Invoice | null {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return null;
    const { _archivedAt: _, ...invoice } = JSON.parse(raw);
    return invoice as Invoice;
  } catch {
    return null;
  }
}

export function deleteArchived(id: string): void {
  try {
    localStorage.removeItem(storageKey(id));
  } catch (err) {
    console.error("Failed to delete archived invoice", err);
  }
}

export function listArchived(): ArchivedInvoiceSummary[] {
  const items: ArchivedInvoiceSummary[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const totals = computeInvoiceTotals(parsed);
        items.push({
          id: parsed.id,
          number: parsed.number || "Untitled",
          status: parsed.status || "sent",
          customerName: parsed.customer?.name || "Unknown",
          issueDate: parsed.issueDate || "",
          dueDate: parsed.dueDate || "",
          total: totals.total,
          currency: parsed.currency || "CZK",
          archivedAt: parsed._archivedAt || "",
        });
      } catch {
        // skip corrupted entries
      }
    }
  } catch (err) {
    console.error("Failed to list archived invoices", err);
  }
  items.sort((a, b) => b.archivedAt.localeCompare(a.archivedAt));
  return items;
}
