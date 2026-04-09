"use client";

import { useState, useCallback, useMemo } from "react";
import { useTheme } from "./ThemeContext";
import type { Currency, Invoice, LineItem, Party, PaymentDetails } from "@/types/invoice";
import { computeInvoiceTotals, nextStatus } from "@/types/invoice";
import { createSampleInvoice, createEmptyLineItem } from "@/lib/invoice/sample";
import { downloadInvoicePDF } from "@/lib/pdf/download";
import { validateInvoice, type ValidationErrors } from "@/lib/invoice/validation";
import { formatMoney } from "@/lib/currency/format";
import { archiveInvoice } from "@/lib/invoice/archive";
import { deleteDraft } from "@/lib/invoice/drafts";
import { saveTemplate } from "@/lib/recurring/store";
import type { RecurringInterval } from "@/types/recurring";
import { PartySection } from "./PartySection";

function statusLabel(status: Invoice["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function FieldError({ path, errors }: { path: string; errors: ValidationErrors }) {
  const msg = errors[path];
  if (!msg) return null;
  return <span className="text-xs text-red-500 mt-0.5 block">{msg}</span>;
}

export interface InvoiceFormProps {
  initialInvoice?: Invoice;
  onSave?: (invoice: Invoice) => void;
  onCreated?: (invoice: Invoice) => void;
}

export function InvoiceForm({ initialInvoice, onSave, onCreated }: InvoiceFormProps) {
  const { theme } = useTheme();
  const t = theme;
  const isMono = t.id === "minimal-mono";

  const [invoice, setInvoice] = useState<Invoice>(() => initialInvoice ?? createSampleInvoice());
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [hasAttemptedCreate, setHasAttemptedCreate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTemplateSaved, setShowTemplateSaved] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateInterval, setTemplateInterval] = useState<RecurringInterval>("monthly");
  const totals = useMemo(() => computeInvoiceTotals(invoice), [invoice]);

  const revalidate = useCallback((inv: Invoice) => {
    const result = validateInvoice(inv);
    setValidationErrors(result.errors);
    return result.success;
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    setIsGenerating(true);
    try {
      await downloadInvoicePDF(invoice, t.id);
    } catch (err) {
      console.error("Failed to generate invoice PDF", err);
    } finally {
      setIsGenerating(false);
    }
  }, [invoice]);

  const updateField = useCallback(
    <K extends keyof Invoice>(key: K, value: Invoice[K]) => {
      setInvoice((prev) => {
        const next = { ...prev, [key]: value };
        if (hasAttemptedCreate) revalidate(next);
        return next;
      });
    },
    [hasAttemptedCreate, revalidate]
  );


  const updateLineItem = useCallback(
    <K extends keyof LineItem>(id: string, key: K, value: LineItem[K]) => {
      setInvoice((prev) => {
        const next = {
          ...prev,
          lineItems: prev.lineItems.map((item) =>
            item.id === id ? { ...item, [key]: value } : item
          ),
        };
        if (hasAttemptedCreate) revalidate(next);
        return next;
      });
    },
    [hasAttemptedCreate, revalidate]
  );

  const addLineItem = useCallback(() => {
    setInvoice((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, createEmptyLineItem()],
    }));
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setInvoice((prev) => {
      if (prev.lineItems.length <= 1) return prev;
      return { ...prev, lineItems: prev.lineItems.filter((item) => item.id !== id) };
    });
  }, []);

  const cycleStatus = useCallback(() => {
    setInvoice((prev) => ({ ...prev, status: nextStatus(prev.status) }));
  }, []);

  const fillParty = useCallback((which: "supplier" | "customer", party: Party) => {
    setInvoice((prev) => {
      const next = { ...prev, [which]: party };
      if (hasAttemptedCreate) revalidate(next);
      return next;
    });
  }, [hasAttemptedCreate, revalidate]);

  const updatePaymentDetail = useCallback(
    (key: keyof PaymentDetails, value: string) => {
      setInvoice((prev) => ({
        ...prev,
        paymentDetails: { ...prev.paymentDetails, [key]: value },
      }));
    },
    []
  );

  const handleSaveTemplate = useCallback(() => {
    if (!templateName.trim()) return;
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `tpl-${Date.now()}`;
    saveTemplate({
      id,
      name: templateName.trim(),
      interval: templateInterval,
      contactId: "",
      contactName: invoice.customer.name,
      currency: invoice.currency,
      vatRate: invoice.vatRate,
      lineItems: invoice.lineItems,
      paymentDetails: invoice.paymentDetails,
      createdAt: new Date().toISOString(),
      lastUsedAt: "",
    });
    setShowTemplateForm(false);
    setTemplateName("");
    setShowTemplateSaved(true);
    setTimeout(() => setShowTemplateSaved(false), 2000);
  }, [templateName, templateInterval, invoice]);

  const dateFields: Array<{
    label: string;
    shortLabel: string;
    key: "issueDate" | "dueDate" | "taxPoint";
  }> = [
    { label: "Issue Date", shortLabel: "Date", key: "issueDate" },
    { label: "Due Date", shortLabel: "Due", key: "dueDate" },
    { label: "Tax Point", shortLabel: "Tax Date", key: "taxPoint" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className={`mb-12 ${isMono ? "border-b border-neutral-200 pb-4" : ""}`}>
        <div className={`flex ${isMono ? "items-baseline justify-between" : "items-end justify-between"}`}>
          <div>
            {t.useHandwritten ? (
              <span className={`font-[family-name:var(--font-caveat)] text-3xl ${t.headerTitle} block leading-none`}>
                Invoice
              </span>
            ) : (
              <span className={`text-[13px] uppercase tracking-widest ${t.headerTitle} block mb-1`}>
                Invoice
              </span>
            )}
            <div className={`flex items-baseline gap-0 ${t.id === "paper-perfect" ? "mt-1" : ""}`}>
              {isMono && <span className={`text-sm font-medium ${t.headerNumber}`}>#</span>}
              <input
                type="text"
                value={invoice.number}
                onChange={(e) => updateField("number", e.target.value)}
                className={`${isMono ? "text-sm font-medium w-24" : "text-5xl font-extralight w-64"} ${t.headerNumber} tracking-tight bg-transparent focus:outline-none ${hasAttemptedCreate && validationErrors["number"] ? "border-b border-red-400" : ""}`}
              />
            </div>
            {hasAttemptedCreate && <FieldError path="number" errors={validationErrors} />}
          </div>
          <div className={t.id === "paper-perfect" ? "pb-1" : ""}>
            <button
              type="button"
              onClick={cycleStatus}
              className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
              title="Click to advance status"
            >
              <div className={`w-2 h-2 rounded-full ${t.statusDot} ${t.statusDotGlow}`} />
              <span className={`${isMono ? "text-xs" : "text-sm font-medium"} ${t.statusText}`}>
                {statusLabel(invoice.status)}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Dates Section */}
      <div className="mb-10">
        {t.useHandwritten && (
          <span className={`font-[family-name:var(--font-caveat)] text-xl ${t.sectionLabel} block mb-4`}>
            Key Dates
          </span>
        )}
        <div className={`grid grid-cols-4 ${isMono ? "gap-px bg-neutral-200" : "gap-3"}`}>
          {dateFields.map((field) => (
            <div
              key={field.key}
              className={`${t.cardBg} ${t.cardRadius} ${t.cardPadding} ${t.cardShadow} ${t.cardHoverShadow} transition-shadow duration-300`}
            >
              <label className={`text-[${isMono ? "9px" : "10px"}] font-semibold ${t.labelColor} uppercase tracking-wider block mb-${isMono ? "1" : "2"}`}>
                {isMono ? field.shortLabel : field.label}
              </label>
              <input
                type="date"
                value={invoice[field.key]}
                onChange={(e) => updateField(field.key, e.target.value)}
                className={`w-full ${isMono ? "text-[13px]" : "text-[15px] font-medium"} ${t.inputText} bg-transparent focus:outline-none`}
              />
            </div>
          ))}
          <div
            className={`${t.cardBg} ${t.cardRadius} ${t.cardPadding} ${t.cardShadow} ${t.cardHoverShadow} transition-shadow duration-300`}
          >
            <label className={`text-[${isMono ? "9px" : "10px"}] font-semibold ${t.labelColor} uppercase tracking-wider block mb-${isMono ? "1" : "2"}`}>
              {isMono ? "Curr." : "Currency"}
            </label>
            <select
              value={invoice.currency}
              onChange={(e) => updateField("currency", e.target.value as Currency)}
              className={`w-full ${isMono ? "text-[13px]" : "text-[15px] font-medium"} ${t.inputText} bg-transparent focus:outline-none cursor-pointer`}
            >
              <option value="CZK">CZK</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="mb-10">
        <div className={`grid grid-cols-2 ${isMono ? "gap-8" : "gap-5"}`}>
          <PartySection
            party={invoice.supplier}
            partyKey="supplier"
            label="Supplier"
            handwrittenLabel="From"
            bgClass={t.partyFromBg}
            iconBgClass={t.partyIconBg}
            iconColorClass={t.partyIconColor}
            iconPath="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            onChange={(p) => fillParty("supplier", p)}
            validationErrors={validationErrors}
            showValidation={hasAttemptedCreate}
            countryHint={invoice.currency === "CZK" ? "CZ" : "EU"}
          />
          <PartySection
            party={invoice.customer}
            partyKey="customer"
            label="Customer"
            handwrittenLabel="To"
            bgClass={t.partyToBg}
            iconBgClass={t.partyToIconBg}
            iconColorClass={t.partyToIconColor}
            iconPath="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            onChange={(p) => fillParty("customer", p)}
            validationErrors={validationErrors}
            showValidation={hasAttemptedCreate}
            countryHint={invoice.currency === "CZK" ? "CZ" : "EU"}
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          {t.useHandwritten ? (
            <span className={`font-[family-name:var(--font-caveat)] text-2xl ${t.sectionLabel}`}>Items</span>
          ) : (
            <span className={`text-[13px] uppercase tracking-widest ${t.labelColor}`}>Items</span>
          )}
          {hasAttemptedCreate && <FieldError path="lineItems" errors={validationErrors} />}
          <button
            type="button"
            onClick={addLineItem}
            className={`${isMono ? "text-xs" : "text-[13px] font-semibold"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} uppercase tracking-wider transition-colors flex items-center gap-1.5 group`}
          >
            {t.id === "paper-perfect" && (
              <span className="w-5 h-5 rounded-full bg-[#EDE8E3] group-hover:bg-[#E0D9D2] flex items-center justify-center transition-colors">
                <span className="text-sm leading-none">+</span>
              </span>
            )}
            {isMono && "+ "}Add Item
          </button>
        </div>

        {/* Table Container */}
        <div className={`${t.id === "paper-perfect" ? "bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] overflow-hidden" : ""}`}>
          {/* Header */}
          <div className={`grid grid-cols-12 gap-4 ${t.id === "paper-perfect" ? "px-5 py-3" : "pb-2 border-b border-neutral-200"} ${t.tableHeaderBg}`}>
            <div className={`col-span-${isMono ? "6" : "5"} text-[${isMono ? "9px" : "10px"}] font-semibold ${t.tableHeaderText} uppercase tracking-wider`}>
              {isMono ? "Item" : "Description"}
            </div>
            <div className={`col-span-2 text-[${isMono ? "9px" : "10px"}] font-semibold ${t.tableHeaderText} uppercase tracking-wider text-center`}>
              Qty
            </div>
            <div className={`col-span-2 text-[${isMono ? "9px" : "10px"}] font-semibold ${t.tableHeaderText} uppercase tracking-wider text-right`}>
              {isMono ? "Unit" : "Price"}
            </div>
            <div className={`col-span-${isMono ? "2" : "3"} text-[${isMono ? "9px" : "10px"}] font-semibold ${t.tableHeaderText} uppercase tracking-wider text-right`}>
              Amount
            </div>
          </div>

          {/* Rows */}
          <div className={isMono ? "divide-y divide-neutral-100" : ""}>
            {invoice.lineItems.map((item, i, arr) => {
              const lineAmount = item.quantity * item.unitPrice;
              return (
                <div key={item.id}>
                  <div className={`grid grid-cols-12 gap-4 ${t.id === "paper-perfect" ? "px-5 py-4" : "py-2"} items-center ${t.tableRowHoverBg} transition-colors`}>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                      className={`col-span-${isMono ? "6" : "5"} ${isMono ? "text-[13px]" : "text-[15px]"} ${t.inputText} bg-transparent focus:outline-none`}
                    />
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value) || 0)}
                      className={`col-span-2 ${isMono ? "text-[13px] text-neutral-600" : "text-[15px]"} ${t.id === "paper-perfect" ? t.inputText : ""} text-center bg-transparent focus:outline-none`}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, "unitPrice", Number(e.target.value) || 0)}
                      className={`col-span-2 ${isMono ? "text-[13px] text-neutral-600" : "text-[15px]"} ${t.id === "paper-perfect" ? t.inputText : ""} text-right bg-transparent focus:outline-none`}
                    />
                    <div className={`${isMono ? "col-span-1" : "col-span-2"} ${isMono ? "text-[13px]" : "text-[15px] font-semibold"} ${t.inputText} text-right tabular-nums`}>
                      {formatMoney(lineAmount, invoice.currency, { symbolOnly: true })}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      disabled={invoice.lineItems.length <= 1}
                      className="col-span-1 text-center text-neutral-400 hover:text-red-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title="Remove item"
                    >
                      <svg className={`${isMono ? "w-3 h-3" : "w-4 h-4"} inline`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {t.id === "paper-perfect" && i < arr.length - 1 && (
                    <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#E8E4DF] to-transparent" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className={`${isMono ? "w-40" : "w-80"}`}>
          <div className={`${t.summaryBg} ${t.id === "paper-perfect" ? "rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)]" : ""}`}>
            {t.useHandwritten && (
              <span className={`font-[family-name:var(--font-caveat)] text-xl ${t.sectionLabel} block mb-4`}>Summary</span>
            )}
            <div className={`space-y-${isMono ? "0" : "3"}`}>
              <div className={`flex justify-between items-center ${isMono ? "py-1" : ""}`}>
                <span className={`${isMono ? "text-xs" : "text-sm"} ${t.summaryLabelColor}`}>Subtotal</span>
                <span className={`${isMono ? "text-xs" : "text-sm font-medium"} ${t.summaryValueColor} tabular-nums`}>
                  {formatMoney(totals.subtotal, invoice.currency, { symbolOnly: true })}
                </span>
              </div>
              <div className={`flex justify-between items-center ${isMono ? "py-1" : ""}`}>
                <span className={`${isMono ? "text-xs" : "text-sm"} ${t.summaryLabelColor}`}>VAT {Math.round(invoice.vatRate * 100)}%</span>
                <span className={`${isMono ? "text-xs" : "text-sm font-medium"} ${t.summaryValueColor} tabular-nums`}>
                  {formatMoney(totals.vat, invoice.currency, { symbolOnly: true })}
                </span>
              </div>
              <div className={`${isMono ? "border-t mt-1 py-2" : "h-px my-3"} ${t.summaryDivider}`} />
              <div className={`flex justify-between items-${isMono ? "center" : "end"} ${isMono ? "pt-0" : "pt-0"}`}>
                {t.useHandwritten ? (
                  <span className={`font-[family-name:var(--font-caveat)] text-2xl ${t.totalLabelColor}`}>Total</span>
                ) : (
                  <span className={`text-xs ${t.totalLabelColor}`}>Total</span>
                )}
                <div className={t.id === "paper-perfect" ? "text-right" : ""}>
                  <span className={`${isMono ? "text-xs font-medium" : "text-3xl font-light"} ${t.totalValueColor} tabular-nums ${t.id === "paper-perfect" ? "tracking-tight" : ""}`}>
                    {formatMoney(totals.total, invoice.currency, { decimals: false, symbolOnly: true })}
                  </span>
                  <span className={`${isMono ? "text-xs" : "text-sm ml-1.5 font-medium"} ${t.totalCurrencyColor}`}>
                    {isMono ? " " : ""}{invoice.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="mb-10">
        <div className="mb-4">
          {t.useHandwritten ? (
            <span className={`font-[family-name:var(--font-caveat)] text-2xl ${t.sectionLabel}`}>Payment</span>
          ) : (
            <span className={`text-[11px] uppercase tracking-widest ${t.labelColor}`}>Payment Details</span>
          )}
        </div>
        <div className={`${t.cardBg} ${t.cardRadius} ${isMono ? "p-3" : "p-5"} ${t.cardShadow}`}>
          <div className={`grid grid-cols-2 gap-${isMono ? "2" : "4"}`}>
            <div>
              <label className={`text-[11px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>IBAN</label>
              <input
                type="text"
                placeholder="CZ65 0800 0000 0012 3456 7899"
                value={invoice.paymentDetails.iban}
                onChange={(e) => updatePaymentDetail("iban", e.target.value)}
                className={`w-full ${isMono ? "text-[13px]" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${isMono ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors font-mono`}
              />
            </div>
            <div>
              <label className={`text-[11px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>SWIFT / BIC</label>
              <input
                type="text"
                placeholder="GIBACZPX"
                value={invoice.paymentDetails.swift}
                onChange={(e) => updatePaymentDetail("swift", e.target.value)}
                className={`w-full ${isMono ? "text-[13px]" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${isMono ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors font-mono`}
              />
            </div>
            <div>
              <label className={`text-[11px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Bank Name</label>
              <input
                type="text"
                placeholder="Česká spořitelna"
                value={invoice.paymentDetails.bankName}
                onChange={(e) => updatePaymentDetail("bankName", e.target.value)}
                className={`w-full ${isMono ? "text-[13px]" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${isMono ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors`}
              />
            </div>
            <div>
              <label className={`text-[11px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Reference / VS</label>
              <input
                type="text"
                placeholder="Variable symbol"
                value={invoice.paymentDetails.reference}
                onChange={(e) => updatePaymentDetail("reference", e.target.value)}
                className={`w-full ${isMono ? "text-[13px]" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${isMono ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors font-mono`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Success Confirmation */}
      {showSuccess && (
        <div
          onClick={() => setShowSuccess(false)}
          className={`mb-8 ${isMono ? "border border-neutral-900 p-4" : "rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)]"} ${isMono ? "bg-white" : "bg-emerald-50"} cursor-pointer transition-all`}
        >
          <div className="flex items-center gap-3">
            {!isMono && (
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div>
              <div className={`${isMono ? "text-xs font-medium" : "text-sm font-semibold text-emerald-900"}`}>
                {isMono ? "OK" : "Invoice Created"}
              </div>
              <div className={`${isMono ? "text-xs text-neutral-500" : "text-xs text-emerald-700"} mt-0.5`}>
                #{invoice.number} — {formatMoney(totals.total, invoice.currency, { decimals: false })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Form (inline) */}
      {showTemplateForm && (
        <div className={`mb-6 ${t.cardBg} ${t.cardRadius} ${isMono ? "p-3" : "p-5"} ${t.cardShadow}`}>
          <div className={`${isMono ? "text-[13px] uppercase tracking-widest mb-2" : "text-xs font-semibold uppercase tracking-wider mb-3"} ${t.labelColor}`}>
            Save as Recurring Template
          </div>
          <div className={`grid grid-cols-3 gap-${isMono ? "2" : "3"}`}>
            <div className="col-span-2">
              <input
                type="text"
                placeholder="Template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className={`w-full ${isMono ? "text-[13px]" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${isMono ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors`}
              />
            </div>
            <select
              value={templateInterval}
              onChange={(e) => setTemplateInterval(e.target.value as RecurringInterval)}
              className={`${isMono ? "text-[13px]" : "text-sm"} ${t.inputText} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none cursor-pointer`}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end mt-3">
            <button type="button" onClick={() => setShowTemplateForm(false)} className={`${isMono ? "text-xs" : "text-xs font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} transition-colors`}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveTemplate}
              disabled={!templateName.trim()}
              className={`${isMono ? "text-xs uppercase tracking-widest border-b border-neutral-900 pb-0.5" : "px-3 py-1.5 text-xs font-medium"} ${t.primaryBtnBg} ${t.primaryBtnText} ${t.primaryBtnHoverBg} ${t.primaryBtnRadius} transition-all disabled:opacity-50`}
            >
              {isMono ? "save tpl" : "Save Template"}
            </button>
          </div>
        </div>
      )}

      {showTemplateSaved && (
        <div className={`mb-4 text-center ${isMono ? "text-xs" : "text-sm font-medium"} text-emerald-600`}>
          {isMono ? "template saved" : "Template saved!"}
        </div>
      )}

      {/* Actions */}
      <div className={`flex gap-4 justify-end ${isMono ? "border-t border-neutral-200 pt-6" : ""}`}>
        <button
          type="button"
          onClick={() => setShowTemplateForm(!showTemplateForm)}
          className={`${isMono ? "text-xs uppercase tracking-widest" : "px-6 py-3 text-sm font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} ${t.secondaryBtnBorder} transition-colors`}
        >
          {isMono ? "Tpl" : "Save Template"}
        </button>
        <button
          type="button"
          onClick={() => onSave?.(invoice)}
          className={`${isMono ? "text-xs uppercase tracking-widest" : "px-6 py-3 text-sm font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} ${t.secondaryBtnBorder} transition-colors`}
        >
          {isMono ? "Draft" : "Save Draft"}
        </button>
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className={`${isMono ? "text-xs uppercase tracking-widest" : "px-6 py-3 text-sm font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} ${t.secondaryBtnBorder} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isGenerating ? (isMono ? "..." : "Generating...") : isMono ? "PDF" : "Download PDF"}
        </button>
        <button
          type="button"
          onClick={() => {
            setHasAttemptedCreate(true);
            const valid = revalidate(invoice);
            if (valid) {
              const finalized = { ...invoice, status: "sent" as const };
              archiveInvoice(finalized);
              deleteDraft(invoice.id);
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 4000);
              onCreated?.(finalized);
            }
          }}
          disabled={hasAttemptedCreate && Object.keys(validationErrors).length > 0}
          className={`${isMono ? "text-xs uppercase tracking-widest border-b border-neutral-900 pb-0.5 hover:border-neutral-400" : "px-8 py-3"} ${t.primaryBtnBg} ${t.primaryBtnHoverBg} ${t.primaryBtnText} ${t.primaryBtnRadius} ${t.primaryBtnShadow} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isMono ? "Create" : "Create Invoice"}
        </button>
      </div>
    </div>
  );
}
