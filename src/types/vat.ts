export interface VatLookupRequest {
  vatId: string;
  countryCode: string;
}

export interface VatLookupResult {
  valid: boolean;
  name: string;
  address: string;
  countryCode: string;
  registrationId: string;
  taxId: string;
  legalForm: string;
  error?: string;
}
