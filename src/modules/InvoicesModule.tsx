"use client";

import { useState, useCallback, memo } from "react";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { DraftsPanel } from "@/components/invoice/DraftsPanel";
import type { Invoice } from "@/types/invoice";
import { saveDraft, loadDraft } from "@/lib/invoice/drafts";
import { createSampleInvoice } from "@/lib/invoice/sample";

const MemoizedInvoiceForm = memo(InvoiceForm);

export default function InvoicesModule() {
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(createSampleInvoice);
  const [formKey, setFormKey] = useState(0);
  const [saveFlash, setSaveFlash] = useState(false);

  const handleSave = useCallback((invoice: Invoice) => {
    saveDraft(invoice);
    setCurrentInvoice(invoice);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  }, []);

  const handleLoadDraft = useCallback((id: string) => {
    const draft = loadDraft(id);
    if (draft) {
      setCurrentInvoice(draft);
      setFormKey((k) => k + 1);
    }
  }, []);

  const handleNewInvoice = useCallback(() => {
    const fresh = createSampleInvoice();
    setCurrentInvoice(fresh);
    setFormKey((k) => k + 1);
  }, []);

  return (
    <>
      {saveFlash && (
        <div className="fixed top-16 right-4 z-50 bg-green-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-pulse">
          Draft saved
        </div>
      )}
      <div className="max-w-4xl mx-auto flex gap-8">
        <aside className="w-56 shrink-0">
          <DraftsPanel
            onLoadDraft={handleLoadDraft}
            onNewInvoice={handleNewInvoice}
          />
        </aside>
        <div className="flex-1 min-w-0">
          <MemoizedInvoiceForm
            key={formKey}
            initialInvoice={currentInvoice}
            onSave={handleSave}
          />
        </div>
      </div>
    </>
  );
}
