"use client";

import { useState, type ReactNode } from "react";
import type { ThemeId } from "@/components/invoice/theme";
import { themes } from "@/components/invoice/theme";
import { ThemeContext } from "@/components/invoice/ThemeContext";
import { AppHeader } from "./AppHeader";

interface ClientShellProps {
  children: ReactNode;
}

export function ClientShell({ children }: ClientShellProps) {
  const [themeId, setThemeId] = useState<ThemeId>("paper-perfect");
  const theme = themes[themeId];

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeId }}>
      <div className={`min-h-screen transition-all duration-500 ${theme.pageBg}`}>
        <AppHeader />
        <main className={`pt-16 pb-12 px-4 ${theme.fontFamily}`}>
          {children}
        </main>
      </div>
    </ThemeContext.Provider>
  );
}
