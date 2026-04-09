import type { Invoice } from "@/types/invoice";

export function createSampleInvoice(): Invoice {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `inv-${Date.now()}`,
    number: "2024-0042",
    status: "draft",
    issueDate: "2024-12-02",
    dueDate: "2024-12-16",
    taxPoint: "2024-12-02",
    currency: "CZK",
    supplier: {
      name: "",
      taxId: "",
      vatId: "",
      address: "",
    },
    customer: {
      name: "",
      taxId: "",
      vatId: "",
      address: "",
    },
    lineItems: [
      {
        id: "sample-1",
        description: "Consulting Services",
        quantity: 10,
        unitPrice: 1500,
      },
      {
        id: "sample-2",
        description: "Development Hours",
        quantity: 40,
        unitPrice: 2000,
      },
    ],
    vatRate: 0.21,
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
