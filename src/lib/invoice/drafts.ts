import type { Invoice } from "@/types/invoice";
import { computeInvoiceTotals } from "@/types/invoice";

const STORAGE_PREFIX = "invoice-drafts:";

export interface DraftSummary {
  id: string;
  number: string;
  updatedAt: string;
  total: number;
  currency: string;
}

function storageKey(id: string): string {
  return `${STORAGE_PREFIX}${id}`;
}

export function saveDraft(invoice: Invoice): void {
  try {
    const payload = JSON.stringify({
      ...invoice,
      _updatedAt: new Date().toISOString(),
    });
    localStorage.setItem(storageKey(invoice.id), payload);
  } catch (err) {
    console.error("Failed to save draft", err);
  }
}

export function loadDraft(id: string): Invoice | null {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Strip internal metadata
    const { _updatedAt: _, ...invoice } = parsed;
    return invoice as Invoice;
  } catch (err) {
    console.error("Failed to load draft", err);
    return null;
  }
}

export function deleteDraft(id: string): void {
  try {
    localStorage.removeItem(storageKey(id));
  } catch (err) {
    console.error("Failed to delete draft", err);
  }
}

export function listDrafts(): DraftSummary[] {
  const drafts: DraftSummary[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const totals = computeInvoiceTotals(parsed);
        drafts.push({
          id: parsed.id,
          number: parsed.number || "Untitled",
          updatedAt: parsed._updatedAt || "",
          total: totals.total,
          currency: parsed.currency || "CZK",
        });
      } catch {
        // skip corrupted entries
      }
    }
  } catch (err) {
    console.error("Failed to list drafts", err);
  }
  drafts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return drafts;
}
