import type { Invoice } from "@/types/invoice";
import { getNextInvoiceNumber } from "./numbering";
import { loadSettings } from "@/lib/settings/store";

export function createSampleInvoice(): Invoice {
  const settings = typeof window !== "undefined" ? loadSettings() : null;
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `inv-${Date.now()}`,
    number:
      typeof window !== "undefined" ? getNextInvoiceNumber() : "0000-0001",
    status: "draft",
    issueDate: today,
    dueDate: due,
    taxPoint: today,
    currency: settings?.defaultCurrency ?? "CZK",
    supplier: settings?.companyProfile ?? {
      name: "",
      taxId: "",
      vatId: "",
      address: "",
      registrationId: "",
    },
    customer: {
      name: "",
      taxId: "",
      vatId: "",
      address: "",
      registrationId: "",
    },
    lineItems: [
      {
        id: "sample-1",
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ],
    vatRate: settings?.defaultVatRate ?? 0.21,
    paymentDetails: settings?.defaultPaymentDetails ?? {
      iban: "",
      swift: "",
      bankName: "",
      reference: "",
    },
  };
}

let nextLineItemId = 0;

export function createEmptyLineItem(): import("@/types/invoice").LineItem {
  nextLineItemId += 1;
  return {
    id: `item-${Date.now()}-${nextLineItemId}`,
    description: "",
    quantity: 1,
    unitPrice: 0,
  };
}
