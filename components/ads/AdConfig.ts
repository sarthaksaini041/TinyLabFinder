export const AD_PROVIDER = process.env.NEXT_PUBLIC_ADS_PROVIDER?.trim();
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() ?? "";
export const ADSENSE_SLOT = process.env.NEXT_PUBLIC_AD_SLOT_FOOTER?.trim() ?? "";

export function adsEnabled(): boolean {
  return process.env.VERCEL_ENV !== "preview" &&
    AD_PROVIDER === "adsense" &&
    /^ca-pub-\d{16}$/.test(ADSENSE_CLIENT) &&
    /^\d{10}$/.test(ADSENSE_SLOT);
}
