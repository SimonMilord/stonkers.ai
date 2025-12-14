export type QuoteData = {
  c: number; // Current price
  d?: number; // Change
  dp?: number; // Percent change
  h?: number; // High
  l?: number; // Low
  o?: number; // Open
  pc?: number; // Previous Close
  t?: number; // Timestamp
};

export type CompanyProfileData = {
  name: string;
  currency: string;
  ticker: string;
  exchange?: string;
  country?: string;
  ipo?: string; // Date in ISO 8601 format
  logo?: string;
  finnhubIndustry?: string; // Industry classification
  weburl?: string;
  sharesOutstanding?: number;
  marketCapitalization?: number;
  phone?: string;
};
