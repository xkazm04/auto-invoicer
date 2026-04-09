import type { ThemeId } from "@/components/invoice/theme";

export interface PdfColors {
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  borderStrong: string;
  background: string;
  panel: string;
  accent: string;
}

export interface PdfTheme {
  colors: PdfColors;
  fontFamily: string;
  borderRadius: number;
  panelPadding: number;
}

const paperPerfect: PdfTheme = {
  colors: {
    text: "#2C2825",
    textMuted: "#6B5D4D",
    textFaint: "#7A6B5C",
    border: "#E0D9D2",
    borderStrong: "#2C2825",
    background: "#F8F7F4",
    panel: "#F0EDE8",
    accent: "#9A8B7C",
  },
  fontFamily: "Helvetica",
  borderRadius: 6,
  panelPadding: 14,
};

const minimalMono: PdfTheme = {
  colors: {
    text: "#1a1a1a",
    textMuted: "#737373",
    textFaint: "#737373",
    border: "#d4d4d4",
    borderStrong: "#1a1a1a",
    background: "#ffffff",
    panel: "#fafafa",
    accent: "#525252",
  },
  fontFamily: "Courier",
  borderRadius: 0,
  panelPadding: 10,
};

const PDF_THEMES: Record<ThemeId, PdfTheme> = {
  "paper-perfect": paperPerfect,
  "minimal-mono": minimalMono,
};

export function getPdfTheme(themeId: ThemeId): PdfTheme {
  return PDF_THEMES[themeId];
}
