import type { RecurringTemplate } from "@/types/recurring";

const STORAGE_PREFIX = "recurring-template:";

function storageKey(id: string): string {
  return `${STORAGE_PREFIX}${id}`;
}

export function saveTemplate(template: RecurringTemplate): void {
  try {
    localStorage.setItem(storageKey(template.id), JSON.stringify(template));
  } catch (err) {
    console.error("Failed to save recurring template", err);
  }
}

export function loadTemplate(id: string): RecurringTemplate | null {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as RecurringTemplate;
  } catch {
    return null;
  }
}

export function deleteTemplate(id: string): void {
  try {
    localStorage.removeItem(storageKey(id));
  } catch (err) {
    console.error("Failed to delete recurring template", err);
  }
}

export function listTemplates(): RecurringTemplate[] {
  const templates: RecurringTemplate[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        templates.push(JSON.parse(raw) as RecurringTemplate);
      } catch {
        // skip corrupted entries
      }
    }
  } catch (err) {
    console.error("Failed to list recurring templates", err);
  }
  templates.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return templates;
}

export function updateTemplateLastUsed(id: string): void {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return;
    const template = JSON.parse(raw) as RecurringTemplate;
    template.lastUsedAt = new Date().toISOString();
    localStorage.setItem(storageKey(id), JSON.stringify(template));
  } catch (err) {
    console.error("Failed to update template last used", err);
  }
}
