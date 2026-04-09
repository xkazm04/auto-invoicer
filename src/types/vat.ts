export interface VatLookupRequest {
  vatId: string;
  countryCode: string;
}

export interface VatLookupResult {
  valid: boolean;
  name: string;
  address: string;
  countryCode: string;
  error?: string;
}
