"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "@/components/invoice/ThemeContext";
import { listArchived, type ArchivedInvoiceSummary } from "@/lib/invoice/archive";
import { listDrafts, type DraftSummary } from "@/lib/invoice/drafts";
import { formatMoney } from "@/lib/currency/format";
import type { Currency, InvoiceStatus } from "@/types/invoice";

type FilterStatus = "all" | InvoiceStatus;

interface DashboardModuleProps {
  onNavigate: (tab: "dashboard" | "invoices" | "contacts" | "settings") => void;
}

function isOverdue(dueDate: string, status: string): boolean {
  if (status === "paid" || status === "overdue") return status === "overdue";
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function formatDate(iso: string): string {
  if (!iso) return "\u2014";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function statusColor(status: string, dueDate: string): string {
  if (isOverdue(dueDate, status) && status !== "paid") {
    return "text-red-600 bg-red-50";
  }
  switch (status) {
    case "paid": return "text-emerald-700 bg-emerald-50";
    case "sent": return "text-blue-700 bg-blue-50";
    case "draft": return "text-neutral-500 bg-neutral-100";
    case "overdue": return "text-red-600 bg-red-50";
    default: return "text-neutral-500 bg-neutral-100";
  }
}

type UnifiedInvoice = {
  id: string;
  number: string;
  status: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  total: number;
  currency: string;
  source: "archived" | "draft";
};

export default function DashboardModule({ onNavigate }: DashboardModuleProps) {
  const { theme: t } = useTheme();
  const isMono = t.id === "minimal-mono";

  const [archived, setArchived] = useState<ArchivedInvoiceSummary[]>(() =>
    typeof window !== "undefined" ? listArchived() : []
  );
  const [drafts, setDrafts] = useState<DraftSummary[]>(() =>
    typeof window !== "undefined" ? listDrafts() : []
  );
  const [filter, setFilter] = useState<FilterStatus>("all");

  const refresh = useCallback(() => {
    setArchived(listArchived());
    setDrafts(listDrafts());
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("invoice-archive:") || e.key?.startsWith("invoice-drafts:")) {
        refresh();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refresh]);

  const kpis = useMemo(() => {
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    let overdueCount = 0;
    const currency = (archived[0]?.currency ?? drafts[0]?.currency ?? "CZK") as Currency;

    for (const inv of archived) {
      totalInvoiced += inv.total;
      if (inv.status === "paid") {
        totalPaid += inv.total;
      } else {
        totalOutstanding += inv.total;
        if (isOverdue(inv.dueDate, inv.status)) overdueCount++;
      }
    }

    return { totalInvoiced, totalPaid, totalOutstanding, overdueCount, draftCount: drafts.length, currency };
  }, [archived, drafts]);

  const unified = useMemo<UnifiedInvoice[]>(() => [
    ...archived.map((inv) => ({ ...inv, source: "archived" as const })),
    ...drafts.map((d) => ({
      id: d.id, number: d.number, status: "draft", customerName: "",
      issueDate: "", dueDate: "", total: d.total, currency: d.currency, source: "draft" as const,
    })),
  ], [archived, drafts]);

  const filtered = useMemo(
    () => unified.filter((inv) => {
      if (filter === "all") return true;
      if (filter === "overdue") return isOverdue(inv.dueDate, inv.status) && inv.status !== "paid";
      return inv.status === filter;
    }),
    [unified, filter]
  );

  const filters: { value: FilterStatus; label: string; monoLabel: string }[] = [
    { value: "all", label: "All", monoLabel: "all" },
    { value: "draft", label: "Drafts", monoLabel: "draft" },
    { value: "sent", label: "Sent", monoLabel: "sent" },
    { value: "paid", label: "Paid", monoLabel: "paid" },
    { value: "overdue", label: "Overdue", monoLabel: "overdue" },
  ];

  const kpiCards = useMemo(() => [
    { label: "Total Invoiced", monoLabel: "invoiced", value: formatMoney(kpis.totalInvoiced, kpis.currency, { decimals: false }), accent: isMono ? "text-neutral-900" : "text-neutral-800" },
    { label: "Paid", monoLabel: "paid", value: formatMoney(kpis.totalPaid, kpis.currency, { decimals: false }), accent: isMono ? "text-neutral-900" : "text-emerald-700" },
    { label: "Outstanding", monoLabel: "outstanding", value: formatMoney(kpis.totalOutstanding, kpis.currency, { decimals: false }), accent: isMono ? "text-neutral-900" : "text-amber-700" },
    { label: "Overdue", monoLabel: "overdue", value: String(kpis.overdueCount), accent: kpis.overdueCount > 0 ? (isMono ? "text-neutral-900" : "text-red-600") : (isMono ? "text-neutral-400" : "text-neutral-400") },
  ], [kpis, isMono]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        {t.useHandwritten ? (
          <span className={`font-[family-name:var(--font-caveat)] text-3xl ${t.headerTitle}`}>Dashboard</span>
        ) : (
          <span className={`text-[13px] uppercase tracking-widest ${t.labelColor}`}>Dashboard</span>
        )}
        <button
          type="button"
          onClick={() => onNavigate("invoices")}
          className={`${isMono ? "text-xs uppercase tracking-widest border-b border-neutral-900 pb-0.5" : "px-4 py-2 text-xs font-medium"} ${t.primaryBtnBg} ${t.primaryBtnText} ${t.primaryBtnHoverBg} ${t.primaryBtnRadius} transition-all`}
        >
          {isMono ? "+ new" : "+ New Invoice"}
        </button>
      </div>

      <div className={`grid grid-cols-4 ${isMono ? "gap-px bg-neutral-200 mb-8" : "gap-4 mb-8"}`}>
        {kpiCards.map((card) => (
          <div key={card.label} className={`${t.cardBg} ${t.cardRadius} ${isMono ? "p-3" : "p-5"} ${t.cardShadow}`}>
            <div className={`${isMono ? "text-[9px]" : "text-[10px]"} font-semibold ${t.labelColor} uppercase tracking-wider mb-2`}>
              {isMono ? card.monoLabel : card.label}
            </div>
            <div className={`${isMono ? "text-sm font-medium" : "text-2xl font-light"} ${card.accent} tabular-nums`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className={`flex gap-1 mb-6 ${isMono ? "border-b border-neutral-200 pb-2" : ""}`}>
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`${isMono ? "text-xs uppercase tracking-widest px-2 py-1" : "text-xs font-medium px-3 py-1.5 rounded-lg"} transition-colors ${
              filter === f.value
                ? isMono ? "text-neutral-900 border-b border-neutral-900" : "text-neutral-900 bg-neutral-100"
                : isMono ? "text-neutral-400 hover:text-neutral-700" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
            }`}
          >
            {isMono ? f.monoLabel : f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={`text-center py-12 ${t.labelColor}`}>
          <p className={`${isMono ? "text-xs" : "text-sm"}`}>
            {filter === "all" ? "No invoices yet. Create your first invoice to get started." : `No ${filter} invoices.`}
          </p>
        </div>
      ) : (
        <div className={`${isMono ? "" : "space-y-2"}`}>
          <div className={`grid grid-cols-12 gap-4 ${isMono ? "pb-2 border-b border-neutral-200" : "px-4 pb-2"}`}>
            <div className={`col-span-2 text-[${isMono ? "9px" : "10px"}] font-semibold ${t.labelColor} uppercase tracking-wider`}>Number</div>
            <div className={`col-span-3 text-[${isMono ? "9px" : "10px"}] font-semibold ${t.labelColor} uppercase tracking-wider`}>Customer</div>
            <div className={`col-span-2 text-[${isMono ? "9px" : "10px"}] font-semibold ${t.labelColor} uppercase tracking-wider`}>Date</div>
            <div className={`col-span-2 text-[${isMono ? "9px" : "10px"}] font-semibold ${t.labelColor} uppercase tracking-wider`}>Due</div>
            <div className={`col-span-2 text-[${isMono ? "9px" : "10px"}] font-semibold ${t.labelColor} uppercase tracking-wider text-right`}>Amount</div>
            <div className={`col-span-1 text-[${isMono ? "9px" : "10px"}] font-semibold ${t.labelColor} uppercase tracking-wider text-right`}>Status</div>
          </div>

          {filtered.map((inv) => {
            const overdue = isOverdue(inv.dueDate, inv.status) && inv.status !== "paid";
            return (
              <div key={`${inv.source}-${inv.id}`} className={`grid grid-cols-12 gap-4 items-center ${t.cardBg} ${t.cardRadius} ${isMono ? "py-2" : "px-4 py-3"} ${t.cardShadow} ${t.cardHoverShadow} transition-shadow`}>
                <div className={`col-span-2 ${isMono ? "text-[13px] font-medium" : "text-sm font-medium"} ${t.inputText}`}>#{inv.number}</div>
                <div className={`col-span-3 ${isMono ? "text-[13px]" : "text-sm"} ${t.inputText} truncate`}>{inv.customerName || (inv.source === "draft" ? "Draft" : "\u2014")}</div>
                <div className={`col-span-2 ${isMono ? "text-[13px]" : "text-xs"} ${t.labelColor}`}>{formatDate(inv.issueDate)}</div>
                <div className={`col-span-2 ${isMono ? "text-[13px]" : "text-xs"} ${overdue ? "text-red-600 font-medium" : t.labelColor}`}>
                  {formatDate(inv.dueDate)}{overdue && !isMono && <span className="ml-1 text-red-500">!</span>}
                </div>
                <div className={`col-span-2 ${isMono ? "text-[13px]" : "text-sm font-medium"} ${t.inputText} text-right tabular-nums`}>
                  {formatMoney(inv.total, inv.currency as Currency, { decimals: false })}
                </div>
                <div className="col-span-1 text-right">
                  <span className={`inline-block ${isMono ? "text-[9px] uppercase tracking-widest" : "text-[10px] font-medium px-2 py-0.5 rounded-full"} ${statusColor(overdue ? "overdue" : inv.status, inv.dueDate)}`}>
                    {overdue && inv.status !== "overdue" ? "overdue" : inv.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
