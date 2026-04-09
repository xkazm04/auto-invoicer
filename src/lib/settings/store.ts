import type { AppSettings } from "@/types/settings";
import { createDefaultSettings } from "@/types/settings";

const STORAGE_KEY = "app-settings";

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSettings();
    return { ...createDefaultSettings(), ...JSON.parse(raw) };
  } catch {
    return createDefaultSettings();
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save settings", err);
  }
}
