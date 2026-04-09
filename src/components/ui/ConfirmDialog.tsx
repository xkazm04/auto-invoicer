"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "@/components/invoice/ThemeContext";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { theme: t } = useTheme();
  const isMono = t.id === "minimal-mono";
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel]
  );

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-[100] bg-transparent backdrop:bg-black/30"
    >
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      >
        <div className={`${isMono ? "border border-neutral-200 bg-white p-4 max-w-sm w-full" : "bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-6 max-w-sm w-full"}`}>
          <div className={`${isMono ? "text-xs font-medium uppercase tracking-widest mb-2" : "text-sm font-semibold mb-2"} ${t.inputText}`}>
            {title}
          </div>
          <p className={`${isMono ? "text-xs" : "text-sm"} ${t.labelColor} mb-5`}>
            {message}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className={`${isMono ? "text-xs uppercase tracking-widest" : "px-4 py-2 text-xs font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} transition-colors`}
            >
              {isMono ? cancelLabel.toLowerCase() : cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`${isMono ? "text-xs uppercase tracking-widest border-b pb-0.5" : "px-4 py-2 text-xs font-medium rounded-lg"} ${
                destructive
                  ? "text-red-600 hover:text-red-700 border-red-300 bg-red-50 hover:bg-red-100"
                  : `${t.primaryBtnBg} ${t.primaryBtnText} ${t.primaryBtnHoverBg} ${t.primaryBtnRadius}`
              } transition-all`}
            >
              {isMono ? (confirmLabel || "ok").toLowerCase() : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
