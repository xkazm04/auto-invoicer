import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveContact,
  updateContact,
  loadContact,
  deleteContact,
  listContacts,
} from "@/lib/contacts/store";
import type { Party } from "@/types/invoice";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    key: (index: number) => [...storage.keys()][index] ?? null,
    get length() {
      return storage.size;
    },
    clear: () => storage.clear(),
  });
  vi.stubGlobal("crypto", {
    randomUUID: () => "test-uuid-" + Math.random().toString(36).slice(2, 8),
  });
});

function makeParty(name = "Acme Ltd"): Party {
  return {
    name,
    taxId: "12345678",
    vatId: "CZ12345678",
    address: "Main St 1, Prague",
    registrationId: "",
  };
}

describe("saveContact + loadContact", () => {
  it("saves and loads a contact with generated id", () => {
    const contact = saveContact(makeParty());
    expect(contact.id).toBeTruthy();
    expect(contact.name).toBe("Acme Ltd");

    const loaded = loadContact(contact.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.name).toBe("Acme Ltd");
    expect(loaded!.taxId).toBe("12345678");
  });
});

describe("updateContact", () => {
  it("overwrites existing contact", () => {
    const contact = saveContact(makeParty("Original"));
    updateContact({ ...contact, name: "Updated" });
    const loaded = loadContact(contact.id);
    expect(loaded!.name).toBe("Updated");
  });
});

describe("loadContact", () => {
  it("returns null for non-existent id", () => {
    expect(loadContact("nonexistent")).toBeNull();
  });
});

describe("deleteContact", () => {
  it("removes a saved contact", () => {
    const contact = saveContact(makeParty());
    deleteContact(contact.id);
    expect(loadContact(contact.id)).toBeNull();
  });

  it("does not throw for non-existent id", () => {
    expect(() => deleteContact("nonexistent")).not.toThrow();
  });
});

describe("listContacts", () => {
  it("returns empty array when no contacts exist", () => {
    expect(listContacts()).toEqual([]);
  });

  it("returns all saved contacts", () => {
    saveContact(makeParty("Alpha"));
    saveContact(makeParty("Beta"));
    const contacts = listContacts();
    expect(contacts).toHaveLength(2);
  });

  it("sorts by name alphabetically", () => {
    saveContact(makeParty("Zeta Corp"));
    saveContact(makeParty("Alpha Inc"));
    saveContact(makeParty("Mid Ltd"));
    const contacts = listContacts();
    expect(contacts[0].name).toBe("Alpha Inc");
    expect(contacts[1].name).toBe("Mid Ltd");
    expect(contacts[2].name).toBe("Zeta Corp");
  });

  it("ignores non-contact localStorage keys", () => {
    storage.set("unrelated-key", "some value");
    saveContact(makeParty());
    expect(listContacts()).toHaveLength(1);
  });

  it("skips corrupted entries", () => {
    saveContact(makeParty("Good"));
    storage.set("contacts:bad", "{not valid json");
    expect(listContacts()).toHaveLength(1);
    expect(listContacts()[0].name).toBe("Good");
  });
});
