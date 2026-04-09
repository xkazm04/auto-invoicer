"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "./ThemeContext";
import type { Party } from "@/types/invoice";
import type { Contact } from "@/types/contact";
import { listContacts } from "@/lib/contacts/store";

interface ContactPickerProps {
  onSelect: (party: Party) => void;
}

export function ContactPicker({ onSelect }: ContactPickerProps) {
  const { theme: t } = useTheme();
  const isMono = t.id === "minimal-mono";
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(() =>
    typeof window !== "undefined" ? listContacts() : []
  );
  const ref = useRef<HTMLDivElement>(null);

  // Refresh contacts when opening
  const toggle = useCallback(() => {
    if (!open) setContacts(listContacts());
    setOpen((v) => !v);
  }, [open]);

  // Close on click outside
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
    (contact: Contact) => {
      const { id: _, ...party } = contact;
      onSelect(party);
      setOpen(false);
    },
    [onSelect]
  );

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={toggle}
        className={`${isMono ? "text-[13px]" : "text-xs font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} uppercase tracking-wider transition-colors`}
        title="Pick from saved contacts"
      >
        {isMono ? "[ contacts ]" : "Contacts"}
      </button>

      {open && (
        <div
          className={`absolute top-full left-0 mt-1 z-40 min-w-[200px] ${isMono ? "border border-neutral-200 bg-white" : "rounded-xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]"} overflow-hidden`}
        >
          {contacts.length === 0 ? (
            <div className={`${isMono ? "text-xs p-2" : "text-xs p-3"} ${t.labelColor}`}>
              No saved contacts
            </div>
          ) : (
            <div className={`max-h-48 overflow-y-auto ${isMono ? "divide-y divide-neutral-100" : ""}`}>
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => handleSelect(contact)}
                  className={`w-full text-left ${isMono ? "px-2 py-1.5" : "px-3 py-2"} hover:bg-neutral-50 transition-colors`}
                >
                  <div className={`${isMono ? "text-[13px]" : "text-sm"} ${t.inputText} font-medium truncate`}>
                    {contact.name}
                  </div>
                  {contact.taxId && (
                    <div className={`${isMono ? "text-[13px]" : "text-xs"} ${t.labelColor} truncate`}>
                      {contact.taxId}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
