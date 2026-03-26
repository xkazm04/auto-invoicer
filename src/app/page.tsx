"use client";

import { useState, createContext, useContext } from "react";

/* ============================================
   THEME TOKEN SYSTEM
   ============================================ */

type ThemeId = "minimal-mono" | "paper-perfect";

interface ThemeTokens {
  // Base
  id: ThemeId;
  name: string;
  description: string;

  // Page
  pageBg: string;

  // Typography
  fontFamily: string;
  useHandwritten: boolean;

  // Header
  headerTitle: string;
  headerSubtitle: string;
  headerNumber: string;
  headerNumberSeparator: string;
  statusDot: string;
  statusDotGlow: string;
  statusText: string;

  // Section Labels
  sectionLabel: string;

  // Cards / Containers
  cardBg: string;
  cardShadow: string;
  cardHoverShadow: string;
  cardRadius: string;
  cardPadding: string;

  // Party Cards (From/To)
  partyFromBg: string;
  partyToBg: string;
  partyIconBg: string;
  partyIconColor: string;
  partyToIconBg: string;
  partyToIconColor: string;

  // Form Elements
  labelColor: string;
  inputText: string;
  inputPlaceholder: string;
  inputBg: string;
  inputFocusBg: string;
  inputBorder: string;
  inputFocusBorder: string;
  inputRadius: string;
  inputPadding: string;

  // Table
  tableHeaderBg: string;
  tableHeaderText: string;
  tableRowHoverBg: string;
  tableDivider: string;
  tableDividerStyle: "solid" | "gradient";

  // Summary
  summaryBg: string;
  summaryLabelColor: string;
  summaryValueColor: string;
  summaryDivider: string;
  totalLabelColor: string;
  totalValueColor: string;
  totalCurrencyColor: string;

  // Buttons
  primaryBtnBg: string;
  primaryBtnHoverBg: string;
  primaryBtnText: string;
  primaryBtnShadow: string;
  primaryBtnRadius: string;
  secondaryBtnText: string;
  secondaryBtnHoverText: string;
  secondaryBtnBorder: string;
}

