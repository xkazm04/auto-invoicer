export type ThemeId = "minimal-mono" | "paper-perfect";

export interface ThemeTokens {
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

export const themes: Record<ThemeId, ThemeTokens> = {
  "minimal-mono": {
    id: "minimal-mono",
    name: "Minimal Mono",
    description: "Ultra-minimal monochrome",

    pageBg: "bg-neutral-50",

    fontFamily: "font-mono",
    useHandwritten: false,

    headerTitle: "text-neutral-500",
    headerSubtitle: "text-neutral-900",
    headerNumber: "text-neutral-900",
    headerNumberSeparator: "text-neutral-400",
    statusDot: "bg-neutral-500",
    statusDotGlow: "",
    statusText: "text-neutral-500",

    sectionLabel: "text-neutral-500",

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

    labelColor: "text-neutral-500",
    inputText: "text-neutral-900",
    inputPlaceholder: "placeholder-neutral-400",
    inputBg: "bg-transparent",
    inputFocusBg: "focus:bg-transparent",
    inputBorder: "border-b border-neutral-100",
    inputFocusBorder: "focus:border-neutral-900",
    inputRadius: "rounded-none",
    inputPadding: "pb-1",

    tableHeaderBg: "bg-neutral-50",
    tableHeaderText: "text-neutral-500",
    tableRowHoverBg: "hover:bg-neutral-100/50",
    tableDivider: "border-neutral-100",
    tableDividerStyle: "solid",

    summaryBg: "bg-neutral-50",
    summaryLabelColor: "text-neutral-500",
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
    secondaryBtnText: "text-neutral-500",
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

    headerTitle: "text-[#7A6B5C]",
    headerSubtitle: "text-[#2C2825]",
    headerNumber: "text-[#2C2825]",
    headerNumberSeparator: "text-[#9A8B7C]",
    statusDot: "bg-amber-500",
    statusDotGlow: "shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    statusText: "text-[#6B5D4D]",

    sectionLabel: "text-[#7A6B5C]",

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

    labelColor: "text-[#7A6B5C]",
    inputText: "text-[#3D3730]",
    inputPlaceholder: "placeholder-[#A89888]",
    inputBg: "bg-white/60",
    inputFocusBg: "focus:bg-white",
    inputBorder: "",
    inputFocusBorder: "",
    inputRadius: "rounded-lg",
    inputPadding: "px-3 py-2",

    tableHeaderBg: "bg-[#FAFAF9]",
    tableHeaderText: "text-[#7A6B5C]",
    tableRowHoverBg: "hover:bg-[#FDFCFB]",
    tableDivider: "bg-gradient-to-r from-transparent via-[#E8E4DF] to-transparent",
    tableDividerStyle: "gradient",

    summaryBg: "bg-gradient-to-br from-[#FAF8F5] to-[#F5F2EE]",
    summaryLabelColor: "text-[#6B5D4D]",
    summaryValueColor: "text-[#4A443E]",
    summaryDivider: "bg-gradient-to-r from-[#E0D9D2] via-[#D5CCC3] to-[#E0D9D2]",
    totalLabelColor: "text-[#6B5D4D]",
    totalValueColor: "text-[#2C2825]",
    totalCurrencyColor: "text-[#7A6B5C]",

    primaryBtnBg: "bg-[#3D3730]",
    primaryBtnHoverBg: "hover:bg-[#2C2825]",
    primaryBtnText: "text-white",
    primaryBtnShadow: "shadow-[0_4px_12px_rgba(61,55,48,0.2),0_1px_3px_rgba(61,55,48,0.1)]",
    primaryBtnRadius: "rounded-xl",
    secondaryBtnText: "text-[#6B5D4D]",
    secondaryBtnHoverText: "hover:text-[#3D3730]",
    secondaryBtnBorder: "",
  },
};
