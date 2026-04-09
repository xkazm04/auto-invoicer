import { z } from "zod";
import type { Invoice } from "@/types/invoice";

const partySchema = z.object({
  name: z.string().min(1, "Name is required"),
  taxId: z.string(),
  vatId: z.string(),
  address: z.string(),
});

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().gt(0, "Quantity must be greater than 0"),
  unitPrice: z.number().gt(0, "Price must be greater than 0"),
});

export const invoiceSchema = z.object({
  id: z.string().min(1),
  number: z.string().min(1, "Invoice number is required"),
  status: z.enum(["draft", "sent", "paid", "overdue"]),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  taxPoint: z.string(),
  currency: z.enum(["CZK", "EUR", "USD"]),
  supplier: partySchema,
  customer: partySchema,
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  vatRate: z.number().min(0).max(1),
});

export interface ValidationErrors {
  [path: string]: string;
}

export interface ValidationResult {
  success: boolean;
  errors: ValidationErrors;
}

export function validateInvoice(invoice: Invoice): ValidationResult {
  const result = invoiceSchema.safeParse(invoice);

  if (result.success) {
    return { success: true, errors: {} };
  }

  const errors: ValidationErrors = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}
