"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/invoice/ThemeContext";

const NAV_ITEMS = [
  { href: "/invoices", label: "Invoices", monoLabel: "inv" },
  { href: "/contacts", label: "Contacts", monoLabel: "con" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { theme: t } = useTheme();
  const isMono = t.id === "minimal-mono";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 ${
        isMono
          ? "border-b border-neutral-200 bg-white"
          : "bg-white/80 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-12">
        <div className="flex items-center gap-6">
          {t.useHandwritten ? (
            <span className="font-[family-name:var(--font-caveat)] text-xl text-neutral-800">
              InvoiceFlow
            </span>
          ) : (
            <span
              className={`${
                isMono ? "text-[10px] uppercase tracking-[0.2em]" : "text-sm font-semibold"
              } text-neutral-800`}
            >
              {isMono ? "invoiceflow" : "InvoiceFlow"}
            </span>
          )}

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    isMono
                      ? "text-[10px] uppercase tracking-widest px-2 py-1"
                      : "text-xs font-medium px-3 py-1.5 rounded-lg"
                  } transition-colors ${
                    isActive
                      ? isMono
                        ? "text-neutral-900 border-b border-neutral-900"
                        : "text-neutral-900 bg-neutral-100"
                      : isMono
                        ? "text-neutral-400 hover:text-neutral-700"
                        : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  {isMono ? item.monoLabel : item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