const themes: Record<ThemeId, ThemeTokens> = {
  "minimal-mono": {
    id: "minimal-mono",
    name: "Minimal Mono",
    description: "Ultra-minimal monochrome",

    pageBg: "bg-neutral-50",

    fontFamily: "font-mono",
    useHandwritten: false,

    headerTitle: "text-neutral-400",
    headerSubtitle: "text-neutral-900",
    headerNumber: "text-neutral-900",
    headerNumberSeparator: "text-neutral-300",
    statusDot: "bg-neutral-400",
    statusDotGlow: "",
    statusText: "text-neutral-400",

    sectionLabel: "text-neutral-400",

    cardBg: "bg-neutral-50",
    cardShadow: "",
    cardHoverShadow: "",
    cardRadius: "rounded-none",
    cardPadding: "p-3",

    partyFromBg: "bg-neutral-50",
    partyToBg: "bg-neutral-50",
    partyIconBg: "bg-neutral-200",
    partyIconColor: "text-neutral-500",
    partyToIconBg: "bg-neutral-200",
    partyToIconColor: "text-neutral-500",

    labelColor: "text-neutral-400",
    inputText: "text-neutral-900",
    inputPlaceholder: "placeholder-neutral-300",
    inputBg: "bg-transparent",
    inputFocusBg: "focus:bg-transparent",
    inputBorder: "border-b border-neutral-100",
    inputFocusBorder: "focus:border-neutral-900",
    inputRadius: "rounded-none",
    inputPadding: "pb-1",

    tableHeaderBg: "bg-neutral-50",
    tableHeaderText: "text-neutral-400",
    tableRowHoverBg: "hover:bg-neutral-100/50",
    tableDivider: "border-neutral-100",
    tableDividerStyle: "solid",

    summaryBg: "bg-neutral-50",
    summaryLabelColor: "text-neutral-400",
    summaryValueColor: "text-neutral-600",
    summaryDivider: "border-neutral-900",
    totalLabelColor: "text-neutral-900",
    totalValueColor: "text-neutral-900",
    totalCurrencyColor: "text-neutral-500",

    primaryBtnBg: "bg-neutral-900",
    primaryBtnHoverBg: "hover:bg-neutral-800",
    primaryBtnText: "text-white",
    primaryBtnShadow: "",
    primaryBtnRadius: "rounded-none",
    secondaryBtnText: "text-neutral-400",
    secondaryBtnHoverText: "hover:text-neutral-900",
    secondaryBtnBorder: "border-b border-transparent hover:border-neutral-900",
  },

  "paper-perfect": {
    id: "paper-perfect",
    name: "Paper Perfect",
    description: "Borderless clarity",

    pageBg: "bg-[#F8F7F4]",

    fontFamily: "",
    useHandwritten: true,

    headerTitle: "text-[#9B8B7A]",
    headerSubtitle: "text-[#2C2825]",
    headerNumber: "text-[#2C2825]",
    headerNumberSeparator: "text-[#B8A99A]",
    statusDot: "bg-amber-400",
    statusDotGlow: "shadow-[0_0_8px_rgba(251,191,36,0.4)]",
    statusText: "text-[#8A7B6C]",

    sectionLabel: "text-[#A89888]",

    cardBg: "bg-white",
    cardShadow: "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]",
    cardHoverShadow: "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.04)]",
    cardRadius: "rounded-xl",
    cardPadding: "p-4",

    partyFromBg: "bg-gradient-to-br from-[#F5F7FA] to-[#EEF1F5]",
    partyToBg: "bg-gradient-to-br from-[#FBF8F6] to-[#F5F0EC]",
    partyIconBg: "bg-[#E4E8ED]",
    partyIconColor: "text-[#7A8594]",
    partyToIconBg: "bg-[#EDE6E0]",
    partyToIconColor: "text-[#9A8B7C]",

    labelColor: "text-[#A89888]",
    inputText: "text-[#3D3730]",
    inputPlaceholder: "placeholder-[#C5C0BA]",
    inputBg: "bg-white/60",
    inputFocusBg: "focus:bg-white",
    inputBorder: "",
    inputFocusBorder: "",
    inputRadius: "rounded-lg",
    inputPadding: "px-3 py-2",

    tableHeaderBg: "bg-[#FAFAF9]",
    tableHeaderText: "text-[#A89888]",
    tableRowHoverBg: "hover:bg-[#FDFCFB]",
    tableDivider: "bg-gradient-to-r from-transparent via-[#E8E4DF] to-transparent",
    tableDividerStyle: "gradient",

    summaryBg: "bg-gradient-to-br from-[#FAF8F5] to-[#F5F2EE]",
    summaryLabelColor: "text-[#8A7B6C]",
    summaryValueColor: "text-[#5A544D]",
    summaryDivider: "bg-gradient-to-r from-[#E0D9D2] via-[#D5CCC3] to-[#E0D9D2]",
    totalLabelColor: "text-[#6B5D4D]",
    totalValueColor: "text-[#2C2825]",
    totalCurrencyColor: "text-[#A89888]",

    primaryBtnBg: "bg-[#3D3730]",
    primaryBtnHoverBg: "hover:bg-[#2C2825]",
    primaryBtnText: "text-white",
    primaryBtnShadow: "shadow-[0_4px_12px_rgba(61,55,48,0.2),0_1px_3px_rgba(61,55,48,0.1)]",
    primaryBtnRadius: "rounded-xl",
    secondaryBtnText: "text-[#8A7B6C]",
    secondaryBtnHoverText: "hover:text-[#5A544D]",
    secondaryBtnBorder: "",
  },
};

const ThemeContext = createContext<{
  theme: ThemeTokens;
  setTheme: (id: ThemeId) => void;
}>({
  theme: themes["paper-perfect"],
  setTheme: () => {},
});

const useTheme = () => useContext(ThemeContext);

/* ============================================
   MAIN APP
   ============================================ */

export default function Home() {
  const [themeId, setThemeId] = useState<ThemeId>("paper-perfect");
  const theme = themes[themeId];

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeId }}>
      <div className={`min-h-screen transition-all duration-500 ${theme.pageBg}`}>
        <ThemeSwitcher />
        <main className={`pt-20 pb-12 px-4 ${theme.fontFamily}`}>
          <InvoiceForm />
        </main>
      </div>
    </ThemeContext.Provider>
  );
}

