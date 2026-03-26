"use client";

import { useState } from "react";
import type { ThemeId } from "@/components/invoice/theme";
import { themes } from "@/components/invoice/theme";
import { ThemeContext } from "@/components/invoice/ThemeContext";
import { ThemeSwitcher } from "@/components/invoice/ThemeSwitcher";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";

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
