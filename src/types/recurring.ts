import type { LineItem, Currency, PaymentDetails } from "./invoice";

export type RecurringInterval = "weekly" | "monthly" | "quarterly" | "yearly";

export interface RecurringTemplate {
  id: string;
  name: string;
  interval: RecurringInterval;
  contactId: string;
  contactName: string;
  currency: Currency;
  vatRate: number;
  lineItems: LineItem[];
  paymentDetails: PaymentDetails;
  createdAt: string;
  lastUsedAt: string;
}
