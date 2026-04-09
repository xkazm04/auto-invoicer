import type { Invoice } from "@/types/invoice";
import type { RecurringTemplate } from "@/types/recurring";
import { getNextInvoiceNumber } from "./numbering";
import { loadSettings } from "@/lib/settings/store";
import { loadContact } from "@/lib/contacts/store";
import { updateTemplateLastUsed } from "@/lib/recurring/store";

/**
 * Create a new Invoice pre-filled from a recurring template.
 * Resolves the contact (if saved) to fill the customer party,
 * auto-fills supplier from settings, and generates a new invoice number.
 */
export function createInvoiceFromTemplate(template: RecurringTemplate): Invoice {
  const settings = typeof window !== "undefined" ? loadSettings() : null;
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

  // Resolve customer from contact store if possible
  let customer = { name: template.contactName, taxId: "", vatId: "", address: "", registrationId: "" };
  if (template.contactId) {
    const contact = loadContact(template.contactId);
    if (contact) {
      const { id: _, ...party } = contact;
      customer = party;
    }
  }

  updateTemplateLastUsed(template.id);

  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `inv-${Date.now()}`,
    number: typeof window !== "undefined" ? getNextInvoiceNumber() : "0000-0001",
    status: "draft",
    issueDate: today,
    dueDate: due,
    taxPoint: today,
    currency: template.currency,
    supplier: settings?.companyProfile ?? {
      name: "", taxId: "", vatId: "", address: "", registrationId: "",
    },
    customer,
    lineItems: template.lineItems.map((li) => ({
      ...li,
      id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    })),
    vatRate: template.vatRate,
    paymentDetails: template.paymentDetails.iban
      ? template.paymentDetails
      : settings?.defaultPaymentDetails ?? { iban: "", swift: "", bankName: "", reference: "" },
  };
}
