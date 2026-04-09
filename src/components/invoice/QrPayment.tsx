"use client";

import { useState, useEffect, memo } from "react";
import { useTheme } from "./ThemeContext";
import type { Invoice } from "@/types/invoice";
import { generateSpdString, canGenerateQr } from "@/lib/payment/spd";
import QRCode from "qrcode";

interface QrPaymentProps {
  invoice: Invoice;
}

export const QrPayment = memo(function QrPayment({ invoice }: QrPaymentProps) {
  const { theme: t } = useTheme();
  const isMono = t.id === "minimal-mono";
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!canGenerateQr(invoice)) {
      setDataUrl(null);
      return;
    }

    const spd = generateSpdString(invoice);
    if (!spd) {
      setDataUrl(null);
      return;
    }

    QRCode.toDataURL(spd, {
      width: 160,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [invoice]);

  if (!canGenerateQr(invoice) || !dataUrl) return null;

  return (
    <div className={`${t.cardBg} ${t.cardRadius} ${isMono ? "p-3" : "p-5"} ${t.cardShadow}`}>
      <div className={`${isMono ? "text-[11px] uppercase tracking-widest mb-2" : "text-[11px] font-semibold uppercase tracking-wider mb-3"} ${t.labelColor}`}>
        QR Payment
      </div>
      <div className="flex items-start gap-4">
        <img
          src={dataUrl}
          alt="QR payment code"
          width={120}
          height={120}
          className={`${isMono ? "" : "rounded-lg"} shrink-0`}
        />
        <div className={`${isMono ? "text-[11px]" : "text-xs"} ${t.labelColor} space-y-1`}>
          <p>Scan with your banking app to pay this invoice.</p>
          <p className="opacity-60">Czech SPD/SPAYD format</p>
        </div>
      </div>
    </div>
  );
});
