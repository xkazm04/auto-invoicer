"use client";

import { useState, useCallback } from "react";
import { useTheme } from "./ThemeContext";
import type { Currency, Invoice, LineItem, Party } from "@/types/invoice";
import { computeInvoiceTotals, nextStatus } from "@/types/invoice";
import { createSampleInvoice, createEmptyLineItem } from "@/lib/invoice/sample";
import { downloadInvoicePDF } from "@/lib/pdf/download";
import { validateInvoice, type ValidationErrors } from "@/lib/invoice/validation";
import { ContactPicker } from "./ContactPicker";
import { saveContact } from "@/lib/contacts/store";

type PartyKey = "supplier" | "customer";

function formatAmount(value: number, isMono: boolean, isTotal: boolean): string {
  const fractionDigits = isTotal || isMono ? 0 : 2;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

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
}

export function InvoiceForm({ initialInvoice, onSave }: InvoiceFormProps) {
  const { theme } = useTheme();
  const t = theme;
  const isMono = t.id === "minimal-mono";

  const [invoice, setInvoice] = useState<Invoice>(() => initialInvoice ?? createSampleInvoice());
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [hasAttemptedCreate, setHasAttemptedCreate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const totals = computeInvoiceTotals(invoice);

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

  const updateParty = useCallback(
    (which: PartyKey, key: keyof Party, value: string) => {
      setInvoice((prev) => {
        const next = { ...prev, [which]: { ...prev[which], [key]: value } };
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

  const fillParty = useCallback((which: PartyKey, party: Party) => {
    setInvoice((prev) => {
      const next = { ...prev, [which]: party };
      if (hasAttemptedCreate) revalidate(next);
      return next;
    });
  }, [hasAttemptedCreate, revalidate]);

  const [savedFlash, setSavedFlash] = useState<PartyKey | null>(null);
  const handleSaveContact = useCallback((which: PartyKey) => {
    const party = invoice[which];
    if (!party.name.trim()) return;
    saveContact(party);
    setSavedFlash(which);
    setTimeout(() => setSavedFlash(null), 1500);
  }, [invoice]);

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
          {/* Supplier */}
          <div className={`${t.partyFromBg} ${t.id === "paper-perfect" ? "rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)]" : ""}`}>
            <div className={`flex items-center gap-2 ${t.id === "paper-perfect" ? "mb-5" : "mb-3"}`}>
              {t.id === "paper-perfect" ? (
                <div className={`w-8 h-8 rounded-full ${t.partyIconBg} flex items-center justify-center`}>
                  <svg className={`w-4 h-4 ${t.partyIconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              ) : null}
              {t.useHandwritten ? (
                <span className={`font-[family-name:var(--font-caveat)] text-2xl ${t.partyIconColor}`}>From</span>
              ) : (
                <span className={`text-[13px] uppercase tracking-widest ${t.labelColor}`}>Supplier</span>
              )}
              <div className="ml-auto flex items-center gap-2">
                <ContactPicker onSelect={(p) => fillParty("supplier", p)} />
                {invoice.supplier.name.trim() && (
                  <button type="button" onClick={() => handleSaveContact("supplier")} className={`${isMono ? "text-[13px]" : "text-xs font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} transition-colors`}>
                    {savedFlash === "supplier" ? (isMono ? "ok" : "Saved!") : (isMono ? "save" : "Save")}
                  </button>
                )}
              </div>
            </div>
            <div className={`space-y-${isMono ? "1" : "4"}`}>
              <input
                type="text"
                placeholder="Company Name"
                value={invoice.supplier.name}
                onChange={(e) => updateParty("supplier", "name", e.target.value)}
                className={`w-full ${isMono ? "text-xs" : "text-base font-medium"} ${t.inputText} ${t.inputPlaceholder} bg-transparent focus:outline-none ${isMono ? "border-b border-neutral-100 pb-1 focus:border-neutral-900 transition-colors" : ""}`}
              />
              {hasAttemptedCreate && <FieldError path="supplier.name" errors={validationErrors} />}
              <div className={`grid grid-cols-2 gap-${isMono ? "2" : "3"}`}>
                <div>
                  <label className={`text-[13px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Tax ID</label>
                  <input
                    type="text"
                    placeholder="000-000-000"
                    value={invoice.supplier.taxId}
                    onChange={(e) => updateParty("supplier", "taxId", e.target.value)}
                    className={`w-full ${isMono ? "text-xs" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${isMono ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors`}
                  />
                </div>
                <div>
                  <label className={`text-[13px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>VAT ID</label>
                  <input
                    type="text"
                    placeholder="CZ000000000"
                    value={invoice.supplier.vatId}
                    onChange={(e) => updateParty("supplier", "vatId", e.target.value)}
                    className={`w-full ${isMono ? "text-xs" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${isMono ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors`}
                  />
                </div>
              </div>
              <div>
                <label className={`text-[13px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Address</label>
                <textarea
                  placeholder="Street, City, Country"
                  rows={2}
                  value={invoice.supplier.address}
                  onChange={(e) => updateParty("supplier", "address", e.target.value)}
                  className={`w-full ${isMono ? "text-xs" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} bg-transparent focus:outline-none resize-none leading-relaxed ${isMono ? "border-b border-neutral-100 pb-1 focus:border-neutral-900 transition-colors" : ""}`}
                />
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className={`${t.partyToBg} ${t.id === "paper-perfect" ? "rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)]" : ""}`}>
            <div className={`flex items-center gap-2 ${t.id === "paper-perfect" ? "mb-5" : "mb-3"}`}>
              {t.id === "paper-perfect" ? (
                <div className={`w-8 h-8 rounded-full ${t.partyToIconBg} flex items-center justify-center`}>
                  <svg className={`w-4 h-4 ${t.partyToIconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              ) : null}
              {t.useHandwritten ? (
                <span className={`font-[family-name:var(--font-caveat)] text-2xl ${t.partyToIconColor}`}>To</span>
              ) : (
                <span className={`text-[13px] uppercase tracking-widest ${t.labelColor}`}>Customer</span>
              )}
              <div className="ml-auto flex items-center gap-2">
                <ContactPicker onSelect={(p) => fillParty("customer", p)} />
                {invoice.customer.name.trim() && (
                  <button type="button" onClick={() => handleSaveContact("customer")} className={`${isMono ? "text-[13px]" : "text-xs font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} transition-colors`}>
                    {savedFlash === "customer" ? (isMono ? "ok" : "Saved!") : (isMono ? "save" : "Save")}
                  </button>
                )}
              </div>
            </div>
            <div className={`space-y-${isMono ? "1" : "4"}`}>
              <input
                type="text"
                placeholder="Client Name"
                value={invoice.customer.name}
                onChange={(e) => updateParty("customer", "name", e.target.value)}
                className={`w-full ${isMono ? "text-xs" : "text-base font-medium"} ${t.inputText} ${t.inputPlaceholder} bg-transparent focus:outline-none ${isMono ? "border-b border-neutral-100 pb-1 focus:border-neutral-900 transition-colors" : ""}`}
              />
              {hasAttemptedCreate && <FieldError path="customer.name" errors={validationErrors} />}
              <div className={`grid grid-cols-2 gap-${isMono ? "2" : "3"}`}>
                <div>
                  <label className={`text-[13px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Tax ID</label>
                  <input
                    type="text"
                    placeholder="000-000-000"
                    value={invoice.customer.taxId}
                    onChange={(e) => updateParty("customer", "taxId", e.target.value)}
                    className={`w-full ${isMono ? "text-xs" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${isMono ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors`}
                  />
                </div>
                <div>
                  <label className={`text-[13px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>VAT ID</label>
                  <input
                    type="text"
                    placeholder="CZ000000000"
                    value={invoice.customer.vatId}
                    onChange={(e) => updateParty("customer", "vatId", e.target.value)}
                    className={`w-full ${isMono ? "text-xs" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${isMono ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors`}
                  />
                </div>
              </div>
              <div>
                <label className={`text-[13px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Address</label>
                <textarea
                  placeholder="Street, City, Country"
                  rows={2}
                  value={invoice.customer.address}
                  onChange={(e) => updateParty("customer", "address", e.target.value)}
                  className={`w-full ${isMono ? "text-xs" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} bg-transparent focus:outline-none resize-none leading-relaxed ${isMono ? "border-b border-neutral-100 pb-1 focus:border-neutral-900 transition-colors" : ""}`}
                />
              </div>
            </div>
          </div>
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
                      {formatAmount(lineAmount, isMono, false)}
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
                  {formatAmount(totals.subtotal, isMono, false)}
                </span>
              </div>
              <div className={`flex justify-between items-center ${isMono ? "py-1" : ""}`}>
                <span className={`${isMono ? "text-xs" : "text-sm"} ${t.summaryLabelColor}`}>VAT {Math.round(invoice.vatRate * 100)}%</span>
                <span className={`${isMono ? "text-xs" : "text-sm font-medium"} ${t.summaryValueColor} tabular-nums`}>
                  {formatAmount(totals.vat, isMono, false)}
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
                    {formatAmount(totals.total, isMono, true)}
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
                #{invoice.number} — {formatAmount(totals.total, isMono, true)} {invoice.currency}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={`flex gap-4 justify-end ${isMono ? "border-t border-neutral-200 pt-6" : ""}`}>
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
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 4000);
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
