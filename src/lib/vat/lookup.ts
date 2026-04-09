import type { VatLookupResult } from "@/types/vat";

export async function lookupVat(vatId: string, countryCode: string): Promise<VatLookupResult> {
  const res = await fetch("/api/vat/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vatId, countryCode }),
  });

  if (!res.ok) {
    return { valid: false, name: "", address: "", countryCode, registrationId: "", taxId: "", legalForm: "", error: `HTTP ${res.status}` };
  }

  return res.json();
}
