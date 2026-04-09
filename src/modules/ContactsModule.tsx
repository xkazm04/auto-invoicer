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
import { PartySection } from "@/components/invoice/PartySection";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const EMPTY_PARTY: Party = { name: "", taxId: "", vatId: "", address: "", registrationId: "" };

export default function ContactsModule() {
  const { theme: t } = useTheme();
  const isMono = t.id === "minimal-mono";

  const [contacts, setContacts] = useState<Contact[]>(() =>
    typeof window !== "undefined" ? listContacts() : []
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Party>(EMPTY_PARTY);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const refresh = useCallback(() => setContacts(listContacts()), []);

  const startAdd = useCallback(() => {
    setDraft(EMPTY_PARTY);
    setEditingId(null);
    setIsAdding(true);
  }, []);

  const startEdit = useCallback((contact: Contact) => {
    setDraft({ name: contact.name, taxId: contact.taxId, vatId: contact.vatId, address: contact.address, registrationId: contact.registrationId || "" });
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

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteContact(deleteTarget);
    if (editingId === deleteTarget) {
      setEditingId(null);
      setDraft(EMPTY_PARTY);
    }
    setDeleteTarget(null);
    refresh();
  }, [deleteTarget, editingId, refresh]);

  const handleCancel = useCallback(() => {
    setDraft(EMPTY_PARTY);
    setEditingId(null);
    setIsAdding(false);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Contact"
        message="This contact will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
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

      {(isAdding || editingId) && (
        <div className="mb-6">
          <div className={`${isMono ? "text-[13px]" : "text-xs font-semibold"} ${t.labelColor} uppercase tracking-wider mb-3`}>
            {editingId ? "Edit Contact" : "New Contact"}
          </div>
          <PartySection
            party={draft}
            partyKey="contact"
            label={editingId ? "Edit" : "New"}
            handwrittenLabel={editingId ? "Edit" : "New"}
            bgClass={t.partyFromBg}
            iconBgClass={t.partyIconBg}
            iconColorClass={t.partyIconColor}
            iconPath="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            onChange={setDraft}
            countryHint="CZ"
          />
          <div className="flex gap-3 justify-end mt-3">
            <button type="button" onClick={handleCancel} className={`${isMono ? "text-xs uppercase tracking-widest" : "px-4 py-2 text-xs font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} transition-colors`}>
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={!draft.name.trim()} className={`${isMono ? "text-xs uppercase tracking-widest border-b border-neutral-900 pb-0.5" : "px-4 py-2 text-xs"} ${t.primaryBtnBg} ${t.primaryBtnHoverBg} ${t.primaryBtnText} ${t.primaryBtnRadius} transition-all disabled:opacity-50`}>
              {editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      {contacts.length === 0 && !isAdding ? (
        <p className={`${isMono ? "text-xs" : "text-sm"} ${t.labelColor}`}>
          No contacts yet. Add one to get started.
        </p>
      ) : (
        <div className={`space-y-${isMono ? "1" : "2"}`}>
          {contacts.map((contact) => (
            <div key={contact.id} className={`group ${t.cardBg} ${t.cardRadius} ${isMono ? "py-2 px-3" : "p-4"} ${t.cardShadow} ${t.cardHoverShadow} transition-shadow`}>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className={`${isMono ? "text-xs font-medium" : "text-sm font-semibold"} ${t.inputText}`}>{contact.name}</div>
                  {(contact.taxId || contact.vatId) && (
                    <div className={`${isMono ? "text-[13px]" : "text-xs"} ${t.labelColor} mt-0.5`}>
                      {[contact.taxId && `Tax: ${contact.taxId}`, contact.vatId && `VAT: ${contact.vatId}`].filter(Boolean).join(" / ")}
                    </div>
                  )}
                  {contact.address && (
                    <div className={`${isMono ? "text-[13px]" : "text-xs"} ${t.labelColor} mt-0.5`}>{contact.address}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => startEdit(contact)} className={`${isMono ? "text-[13px]" : "text-xs"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} transition-colors`}>
                    {isMono ? "edit" : "Edit"}
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(contact.id)} className={`${isMono ? "text-[13px]" : "text-xs"} text-neutral-400 hover:text-red-500 transition-colors`}>
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
