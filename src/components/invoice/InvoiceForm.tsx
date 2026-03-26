"use client";

import { useTheme } from "./ThemeContext";

export function InvoiceForm() {
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
      <div className="mb-10">
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
      <div className="mb-10">
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
