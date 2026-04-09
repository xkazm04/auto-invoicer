"use client";

import { useState, useCallback, memo } from "react";
import { useTheme } from "./ThemeContext";
import { ContactPicker } from "./ContactPicker";
import { saveContact } from "@/lib/contacts/store";
import { lookupVat } from "@/lib/vat/lookup";
import type { Party } from "@/types/invoice";
import type { ValidationErrors } from "@/lib/invoice/validation";

function FieldError({ path, errors }: { path: string; errors: ValidationErrors }) {
  const msg = errors[path];
  if (!msg) return null;
  return <span className="text-xs text-red-500 mt-0.5 block">{msg}</span>;
}

interface PartySectionProps {
  party: Party;
  partyKey: string;
  label: string;
  handwrittenLabel: string;
  bgClass: string;
  iconBgClass: string;
  iconColorClass: string;
  iconPath: string;
  onChange: (party: Party) => void;
  validationErrors?: ValidationErrors;
  showValidation?: boolean;
  countryHint?: string;
}

export const PartySection = memo(function PartySection({
  party,
  partyKey,
  label,
  handwrittenLabel,
  bgClass,
  iconBgClass,
  iconColorClass,
  iconPath,
  onChange,
  validationErrors = {},
  showValidation = false,
  countryHint = "CZ",
}: PartySectionProps) {
  const { theme: t } = useTheme();
  const isMono = t.id === "minimal-mono";

  const [lookingUp, setLookingUp] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const updateField = useCallback(
    (key: keyof Party, value: string) => {
      onChange({ ...party, [key]: value });
    },
    [party, onChange]
  );

  const handleLookup = useCallback(async () => {
    const vatId = party.vatId || party.taxId;
    if (!vatId.trim()) return;
    setLookingUp(true);
    try {
      const result = await lookupVat(vatId.trim(), countryHint);
      if (result.valid && result.name) {
        onChange({
          ...party,
          name: result.name || party.name,
          address: result.address || party.address,
          registrationId: result.registrationId || party.registrationId,
          taxId: result.taxId || party.taxId,
        });
      }
    } catch {
      // silently fail
    } finally {
      setLookingUp(false);
    }
  }, [party, onChange, countryHint]);

  const handleSave = useCallback(() => {
    if (!party.name.trim()) return;
    saveContact(party);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }, [party]);

  const inputClass = `w-full ${isMono ? "text-xs" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${isMono ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors`;

  return (
    <div className={`${bgClass} ${t.id === "paper-perfect" ? "rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)]" : ""}`}>
      <div className={`flex items-center gap-2 ${t.id === "paper-perfect" ? "mb-5" : "mb-3"}`}>
        {t.id === "paper-perfect" && (
          <div className={`w-8 h-8 rounded-full ${iconBgClass} flex items-center justify-center`}>
            <svg className={`w-4 h-4 ${iconColorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
            </svg>
          </div>
        )}
        {t.useHandwritten ? (
          <span className={`font-[family-name:var(--font-caveat)] text-2xl ${iconColorClass}`}>{handwrittenLabel}</span>
        ) : (
          <span className={`text-[13px] uppercase tracking-widest ${t.labelColor}`}>{label}</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <ContactPicker onSelect={(p) => onChange(p)} />
          {party.name.trim() && (
            <button type="button" onClick={handleSave} className={`${isMono ? "text-[13px]" : "text-xs font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} transition-colors`}>
              {savedFlash ? (isMono ? "ok" : "Saved!") : (isMono ? "save" : "Save")}
            </button>
          )}
        </div>
      </div>

      <div className={`space-y-${isMono ? "1" : "4"}`}>
        <input
          type="text"
          placeholder="Company Name"
          value={party.name}
          onChange={(e) => updateField("name", e.target.value)}
          className={`w-full ${isMono ? "text-xs" : "text-base font-medium"} ${t.inputText} ${t.inputPlaceholder} bg-transparent focus:outline-none ${isMono ? "border-b border-neutral-100 pb-1 focus:border-neutral-900 transition-colors" : ""}`}
        />
        {showValidation && <FieldError path={`${partyKey}.name`} errors={validationErrors} />}

        <div className={`grid grid-cols-2 gap-${isMono ? "2" : "3"}`}>
          <div>
            <label className={`text-[13px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Tax ID</label>
            <input type="text" placeholder="000-000-000" value={party.taxId} onChange={(e) => updateField("taxId", e.target.value)} className={inputClass} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className={`text-[13px] font-semibold ${t.labelColor} uppercase tracking-wider`}>VAT ID</label>
              <button
                type="button"
                onClick={handleLookup}
                disabled={lookingUp}
                className={`${isMono ? "px-2 py-0.5 text-[11px] border border-neutral-300 hover:border-neutral-900" : "px-2.5 py-0.5 text-[11px] font-semibold rounded-full"} ${t.primaryBtnBg} ${t.primaryBtnText} ${t.primaryBtnHoverBg} transition-all disabled:opacity-50`}
              >
                {lookingUp ? "..." : isMono ? "lookup" : "Lookup"}
              </button>
            </div>
            <input type="text" placeholder="CZ000000000" value={party.vatId} onChange={(e) => updateField("vatId", e.target.value)} className={inputClass} />
          </div>
        </div>

        {party.registrationId && (
          <div>
            <label className={`text-[13px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Reg. ID (IČO)</label>
            <input type="text" value={party.registrationId} onChange={(e) => updateField("registrationId", e.target.value)} className={`${inputClass} font-mono`} />
          </div>
        )}

        <div>
          <label className={`text-[13px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Address</label>
          <textarea
            placeholder="Street, City, Country"
            rows={2}
            value={party.address}
            onChange={(e) => updateField("address", e.target.value)}
            className={`w-full ${isMono ? "text-xs" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} bg-transparent focus:outline-none resize-none leading-relaxed ${isMono ? "border-b border-neutral-100 pb-1 focus:border-neutral-900 transition-colors" : ""}`}
          />
        </div>
      </div>
    </div>
  );
});
