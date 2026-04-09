import type { Party, PaymentDetails, Currency } from "./invoice";

export interface AppSettings {
  companyProfile: Party;
  defaultPaymentDetails: PaymentDetails;
  defaultCurrency: Currency;
  defaultVatRate: number;
  invoiceNumberPrefix: string;
}

export function createDefaultSettings(): AppSettings {
  return {
    companyProfile: {
      name: "",
      taxId: "",
      vatId: "",
      address: "",
      registrationId: "",
    },
    defaultPaymentDetails: {
      iban: "",
      swift: "",
      bankName: "",
      reference: "",
    },
    defaultCurrency: "CZK",
    defaultVatRate: 0.21,
    invoiceNumberPrefix: "",
  };
}
