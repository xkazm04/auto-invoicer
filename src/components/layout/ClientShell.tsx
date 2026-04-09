"use client";

import { useState, lazy, Suspense, useCallback, type ReactNode } from "react";
import type { ThemeId } from "@/components/invoice/theme";
import { themes } from "@/components/invoice/theme";
import { ThemeContext } from "@/components/invoice/ThemeContext";
import { AppHeader, type TabId } from "./AppHeader";
import { FadeIn } from "@/components/ui/FadeIn";

const DashboardModule = lazy(() => import("@/modules/DashboardModule"));
const InvoicesModule = lazy(() => import("@/modules/InvoicesModule"));
const ContactsModule = lazy(() => import("@/modules/ContactsModule"));
const SettingsModule = lazy(() => import("@/modules/SettingsModule"));

interface ClientShellProps {
  children?: ReactNode;
}

export function ClientShell({ children: _children }: ClientShellProps) {
  const [themeId, setThemeId] = useState<ThemeId>("paper-perfect");
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [moduleKey, setModuleKey] = useState(0);
  const theme = themes[themeId];

  const handleTabChange = useCallback((tab: TabId) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setModuleKey((k) => k + 1);
    }
  }, [activeTab]);

  const renderModule = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardModule onNavigate={handleTabChange} />;
      case "invoices":
        return <InvoicesModule />;
      case "contacts":
        return <ContactsModule />;
      case "settings":
        return <SettingsModule />;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeId }}>
      <div className={`min-h-screen transition-all duration-500 ${theme.pageBg}`}>
        <AppHeader activeTab={activeTab} onTabChange={handleTabChange} />
        <main className={`pt-16 pb-12 px-4 ${theme.fontFamily}`}>
          <Suspense fallback={null}>
            <FadeIn key={moduleKey} duration={300}>
              {renderModule()}
            </FadeIn>
          </Suspense>
        </main>
      </div>
    </ThemeContext.Provider>
  );
}