/* ============================================
   THEME SWITCHER
   ============================================ */

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-widest">
            Theme
          </span>
          <div className="flex gap-1">
            {Object.values(themes).map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${theme.id === t.id
                    ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }
                `}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ============================================
   UNIFIED INVOICE FORM
   ============================================ */

function InvoiceForm() {
  const { theme } = useTheme();
  const t = theme;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className={`mb-12 ${t.id === "minimal-mono" ? "border-b border-neutral-200 pb-4" : ""}`}>
        <div className={`flex ${t.id === "minimal-mono" ? "items-baseline justify-between" : "items-end justify-between"}`}>
          <div>
            {t.useHandwritten ? (
              <span className={`font-[family-name:var(--font-caveat)] text-3xl ${t.headerTitle} block leading-none`}>
                Invoice
              </span>
            ) : (
              <span className={`text-[9px] uppercase tracking-widest ${t.headerTitle} block mb-1`}>
                Invoice
              </span>
            )}
            <h1 className={`${t.id === "minimal-mono" ? "text-sm font-medium" : "text-5xl font-extralight"} ${t.headerNumber} tracking-tight ${t.id === "paper-perfect" ? "mt-1" : ""}`}>
              {t.id === "minimal-mono" ? "#" : ""}2024{t.id === "paper-perfect" && <span className={t.headerNumberSeparator}>—</span>}
              {t.id === "minimal-mono" && "-"}0042
            </h1>
          </div>
          <div className={t.id === "paper-perfect" ? "pb-1" : ""}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${t.statusDot} ${t.statusDotGlow}`} />
              <span className={`${t.id === "minimal-mono" ? "text-[10px]" : "text-sm font-medium"} ${t.statusText}`}>
                Draft
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dates Section */}
      <div className={`mb-10 ${t.id === "minimal-mono" ? "" : ""}`}>
        {t.useHandwritten && (
          <span className={`font-[family-name:var(--font-caveat)] text-xl ${t.sectionLabel} block mb-4`}>
            Key Dates
          </span>
        )}
        <div className={`grid grid-cols-4 ${t.id === "minimal-mono" ? "gap-px bg-neutral-200" : "gap-3"}`}>
          {[
            { label: "Issue Date", shortLabel: "Date", value: "2024-12-02" },
            { label: "Due Date", shortLabel: "Due", value: "2024-12-16" },
            { label: "Tax Point", shortLabel: "Tax Date", value: "2024-12-02" },
            { label: "Currency", shortLabel: "Curr.", value: "CZK", isSelect: true },
          ].map((field, i) => (
            <div
              key={i}
              className={`${t.cardBg} ${t.cardRadius} ${t.cardPadding} ${t.cardShadow} ${t.cardHoverShadow} transition-shadow duration-300`}
            >
              <label className={`text-[${t.id === "minimal-mono" ? "9px" : "10px"}] font-semibold ${t.labelColor} uppercase tracking-wider block mb-${t.id === "minimal-mono" ? "1" : "2"}`}>
                {t.id === "minimal-mono" ? field.shortLabel : field.label}
              </label>
              {field.isSelect ? (
                <select className={`w-full ${t.id === "minimal-mono" ? "text-[11px]" : "text-[15px] font-medium"} ${t.inputText} bg-transparent focus:outline-none cursor-pointer`}>
                  <option>CZK</option>
                  <option>EUR</option>
                  <option>USD</option>
                </select>
              ) : (
                <input
                  type="date"
                  defaultValue={field.value}
                  className={`w-full ${t.id === "minimal-mono" ? "text-[11px]" : "text-[15px] font-medium"} ${t.inputText} bg-transparent focus:outline-none`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Parties */}
      <div className={`mb-10 ${t.id === "minimal-mono" ? "" : ""}`}>
        <div className={`grid grid-cols-2 ${t.id === "minimal-mono" ? "gap-8" : "gap-5"}`}>
          {/* Supplier */}
          <div className={`${t.partyFromBg} ${t.id === "paper-perfect" ? "rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)]" : ""}`}>
            <div className={`flex items-center gap-2 ${t.id === "paper-perfect" ? "mb-5" : "mb-3"}`}>
              {t.id === "paper-perfect" ? (
                <div className={`w-8 h-8 rounded-full ${t.partyIconBg} flex items-center justify-center`}>
                  <svg className={`w-4 h-4 ${t.partyIconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              ) : null}
              {t.useHandwritten ? (
                <span className={`font-[family-name:var(--font-caveat)] text-2xl ${t.partyIconColor}`}>From</span>
              ) : (
                <span className={`text-[9px] uppercase tracking-widest ${t.labelColor}`}>Supplier</span>
              )}
            </div>
            <div className={`space-y-${t.id === "minimal-mono" ? "1" : "4"}`}>
              <input
                type="text"
                placeholder="Company Name"
                className={`w-full ${t.id === "minimal-mono" ? "text-xs" : "text-base font-medium"} ${t.inputText} ${t.inputPlaceholder} bg-transparent focus:outline-none ${t.id === "minimal-mono" ? "border-b border-neutral-100 pb-1 focus:border-neutral-900 transition-colors" : ""}`}
              />
              <div className={`grid grid-cols-2 gap-${t.id === "minimal-mono" ? "2" : "3"}`}>
                <div>
                  <label className={`text-[9px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Tax ID</label>
                  <input
                    type="text"
                    placeholder="000-000-000"
                    className={`w-full ${t.id === "minimal-mono" ? "text-[10px]" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${t.id === "minimal-mono" ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors`}
                  />
                </div>
                <div>
                  <label className={`text-[9px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>VAT ID</label>
                  <input
                    type="text"
                    placeholder="CZ000000000"
                    className={`w-full ${t.id === "minimal-mono" ? "text-[10px]" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${t.id === "minimal-mono" ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors`}
                  />
                </div>
              </div>
              <div>
                <label className={`text-[9px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Address</label>
                <textarea
                  placeholder="Street, City, Country"
                  rows={2}
                  className={`w-full ${t.id === "minimal-mono" ? "text-[10px]" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} bg-transparent focus:outline-none resize-none leading-relaxed ${t.id === "minimal-mono" ? "border-b border-neutral-100 pb-1 focus:border-neutral-900 transition-colors" : ""}`}
                />
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className={`${t.partyToBg} ${t.id === "paper-perfect" ? "rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)]" : ""}`}>
            <div className={`flex items-center gap-2 ${t.id === "paper-perfect" ? "mb-5" : "mb-3"}`}>
              {t.id === "paper-perfect" ? (
                <div className={`w-8 h-8 rounded-full ${t.partyToIconBg} flex items-center justify-center`}>
                  <svg className={`w-4 h-4 ${t.partyToIconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              ) : null}
              {t.useHandwritten ? (
                <span className={`font-[family-name:var(--font-caveat)] text-2xl ${t.partyToIconColor}`}>To</span>
              ) : (
                <span className={`text-[9px] uppercase tracking-widest ${t.labelColor}`}>Customer</span>
              )}
            </div>
            <div className={`space-y-${t.id === "minimal-mono" ? "1" : "4"}`}>
              <input
                type="text"
                placeholder="Client Name"
                className={`w-full ${t.id === "minimal-mono" ? "text-xs" : "text-base font-medium"} ${t.inputText} ${t.inputPlaceholder} bg-transparent focus:outline-none ${t.id === "minimal-mono" ? "border-b border-neutral-100 pb-1 focus:border-neutral-900 transition-colors" : ""}`}
              />
              <div className={`grid grid-cols-2 gap-${t.id === "minimal-mono" ? "2" : "3"}`}>
                <div>
                  <label className={`text-[9px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Tax ID</label>
                  <input
                    type="text"
                    placeholder="000-000-000"
                    className={`w-full ${t.id === "minimal-mono" ? "text-[10px]" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${t.id === "minimal-mono" ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors`}
                  />
                </div>
                <div>
                  <label className={`text-[9px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>VAT ID</label>
                  <input
                    type="text"
                    placeholder="CZ000000000"
                    className={`w-full ${t.id === "minimal-mono" ? "text-[10px]" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} ${t.inputBg} ${t.inputRadius} ${t.inputPadding} focus:outline-none ${t.inputFocusBg} ${t.id === "minimal-mono" ? "border-b border-neutral-100 focus:border-neutral-900" : ""} transition-colors`}
                  />
                </div>
              </div>
              <div>
                <label className={`text-[9px] font-semibold ${t.labelColor} uppercase tracking-wider block mb-1.5`}>Address</label>
                <textarea
                  placeholder="Street, City, Country"
                  rows={2}
                  className={`w-full ${t.id === "minimal-mono" ? "text-[10px]" : "text-sm"} ${t.inputText} ${t.inputPlaceholder} bg-transparent focus:outline-none resize-none leading-relaxed ${t.id === "minimal-mono" ? "border-b border-neutral-100 pb-1 focus:border-neutral-900 transition-colors" : ""}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          {t.useHandwritten ? (
            <span className={`font-[family-name:var(--font-caveat)] text-2xl ${t.sectionLabel}`}>Items</span>
          ) : (
            <span className={`text-[9px] uppercase tracking-widest ${t.labelColor}`}>Items</span>
          )}
          <button className={`${t.id === "minimal-mono" ? "text-[10px]" : "text-[11px] font-semibold"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} uppercase tracking-wider transition-colors flex items-center gap-1.5 group`}>
            {t.id === "paper-perfect" && (
              <span className="w-5 h-5 rounded-full bg-[#EDE8E3] group-hover:bg-[#E0D9D2] flex items-center justify-center transition-colors">
                <span className="text-sm leading-none">+</span>
              </span>
            )}
            {t.id === "minimal-mono" && "+ "}Add Item
          </button>
        </div>

        {/* Table Container */}
        <div className={`${t.id === "paper-perfect" ? "bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] overflow-hidden" : ""}`}>
          {/* Header */}
          <div className={`grid grid-cols-12 gap-4 ${t.id === "paper-perfect" ? "px-5 py-3" : "pb-2 border-b border-neutral-200"} ${t.tableHeaderBg}`}>
            <div className={`col-span-${t.id === "minimal-mono" ? "6" : "5"} text-[${t.id === "minimal-mono" ? "9px" : "10px"}] font-semibold ${t.tableHeaderText} uppercase tracking-wider`}>
              {t.id === "minimal-mono" ? "Item" : "Description"}
            </div>
            <div className={`col-span-2 text-[${t.id === "minimal-mono" ? "9px" : "10px"}] font-semibold ${t.tableHeaderText} uppercase tracking-wider text-center`}>
              Qty
            </div>
            <div className={`col-span-2 text-[${t.id === "minimal-mono" ? "9px" : "10px"}] font-semibold ${t.tableHeaderText} uppercase tracking-wider text-right`}>
              {t.id === "minimal-mono" ? "Unit" : "Price"}
            </div>
            <div className={`col-span-${t.id === "minimal-mono" ? "2" : "3"} text-[${t.id === "minimal-mono" ? "9px" : "10px"}] font-semibold ${t.tableHeaderText} uppercase tracking-wider text-right`}>
              Amount
            </div>
          </div>

          {/* Rows */}
          <div className={t.id === "minimal-mono" ? "divide-y divide-neutral-100" : ""}>
            {[
              { desc: "Consulting Services", shortDesc: "Consulting", qty: "10", price: "1500", priceFormatted: "1,500", amount: "15,000.00", amountShort: "15,000" },
              { desc: "Development Hours", shortDesc: "Development", qty: "40", price: "2000", priceFormatted: "2,000", amount: "80,000.00", amountShort: "80,000" },
            ].map((item, i, arr) => (
              <div key={i}>
                <div className={`grid grid-cols-12 gap-4 ${t.id === "paper-perfect" ? "px-5 py-4" : "py-2"} items-center ${t.tableRowHoverBg} transition-colors`}>
                  <input
                    type="text"
                    defaultValue={t.id === "minimal-mono" ? item.shortDesc : item.desc}
                    className={`col-span-${t.id === "minimal-mono" ? "6" : "5"} ${t.id === "minimal-mono" ? "text-[11px]" : "text-[15px]"} ${t.inputText} bg-transparent focus:outline-none`}
                  />
                  <input
                    type={t.id === "minimal-mono" ? "text" : "number"}
                    defaultValue={item.qty}
                    className={`col-span-2 ${t.id === "minimal-mono" ? "text-[11px] text-neutral-600" : "text-[15px]"} ${t.id === "paper-perfect" ? t.inputText : ""} text-center bg-transparent focus:outline-none`}
                  />
                  <input
                    type={t.id === "minimal-mono" ? "text" : "number"}
                    defaultValue={t.id === "minimal-mono" ? item.priceFormatted : item.price}
                    className={`col-span-2 ${t.id === "minimal-mono" ? "text-[11px] text-neutral-600" : "text-[15px]"} ${t.id === "paper-perfect" ? t.inputText : ""} text-right bg-transparent focus:outline-none`}
                  />
                  <div className={`col-span-${t.id === "minimal-mono" ? "2" : "3"} ${t.id === "minimal-mono" ? "text-[11px]" : "text-[15px] font-semibold"} ${t.inputText} text-right tabular-nums`}>
                    {t.id === "minimal-mono" ? item.amountShort : item.amount}
                  </div>
                </div>
                {t.id === "paper-perfect" && i < arr.length - 1 && (
                  <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#E8E4DF] to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className={`${t.id === "minimal-mono" ? "w-40" : "w-80"}`}>
          <div className={`${t.summaryBg} ${t.id === "paper-perfect" ? "rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)]" : ""}`}>
            {t.useHandwritten && (
              <span className={`font-[family-name:var(--font-caveat)] text-xl ${t.sectionLabel} block mb-4`}>Summary</span>
            )}
            <div className={`space-y-${t.id === "minimal-mono" ? "0" : "3"}`}>
              <div className={`flex justify-between items-center ${t.id === "minimal-mono" ? "py-1" : ""}`}>
                <span className={`${t.id === "minimal-mono" ? "text-[10px]" : "text-sm"} ${t.summaryLabelColor}`}>Subtotal</span>
                <span className={`${t.id === "minimal-mono" ? "text-[10px]" : "text-sm font-medium"} ${t.summaryValueColor} tabular-nums`}>
                  {t.id === "minimal-mono" ? "95,000" : "95,000.00"}
                </span>
              </div>
              <div className={`flex justify-between items-center ${t.id === "minimal-mono" ? "py-1" : ""}`}>
                <span className={`${t.id === "minimal-mono" ? "text-[10px]" : "text-sm"} ${t.summaryLabelColor}`}>VAT 21%</span>
                <span className={`${t.id === "minimal-mono" ? "text-[10px]" : "text-sm font-medium"} ${t.summaryValueColor} tabular-nums`}>
                  {t.id === "minimal-mono" ? "19,950" : "19,950.00"}
                </span>
              </div>
              <div className={`${t.id === "minimal-mono" ? "border-t mt-1 py-2" : "h-px my-3"} ${t.summaryDivider}`} />
              <div className={`flex justify-between items-${t.id === "minimal-mono" ? "center" : "end"} ${t.id === "minimal-mono" ? "pt-0" : "pt-0"}`}>
                {t.useHandwritten ? (
                  <span className={`font-[family-name:var(--font-caveat)] text-2xl ${t.totalLabelColor}`}>Total</span>
                ) : (
                  <span className={`text-xs ${t.totalLabelColor}`}>Total</span>
                )}
                <div className={t.id === "paper-perfect" ? "text-right" : ""}>
                  <span className={`${t.id === "minimal-mono" ? "text-xs font-medium" : "text-3xl font-light"} ${t.totalValueColor} tabular-nums ${t.id === "paper-perfect" ? "tracking-tight" : ""}`}>
                    114,950
                  </span>
                  <span className={`${t.id === "minimal-mono" ? "text-xs" : "text-sm ml-1.5 font-medium"} ${t.totalCurrencyColor}`}>
                    {t.id === "minimal-mono" ? " " : ""}CZK
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={`flex gap-4 justify-end ${t.id === "minimal-mono" ? "border-t border-neutral-200 pt-6" : ""}`}>
        <button className={`${t.id === "minimal-mono" ? "text-[10px] uppercase tracking-widest" : "px-6 py-3 text-sm font-medium"} ${t.secondaryBtnText} ${t.secondaryBtnHoverText} ${t.secondaryBtnBorder} transition-colors`}>
          {t.id === "minimal-mono" ? "Draft" : "Save Draft"}
        </button>
        <button className={`${t.id === "minimal-mono" ? "text-[10px] uppercase tracking-widest border-b border-neutral-900 pb-0.5 hover:border-neutral-400" : "px-8 py-3"} ${t.primaryBtnBg} ${t.primaryBtnHoverBg} ${t.primaryBtnText} ${t.primaryBtnRadius} ${t.primaryBtnShadow} transition-all`}>
          {t.id === "minimal-mono" ? "Create" : "Create Invoice"}
        </button>
      </div>
    </div>
  );
}
