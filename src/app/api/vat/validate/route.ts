import { NextResponse } from "next/server";
import type { VatLookupRequest, VatLookupResult } from "@/types/vat";

const EMPTY_RESULT: VatLookupResult = {
  valid: false, name: "", address: "", countryCode: "",
  registrationId: "", taxId: "", legalForm: "",
};

async function lookupARES(ico: string): Promise<VatLookupResult> {
  const url = `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${encodeURIComponent(ico)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    return { ...EMPTY_RESULT, countryCode: "CZ", error: `ARES returned ${res.status}` };
  }

  const data = await res.json();
  const name = data.obchodniJmeno || data.nazev || "";
  const addr = data.sidlo;

  // Prefer textovaAdresa (full pre-formatted address) over manual assembly
  let address = addr?.textovaAdresa || "";
  if (!address && addr) {
    const parts: string[] = [];
    if (addr.nazevUlice) parts.push(`${addr.nazevUlice} ${addr.cisloDomovni || ""}`.trim());
    if (addr.nazevObce) parts.push(addr.nazevObce);
    if (addr.psc) parts.push(String(addr.psc));
    address = parts.join(", ");
  }

  return {
    valid: true,
    name,
    address,
    countryCode: "CZ",
    registrationId: data.ico ? String(data.ico) : "",
    taxId: data.dic || "",
    legalForm: data.pravniForma ? String(data.pravniForma) : "",
  };
}

async function lookupVIES(countryCode: string, vatNumber: string): Promise<VatLookupResult> {
  const url = `https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ countryCode, vatNumber }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    return { ...EMPTY_RESULT, countryCode, error: `VIES returned ${res.status}` };
  }

  const data = await res.json();
  return {
    valid: data.valid === true,
    name: data.name || "",
    address: data.address || "",
    countryCode,
    registrationId: "",
    taxId: `${countryCode}${vatNumber}`,
    legalForm: "",
  };
}

export async function POST(request: Request) {
  try {
    const body: VatLookupRequest = await request.json();
    const { vatId, countryCode } = body;

    if (!vatId || !countryCode) {
      return NextResponse.json(
        { ...EMPTY_RESULT, error: "vatId and countryCode are required" },
        { status: 400 }
      );
    }

    const cc = countryCode.toUpperCase();

    // Czech IČO lookup via ARES
    if (cc === "CZ" && /^\d{8}$/.test(vatId.replace(/\s/g, ""))) {
      const result = await lookupARES(vatId.replace(/\s/g, ""));
      return NextResponse.json(result);
    }

    // EU VAT number lookup via VIES
    let viesCountry = cc;
    let viesNumber = vatId.replace(/\s/g, "");
    if (/^[A-Z]{2}/.test(viesNumber)) {
      viesCountry = viesNumber.slice(0, 2);
      viesNumber = viesNumber.slice(2);
    }

    const result = await lookupVIES(viesCountry, viesNumber);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ...EMPTY_RESULT, error: message },
      { status: 500 }
    );
  }
}
