"use client";

import { useCallback, useMemo, memo } from "react";
import { useTheme } from "./ThemeContext";
import type { Invoice } from "@/types/invoice";
import { computeInvoiceTotals, nextStatus } from "@/types/invoice";
import { formatMoney } from "@/lib/currency/format";
import { archiveInvoice } from "@/lib/invoice/archive";
import { downloadInvoicePDF } from "@/lib/pdf/download";
import { QrPayment } from "./QrPayment";

interface InvoiceDetailProps {
  invoice: Invoice;
  onClose: () => void;
  onUpdated: () => void;
}

function statusColor(status: string): string {
  switch (status) {
    case "paid": return "text-emerald-700 bg-emerald-50";
    case "sent": return "text-blue-700 bg-blue-50";
    case "draft": return "text-neutral-500 bg-neutral-100";
    case "overdue": return "text-red-600 bg-red-50";
    default: return "text-neutral-500 bg-neutral-100";
  }
}

export const InvoiceDetail = memo(function InvoiceDetail({
  invoice,
  onClose,
  onUpdated,
}: InvoiceDetailProps) {
  const { theme: t } = useTheme();
  const isMono = t.id === "minimal-mono";
  const totals = useMemo(() => computeInvoiceTotals(invoice), [invoice]);

  const handleStatusAdvance = useCallback(() => {
    const updated = { ...invoice, status: nextStatus(invoice.status) };
    archiveInvoice(updated);
    onUpdated();
  }, [invoice, onUpdated]);

  const handleMarkPaid = useCallback(() => {
    const updated = { ...invoice, status: "paid" as const };
    archiveInvoice(updated);
    onUpdated();
  }, [invoice, onUpdated]);

  const handleDownloadPDF = useCallback(async () => {
    await downloadInvoicePDF(invoice, t.id);
  }, [invoice, t.id]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button + header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className={`${isMono ? "text-xs uppercase tracking-widest" : "text-xs font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} transition-colors`}
          >
            {isMono ? "< back" : "\u2190 Back"}
          </button>
          <div>
            {t.useHandwritten ? (
              <span className={`font-[family-name:var(--font-caveat)] text-3xl ${t.headerTitle}`}>
                #{invoice.number}
              </span>
            ) : (
              <span className={`text-[13px] uppercase tracking-widest ${t.headerTitle}`}>
                #{invoice.number}
              </span>
            )}
          </div>
        </div>
        <span className={`inline-block ${isMono ? "text-[9px] uppercase tracking-widest" : "text-[10px] font-medium px-3 py-1 rounded-full"} ${statusColor(invoice.status)}`}>
          {invoice.status}
        </span>
      </div>

      {/* Key info cards */}
      <div className={`grid grid-cols-4 ${isMono ? "gap-px bg-neutral-200 mb-8" : "gap-4 mb-8"}`}>
        <div className={`${t.cardBg} ${t.cardRadius} ${isMono ? "p-3" : "p-4"} ${t.cardShadow}`}>
          <div className={`text-[10px] font-semibold ${t.labelColor} uppercase tracking-wider mb-1`}>Issue Date</div>
          <div className={`${isMono ? "text-xs" : "text-sm"} ${t.inputText}`}>{invoice.issueDate || "\u2014"}</div>
        </div>
        <div className={`${t.cardBg} ${t.cardRadius} ${isMono ? "p-3" : "p-4"} ${t.cardShadow}`}>
          <div className={`text-[10px] font-semibold ${t.labelColor} uppercase tracking-wider mb-1`}>Due Date</div>
          <div className={`${isMono ? "text-xs" : "text-sm"} ${t.inputText}`}>{invoice.dueDate || "\u2014"}</div>
        </div>
        <div className={`${t.cardBg} ${t.cardRadius} ${isMono ? "p-3" : "p-4"} ${t.cardShadow}`}>
          <div className={`text-[10px] font-semibold ${t.labelColor} uppercase tracking-wider mb-1`}>Currency</div>
          <div className={`${isMono ? "text-xs" : "text-sm"} ${t.inputText}`}>{invoice.currency}</div>
        </div>
        <div className={`${t.cardBg} ${t.cardRadius} ${isMono ? "p-3" : "p-4"} ${t.cardShadow}`}>
          <div className={`text-[10px] font-semibold ${t.labelColor} uppercase tracking-wider mb-1`}>Total</div>
          <div className={`${isMono ? "text-xs font-medium" : "text-sm font-semibold"} ${t.inputText}`}>
            {formatMoney(totals.total, invoice.currency, { decimals: false })}
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className={`grid grid-cols-2 ${isMono ? "gap-4 mb-6" : "gap-5 mb-8"}`}>
        <div className={`${t.cardBg} ${t.cardRadius} ${isMono ? "p-3" : "p-5"} ${t.cardShadow}`}>
          <div className={`text-[10px] font-semibold ${t.labelColor} uppercase tracking-wider mb-2`}>Supplier</div>
          <div className={`${isMono ? "text-xs font-medium" : "text-sm font-semibold"} ${t.inputText}`}>{invoice.supplier.name || "\u2014"}</div>
          {invoice.supplier.vatId && <div className={`text-xs ${t.labelColor} mt-1`}>VAT: {invoice.supplier.vatId}</div>}
          {invoice.supplier.address && <div className={`text-xs ${t.labelColor} mt-1`}>{invoice.supplier.address}</div>}
        </div>
        <div className={`${t.cardBg} ${t.cardRadius} ${isMono ? "p-3" : "p-5"} ${t.cardShadow}`}>
          <div className={`text-[10px] font-semibold ${t.labelColor} uppercase tracking-wider mb-2`}>Customer</div>
          <div className={`${isMono ? "text-xs font-medium" : "text-sm font-semibold"} ${t.inputText}`}>{invoice.customer.name || "\u2014"}</div>
          {invoice.customer.vatId && <div className={`text-xs ${t.labelColor} mt-1`}>VAT: {invoice.customer.vatId}</div>}
          {invoice.customer.address && <div className={`text-xs ${t.labelColor} mt-1`}>{invoice.customer.address}</div>}
        </div>
      </div>

      {/* Line items */}
      <div className="mb-8">
        <div className={`text-[10px] font-semibold ${t.labelColor} uppercase tracking-wider mb-3`}>Items</div>
        <div className={`${t.cardBg} ${t.cardRadius} ${t.cardShadow} overflow-hidden`}>
          {invoice.lineItems.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center justify-between ${isMono ? "px-3 py-2" : "px-5 py-3"} ${i > 0 ? `border-t ${isMono ? "border-neutral-100" : "border-neutral-50"}` : ""}`}
            >
              <div className={`${isMono ? "text-xs" : "text-sm"} ${t.inputText}`}>{item.description || "\u2014"}</div>
              <div className={`flex items-center gap-4 ${isMono ? "text-xs" : "text-sm"} ${t.labelColor}`}>
                <span>{item.quantity} x {formatMoney(item.unitPrice, invoice.currency, { symbolOnly: true })}</span>
                <span className={`font-medium ${t.inputText} tabular-nums`}>
                  {formatMoney(item.quantity * item.unitPrice, invoice.currency, { symbolOnly: true })}
                </span>
              </div>
            </div>
          ))}
          {/* Totals */}
          <div className={`border-t ${isMono ? "border-neutral-200 px-3 py-2" : "border-neutral-100 px-5 py-3"}`}>
            <div className="flex justify-between">
              <span className={`${isMono ? "text-xs" : "text-sm"} ${t.labelColor}`}>Subtotal</span>
              <span className={`${isMono ? "text-xs" : "text-sm"} ${t.inputText} tabular-nums`}>
                {formatMoney(totals.subtotal, invoice.currency, { symbolOnly: true })}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span className={`${isMono ? "text-xs" : "text-sm"} ${t.labelColor}`}>VAT {Math.round(invoice.vatRate * 100)}%</span>
              <span className={`${isMono ? "text-xs" : "text-sm"} ${t.inputText} tabular-nums`}>
                {formatMoney(totals.vat, invoice.currency, { symbolOnly: true })}
              </span>
            </div>
            <div className={`flex justify-between mt-2 pt-2 border-t ${isMono ? "border-neutral-200" : "border-neutral-100"}`}>
              <span className={`${isMono ? "text-xs font-medium" : "text-sm font-semibold"} ${t.inputText}`}>Total</span>
              <span className={`${isMono ? "text-xs font-medium" : "text-lg font-semibold"} ${t.inputText} tabular-nums`}>
                {formatMoney(totals.total, invoice.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Payment */}
      <div className="mb-8">
        <QrPayment invoice={invoice} />
      </div>

      {/* Actions */}
      <div className={`flex gap-3 justify-end ${isMono ? "border-t border-neutral-200 pt-4" : ""}`}>
        {invoice.status !== "paid" && (
          <button
            type="button"
            onClick={handleMarkPaid}
            className={`${isMono ? "text-xs uppercase tracking-widest" : "px-4 py-2 text-xs font-medium rounded-lg"} text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors`}
          >
            {isMono ? "mark paid" : "Mark as Paid"}
          </button>
        )}
        {invoice.status !== "paid" && invoice.status !== "overdue" && (
          <button
            type="button"
            onClick={handleStatusAdvance}
            className={`${isMono ? "text-xs uppercase tracking-widest" : "px-4 py-2 text-xs font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} transition-colors`}
          >
            {isMono ? "advance" : `Advance to ${nextStatus(invoice.status)}`}
          </button>
        )}
        <button
          type="button"
          onClick={handleDownloadPDF}
          className={`${isMono ? "text-xs uppercase tracking-widest border-b border-neutral-900 pb-0.5" : "px-4 py-2 text-xs font-medium"} ${t.primaryBtnBg} ${t.primaryBtnText} ${t.primaryBtnHoverBg} ${t.primaryBtnRadius} transition-all`}
        >
          {isMono ? "pdf" : "Download PDF"}
        </button>
      </div>
    </div>
  );
});
