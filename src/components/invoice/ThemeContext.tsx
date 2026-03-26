"use client";

import { createContext, useContext } from "react";
import type { ThemeId, ThemeTokens } from "./theme";
import { themes } from "./theme";

export const ThemeContext = createContext<{
  theme: ThemeTokens;
  setTheme: (id: ThemeId) => void;
}>({
  theme: themes["paper-perfect"],
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
