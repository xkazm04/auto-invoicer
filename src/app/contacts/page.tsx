"use client";

import { useState, useCallback } from "react";
import { useTheme } from "@/components/invoice/ThemeContext";
import type { Party } from "@/types/invoice";
import type { Contact } from "@/types/contact";
import {
  saveContact,
  updateContact,
  deleteContact,
  listContacts,
} from "@/lib/contacts/store";

const EMPTY_PARTY: Party = { name: "", taxId: "", vatId: "", address: "" };

export default function ContactsPage() {
  const { theme: t } = useTheme();
  const isMono = t.id === "minimal-mono";

  const [contacts, setContacts] = useState<Contact[]>(() =>
    typeof window !== "undefined" ? listContacts() : []
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Party>(EMPTY_PARTY);
  const [isAdding, setIsAdding] = useState(false);

  const refresh = useCallback(() => setContacts(listContacts()), []);

  const startAdd = useCallback(() => {
    setDraft(EMPTY_PARTY);
    setEditingId(null);
    setIsAdding(true);
  }, []);

  const startEdit = useCallback((contact: Contact) => {
    setDraft({ name: contact.name, taxId: contact.taxId, vatId: contact.vatId, address: contact.address });
    setEditingId(contact.id);
    setIsAdding(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!draft.name.trim()) return;
    if (editingId) {
      updateContact({ ...draft, id: editingId });
    } else {
      saveContact(draft);
    }
    setDraft(EMPTY_PARTY);
    setEditingId(null);
    setIsAdding(false);
    refresh();
  }, [draft, editingId, refresh]);

  const handleDelete = useCallback((id: string) => {
    deleteContact(id);
    if (editingId === id) {
      setEditingId(null);
      setDraft(EMPTY_PARTY);
    }
    refresh();
  }, [editingId, refresh]);

  const handleCancel = useCallback(() => {
    setDraft(EMPTY_PARTY);
    setEditingId(null);
    setIsAdding(false);
  }, []);

  const inputClass = `w-full ${isMono ? "text-[13px]" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${isMono ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        {t.useHandwritten ? (
          <span className={`font-[family-name:var(--font-caveat)] text-2xl ${t.sectionLabel}`}>Contacts</span>
        ) : (
          <span className={`text-[13px] uppercase tracking-widest ${t.labelColor}`}>Contacts</span>
        )}
        <button
          type="button"
          onClick={startAdd}
          className={`${isMono ? "text-xs" : "text-[13px] font-semibold"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} uppercase tracking-wider transition-colors`}
        >
          {isMono ? "+ new" : "+ New Contact"}
        </button>
      </div>

      {/* Add / Edit form */}
      {(isAdding || editingId) && (
        <div className={`mb-6 ${isMono ? "border border-neutral-200 p-3" : "rounded-2xl p-5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]"}`}>
          <div className={`${isMono ? "text-[13px]" : "text-xs font-semibold"} ${t.labelColor} uppercase tracking-wider mb-3`}>
            {editingId ? "Edit Contact" : "New Contact"}
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Tax ID"
                value={draft.taxId}
                onChange={(e) => setDraft((d) => ({ ...d, taxId: e.target.value }))}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="VAT ID"
                value={draft.vatId}
                onChange={(e) => setDraft((d) => ({ ...d, vatId: e.target.value }))}
                className={inputClass}
              />
            </div>
            <textarea
              placeholder="Address"
              rows={2}
              value={draft.address}
              onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
              className={`${inputClass} resize-none`}
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className={`${isMono ? "text-xs uppercase tracking-widest" : "px-4 py-2 text-xs font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} transition-colors`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!draft.name.trim()}
                className={`${isMono ? "text-xs uppercase tracking-widest border-b border-neutral-900 pb-0.5" : "px-4 py-2 text-xs"} ${t.primaryBtnBg} ${t.primaryBtnHoverBg} ${t.primaryBtnText} ${t.primaryBtnRadius} transition-all disabled:opacity-50`}
              >
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact list */}
      {contacts.length === 0 && !isAdding ? (
        <p className={`${isMono ? "text-[13px]" : "text-sm"} ${t.labelColor}`}>
          No contacts yet. Add one to get started.
        </p>
      ) : (
        <div className={`space-y-${isMono ? "1" : "2"}`}>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`group ${t.cardBg} ${t.cardRadius} ${isMono ? "py-2 px-3" : "p-4"} ${t.cardShadow} ${t.cardHoverShadow} transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className={`${isMono ? "text-xs font-medium" : "text-sm font-semibold"} ${t.inputText}`}>
                    {contact.name}
                  </div>
                  {(contact.taxId || contact.vatId) && (
                    <div className={`${isMono ? "text-[13px]" : "text-xs"} ${t.labelColor} mt-0.5`}>
                      {[contact.taxId && `Tax: ${contact.taxId}`, contact.vatId && `VAT: ${contact.vatId}`]
                        .filter(Boolean)
                        .join(" / ")}
                    </div>
                  )}
                  {contact.address && (
                    <div className={`${isMono ? "text-[13px]" : "text-xs"} ${t.labelColor} mt-0.5`}>
                      {contact.address}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => startEdit(contact)}
                    className={`${isMono ? "text-[13px]" : "text-xs"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} transition-colors`}
                  >
                    {isMono ? "edit" : "Edit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(contact.id)}
                    className={`${isMono ? "text-[13px]" : "text-xs"} text-neutral-400 hover:text-red-500 transition-colors`}
                  >
                    {isMono ? "del" : "Delete"}
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
