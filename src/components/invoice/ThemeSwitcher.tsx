"use client";

import { themes } from "./theme";
import { useTheme } from "./ThemeContext";

export function ThemeSwitcher() {
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
