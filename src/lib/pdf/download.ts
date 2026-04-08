import { createElement, type ReactElement } from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import type { Invoice } from "@/types/invoice";
import { InvoicePDF } from "@/components/invoice/InvoicePDF";

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-z0-9-_.]+/gi, "-").replace(/^-+|-+$/g, "");
}

export async function downloadInvoicePDF(invoice: Invoice): Promise<void> {
  // pdf() accepts a Document element at runtime, but its TS signature expects
  // ReactElement<DocumentProps> directly — wrapping in a custom component
  // loses that type. Cast since InvoicePDF always returns a <Document>.
  const element = createElement(InvoicePDF, { invoice }) as unknown as ReactElement<DocumentProps>;
  const blob = await pdf(element).toBlob();
  const url = URL.createObjectURL(blob);
  try {
    const safeNumber = sanitizeFilename(invoice.number) || "draft";
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `invoice-${safeNumber}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    URL.revokeObjectURL(url);
  }
}
