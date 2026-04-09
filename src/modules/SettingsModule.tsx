"use client";

import { useState, useCallback } from "react";
import { useTheme } from "@/components/invoice/ThemeContext";
import type { AppSettings } from "@/types/settings";
import { createDefaultSettings } from "@/types/settings";
import { loadSettings, saveSettings } from "@/lib/settings/store";
import { listTemplates, deleteTemplate } from "@/lib/recurring/store";
import type { RecurringTemplate } from "@/types/recurring";
import type { Currency, Party, PaymentDetails } from "@/types/invoice";
import { formatMoney } from "@/lib/currency/format";
import { PartySection } from "@/components/invoice/PartySection";

export default function SettingsModule() {
  const { theme: t } = useTheme();
  const isMono = t.id === "minimal-mono";

  const [settings, setSettings] = useState<AppSettings>(() =>
    typeof window !== "undefined" ? loadSettings() : createDefaultSettings()
  );
  const [saved, setSaved] = useState(false);
  const [templates, setTemplates] = useState<RecurringTemplate[]>(() =>
    typeof window !== "undefined" ? listTemplates() : []
  );

  const refreshTemplates = useCallback(() => setTemplates(listTemplates()), []);

  const handleDeleteTemplate = useCallback((id: string) => {
    deleteTemplate(id);
    refreshTemplates();
  }, [refreshTemplates]);

  const handleSave = useCallback(() => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

  const handleReset = useCallback(() => {
    const defaults = createDefaultSettings();
    setSettings(defaults);
    saveSettings(defaults);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const updateProfile = useCallback((party: Party) => {
    setSettings((prev) => ({ ...prev, companyProfile: party }));
  }, []);

  const updatePayment = useCallback((key: keyof PaymentDetails, value: string) => {
    setSettings((prev) => ({
      ...prev,
      defaultPaymentDetails: { ...prev.defaultPaymentDetails, [key]: value },
    }));
  }, []);

  const inputClass = `w-full ${isMono ? "text-[13px]" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${isMono ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        {t.useHandwritten ? (
          <span className={`font-[family-name:var(--font-caveat)] text-3xl ${t.headerTitle}`}>Settings</span>
        ) : (
          <span className={`text-[13px] uppercase tracking-widest ${t.labelColor}`}>Settings</span>
        )}
        <div className="flex gap-3 items-center">
          {saved && (
            <span className={`${isMono ? "text-xs" : "text-sm font-medium"} text-emerald-600`}>
              {isMono ? "ok" : "Saved!"}
            </span>
          )}
          <button type="button" onClick={handleReset} className={`${isMono ? "text-xs uppercase tracking-widest" : "px-4 py-2 text-xs font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} transition-colors`}>
            {isMono ? "reset" : "Reset Defaults"}
          </button>
          <button type="button" onClick={handleSave} className={`${isMono ? "text-xs uppercase tracking-widest border-b border-neutral-900 pb-0.5" : "px-4 py-2 text-xs font-medium"} ${t.primaryBtnBg} ${t.primaryBtnText} ${t.primaryBtnHoverBg} ${t.primaryBtnRadius} transition-all`}>
            {isMono ? "save" : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className={`${isMono ? "text-[13px] uppercase tracking-widest mb-3" : "text-xs font-semibold uppercase tracking-wider mb-4"} ${t.labelColor}`}>
          {isMono ? "company profile" : "Company Profile"}
        </div>
        <p className={`text-xs ${t.labelColor} mb-4`}>
          This information auto-fills the Supplier section on every new invoice.
        </p>
        <PartySection
          party={settings.companyProfile}
          partyKey="company"
          label="Your Company"
          handwrittenLabel="Your Company"
          bgClass={t.partyFromBg}
          iconBgClass={t.partyIconBg}
          iconColorClass={t.partyIconColor}
          iconPath="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          onChange={updateProfile}
          countryHint={settings.defaultCurrency === "CZK" ? "CZ" : "EU"}
        />
      </div>

      <div className="mb-8">
        <div className={`${isMono ? "text-[13px] uppercase tracking-widest mb-3" : "text-xs font-semibold uppercase tracking-wider mb-4"} ${t.labelColor}`}>
          {isMono ? "payment defaults" : "Default Payment Details"}
        </div>
        <div className={`${t.cardBg} ${t.cardRadius} ${isMono ? "p-3" : "p-5"} ${t.cardShadow}`}>
          <div className={`grid grid-cols-2 gap-${isMono ? "2" : "4"}`}>
            <div>
              <label className={`text-[11px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>IBAN</label>
              <input type="text" placeholder="CZ65 0800 0000 0012 3456 7899" value={settings.defaultPaymentDetails.iban} onChange={(e) => updatePayment("iban", e.target.value)} className={`${inputClass} font-mono`} />
            </div>
            <div>
              <label className={`text-[11px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>SWIFT / BIC</label>
              <input type="text" placeholder="GIBACZPX" value={settings.defaultPaymentDetails.swift} onChange={(e) => updatePayment("swift", e.target.value)} className={`${inputClass} font-mono`} />
            </div>
            <div>
              <label className={`text-[11px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Bank Name</label>
              <input type="text" placeholder="Ceska sporitelna" value={settings.defaultPaymentDetails.bankName} onChange={(e) => updatePayment("bankName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={`text-[11px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Reference / VS</label>
              <input type="text" placeholder="Variable symbol" value={settings.defaultPaymentDetails.reference} onChange={(e) => updatePayment("reference", e.target.value)} className={`${inputClass} font-mono`} />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className={`${isMono ? "text-[13px] uppercase tracking-widest mb-3" : "text-xs font-semibold uppercase tracking-wider mb-4"} ${t.labelColor}`}>
          {isMono ? "invoice defaults" : "Invoice Defaults"}
        </div>
        <div className={`${t.cardBg} ${t.cardRadius} ${isMono ? "p-3" : "p-5"} ${t.cardShadow}`}>
          <div className={`grid grid-cols-3 gap-${isMono ? "2" : "4"}`}>
            <div>
              <label className={`text-[11px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Currency</label>
              <select value={settings.defaultCurrency} onChange={(e) => setSettings((prev) => ({ ...prev, defaultCurrency: e.target.value as Currency }))} className={`${inputClass} cursor-pointer`}>
                <option value="CZK">CZK</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className={`text-[11px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>VAT Rate</label>
              <div className="flex items-center gap-1">
                <input type="number" min="0" max="100" step="1" value={Math.round(settings.defaultVatRate * 100)} onChange={(e) => setSettings((prev) => ({ ...prev, defaultVatRate: (Number(e.target.value) || 0) / 100 }))} className={inputClass} />
                <span className={`${isMono ? "text-xs" : "text-sm"} ${t.labelColor}`}>%</span>
              </div>
            </div>
            <div>
              <label className={`text-[11px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Number Prefix</label>
              <input type="text" placeholder="INV-" value={settings.invoiceNumberPrefix} onChange={(e) => setSettings((prev) => ({ ...prev, invoiceNumberPrefix: e.target.value }))} className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className={`${isMono ? "text-[13px] uppercase tracking-widest mb-3" : "text-xs font-semibold uppercase tracking-wider mb-4"} ${t.labelColor}`}>
          {isMono ? "recurring templates" : "Recurring Templates"}
        </div>
        <p className={`text-xs ${t.labelColor} mb-4`}>
          Templates are created from the invoice form using &quot;Save Template&quot;. Use them to quickly create recurring invoices.
        </p>

        {templates.length === 0 ? (
          <p className={`${isMono ? "text-xs" : "text-sm"} ${t.labelColor}`}>No templates yet. Create one from the invoice form.</p>
        ) : (
          <div className={`space-y-${isMono ? "1" : "2"}`}>
            {templates.map((tpl) => (
              <div key={tpl.id} className={`group ${t.cardBg} ${t.cardRadius} ${isMono ? "py-2 px-3" : "p-4"} ${t.cardShadow} ${t.cardHoverShadow} transition-shadow`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className={`${isMono ? "text-xs font-medium" : "text-sm font-semibold"} ${t.inputText}`}>{tpl.name}</div>
                    <div className={`${isMono ? "text-[13px]" : "text-xs"} ${t.labelColor} mt-0.5`}>
                      {tpl.interval} &middot; {tpl.contactName || "No contact"} &middot;{" "}
                      {tpl.lineItems.length} item{tpl.lineItems.length !== 1 ? "s" : ""} &middot;{" "}
                      {formatMoney(tpl.lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0) * (1 + tpl.vatRate), tpl.currency, { decimals: false })}
                    </div>
                  </div>
                  <button type="button" onClick={() => handleDeleteTemplate(tpl.id)} className={`opacity-0 group-hover:opacity-100 ${isMono ? "text-[13px]" : "text-xs"} text-neutral-400 hover:text-red-500 transition-all`}>
                    {isMono ? "del" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
