import type { Contact } from "@/types/contact";
import type { Party } from "@/types/invoice";

const STORAGE_PREFIX = "contacts:";

function storageKey(id: string): string {
  return `${STORAGE_PREFIX}${id}`;
}

export function saveContact(party: Party): Contact {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `contact-${Date.now()}`;

  const contact: Contact = { ...party, id };

  try {
    localStorage.setItem(storageKey(id), JSON.stringify(contact));
  } catch (err) {
    console.error("Failed to save contact", err);
  }

  return contact;
}

export function updateContact(contact: Contact): void {
  try {
    localStorage.setItem(storageKey(contact.id), JSON.stringify(contact));
  } catch (err) {
    console.error("Failed to update contact", err);
  }
}

export function loadContact(id: string): Contact | null {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as Contact;
  } catch (err) {
    console.error("Failed to load contact", err);
    return null;
  }
}

export function deleteContact(id: string): void {
  try {
    localStorage.removeItem(storageKey(id));
  } catch (err) {
    console.error("Failed to delete contact", err);
  }
}

export function listContacts(): Contact[] {
  const contacts: Contact[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        contacts.push(JSON.parse(raw) as Contact);
      } catch {
        // skip corrupted entries
      }
    }
  } catch (err) {
    console.error("Failed to list contacts", err);
  }
  contacts.sort((a, b) => a.name.localeCompare(b.name));
  return contacts;
}
