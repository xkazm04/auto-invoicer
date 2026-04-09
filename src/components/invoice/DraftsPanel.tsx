"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "./ThemeContext";
import { listDrafts, deleteDraft, type DraftSummary } from "@/lib/invoice/drafts";
import { formatMoney } from "@/lib/currency/format";
import type { Currency } from "@/types/invoice";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const DRAFTS_CHANNEL = "invoice-drafts-sync";

interface DraftsPanelProps {
  onLoadDraft: (id: string) => void;
  onNewInvoice: () => void;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Notify same-tab listeners that drafts changed */
export function notifyDraftsChanged(): void {
  try {
    const bc = new BroadcastChannel(DRAFTS_CHANNEL);
    bc.postMessage("changed");
    bc.close();
  } catch {
    // BroadcastChannel not available — will fall back to polling
  }
}

export function DraftsPanel({ onLoadDraft, onNewInvoice }: DraftsPanelProps) {
  const { theme: t } = useTheme();
  const isMono = t.id === "minimal-mono";

  const [drafts, setDrafts] = useState<DraftSummary[]>(() =>
    typeof window !== "undefined" ? listDrafts() : []
  );
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);

  const refresh = useCallback(() => {
    setDrafts(listDrafts());
  }, []);

  useEffect(() => {
    // Cross-tab sync via StorageEvent
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("invoice-drafts:")) refresh();
    };
    window.addEventListener("storage", handleStorage);

    // Same-tab sync via BroadcastChannel (replaces 2s polling)
    try {
      const bc = new BroadcastChannel(DRAFTS_CHANNEL);
      bc.onmessage = () => refresh();
      bcRef.current = bc;
    } catch {
      // Fallback: poll every 2s only if BroadcastChannel unavailable
    }

    // Light fallback poll (10s instead of 2s) for edge cases
    const interval = setInterval(refresh, 10000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      bcRef.current?.close();
      clearInterval(interval);
    };
  }, [refresh]);

  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      deleteDraft(deleteTarget);
      notifyDraftsChanged();
      refresh();
      setDeleteTarget(null);
    }
  }, [deleteTarget, refresh]);

  return (
    <div className={`${isMono ? "border-r border-neutral-200 pr-4" : ""} w-full`}>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Draft"
        message="This draft will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex items-center justify-between mb-4">
        {t.useHandwritten ? (
          <span className={`font-[family-name:var(--font-caveat)] text-xl ${t.sectionLabel}`}>Drafts</span>
        ) : (
          <span className={`text-[13px] uppercase tracking-widest ${t.labelColor}`}>Drafts</span>
        )}
        <button
          type="button"
          onClick={onNewInvoice}
          className={`${isMono ? "text-xs" : "text-[13px] font-semibold"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} uppercase tracking-wider transition-colors`}
        >
          {isMono ? "+ New" : "+ New Invoice"}
        </button>
      </div>

      {drafts.length === 0 ? (
        <p className={`${isMono ? "text-xs" : "text-sm"} ${t.labelColor}`}>
          No saved drafts yet.
        </p>
      ) : (
        <div className={`space-y-${isMono ? "1" : "2"}`}>
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className={`group ${t.cardBg} ${t.cardRadius} ${isMono ? "py-2 px-2" : "p-3"} ${t.cardShadow} ${t.cardHoverShadow} transition-shadow cursor-pointer`}
              onClick={() => onLoadDraft(draft.id)}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className={`${isMono ? "text-[13px] font-medium" : "text-sm font-medium"} ${t.inputText} truncate`}>
                    #{draft.number}
                  </div>
                  <div className={`${isMono ? "text-[13px]" : "text-xs"} ${t.labelColor} mt-0.5`}>
                    {formatDate(draft.updatedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className={`${isMono ? "text-xs" : "text-xs font-medium"} ${t.summaryValueColor} tabular-nums whitespace-nowrap`}>
                    {formatMoney(draft.total, draft.currency as Currency, { decimals: false })}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(draft.id); }}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all"
                    title="Delete draft"
                  >
                    <svg className={`${isMono ? "w-3 h-3" : "w-3.5 h-3.5"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
