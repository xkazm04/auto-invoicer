import { createElement, type ReactElement } from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import QRCode from "qrcode";
import type { Invoice } from "@/types/invoice";
import type { ThemeId } from "@/components/invoice/theme";
import { InvoicePDF } from "@/components/invoice/InvoicePDF";
import { generateSpdString, canGenerateQr } from "@/lib/payment/spd";

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-z0-9-_.]+/gi, "-").replace(/^-+|-+$/g, "");
}

async function generateQrDataUrl(invoice: Invoice): Promise<string | null> {
  if (!canGenerateQr(invoice)) return null;
  const spd = generateSpdString(invoice);
  if (!spd) return null;
  try {
    return await QRCode.toDataURL(spd, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: "M",
    });
  } catch {
    return null;
  }
}

export async function downloadInvoicePDF(invoice: Invoice, themeId?: ThemeId): Promise<void> {
  const qrDataUrl = await generateQrDataUrl(invoice);

  // pdf() accepts a Document element at runtime, but its TS signature expects
  // ReactElement<DocumentProps> directly — wrapping in a custom component
  // loses that type. Cast since InvoicePDF always returns a <Document>.
  const element = createElement(InvoicePDF, { invoice, themeId, qrDataUrl }) as unknown as ReactElement<DocumentProps>;
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
