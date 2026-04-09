"use client";

import { useState, useCallback, useRef, useEffect, memo } from "react";
import { useTheme } from "./ThemeContext";
import { listTemplates } from "@/lib/recurring/store";
import type { RecurringTemplate } from "@/types/recurring";
import { formatMoney } from "@/lib/currency/format";

interface TemplatePickerProps {
  onSelect: (template: RecurringTemplate) => void;
}

export const TemplatePicker = memo(function TemplatePicker({ onSelect }: TemplatePickerProps) {
  const { theme: t } = useTheme();
  const isMono = t.id === "minimal-mono";
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    if (!open) setTemplates(listTemplates());
    setOpen((v) => !v);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = useCallback(
    (template: RecurringTemplate) => {
      onSelect(template);
      setOpen(false);
    },
    [onSelect]
  );

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={toggle}
        className={`w-full text-left ${isMono ? "text-xs uppercase tracking-widest py-2" : "text-[13px] font-semibold py-2"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} transition-colors`}
      >
        {isMono ? "[ templates ]" : "From Template"}
      </button>

      {open && (
        <div className={`absolute top-full left-0 mt-1 z-40 w-full min-w-[220px] ${isMono ? "border border-neutral-200 bg-white" : "rounded-xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]"} overflow-hidden`}>
          {templates.length === 0 ? (
            <div className={`${isMono ? "text-xs p-2" : "text-xs p-3"} ${t.labelColor}`}>
              No templates saved yet
            </div>
          ) : (
            <div className={`max-h-64 overflow-y-auto ${isMono ? "divide-y divide-neutral-100" : ""}`}>
              {templates.map((tpl) => {
                const total = tpl.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0) * (1 + tpl.vatRate);
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelect(tpl)}
                    className={`w-full text-left ${isMono ? "px-2 py-2" : "px-3 py-2.5"} hover:bg-neutral-50 transition-colors`}
                  >
                    <div className={`${isMono ? "text-[13px]" : "text-sm"} ${t.inputText} font-medium truncate`}>
                      {tpl.name}
                    </div>
                    <div className={`${isMono ? "text-[11px]" : "text-xs"} ${t.labelColor} mt-0.5`}>
                      {tpl.interval} &middot; {tpl.contactName || "No contact"} &middot;{" "}
                      {formatMoney(total, tpl.currency, { decimals: false })}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
