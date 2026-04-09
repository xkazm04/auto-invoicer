"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/invoice/ThemeContext";
import { themes } from "@/components/invoice/theme";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", monoLabel: "dash" },
  { href: "/invoices", label: "Invoices", monoLabel: "inv" },
  { href: "/contacts", label: "Contacts", monoLabel: "con" },
  { href: "/settings", label: "Settings", monoLabel: "cfg" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { theme: t, setTheme } = useTheme();
  const isMono = t.id === "minimal-mono";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 ${
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
            <span className="text-xs uppercase tracking-[0.15em] font-semibold text-neutral-800">
              invoiceflow
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
                      ? "text-xs uppercase tracking-widest px-2 py-1"
                      : "text-xs font-medium px-3 py-1.5 rounded-lg"
                  } transition-colors ${
                    isActive
                      ? isMono
                        ? "text-neutral-900 border-b border-neutral-900"
                        : "text-neutral-900 bg-neutral-100"
                      : isMono
                        ? "text-neutral-500 hover:text-neutral-800"
                        : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  {isMono ? item.monoLabel : item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Theme toggle */}
        <div className="flex gap-1">
          {Object.values(themes).map((theme) => (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                t.id === theme.id
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {isMono ? (theme.id === "minimal-mono" ? "mono" : "paper") : theme.name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
