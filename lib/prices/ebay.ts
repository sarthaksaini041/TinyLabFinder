import { MARKETPLACES, type MarketplaceId } from "../listings";
import { ebayCredentialsPresent } from "./config";
import { median, round2, withoutOutliers } from "./stats";
import type { PriceProvider, PriceSnapshot } from "./types";

// eBay Browse API provider. Uses an application token (client-credentials grant), which
// needs only EBAY_CLIENT_ID and EBAY_CLIENT_SECRET from a production keyset. Browse returns
// current ASKING prices of active listings; sold prices need the separately approved
// Marketplace Insights API, so the site labels these as asking prices.

const TIMEOUT_MS = 8000;
let token: { value: string; expires: number } | null = null;

async function appToken(): Promise<string> {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const id = process.env.EBAY_CLIENT_ID!;
  const secret = process.env.EBAY_CLIENT_SECRET!;
  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}` },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: "https://api.ebay.com/oauth/api_scope" }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`eBay token request failed: ${res.status}`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: j.access_token, expires: Date.now() + j.expires_in * 1000 };
  return token.value;
}

/** Listing titles that match a model name but are not a complete computer. */
export const NOT_A_UNIT = /\b(caddy|bracket|adapter|charger|power supply|psu|riser|heatsink|fan|motherboard|parts only|for parts|no (cpu|ram|ssd|hdd|power)|barebone|lot of)\b/i;

export const ebayProvider: PriceProvider = {
  id: "ebay-browse",
  configured: ebayCredentialsPresent,
  async snapshot(modelSlug: string, query: string, market: MarketplaceId): Promise<PriceSnapshot | null> {
    const t = await appToken();
    const { currency } = MARKETPLACES[market];
    const params = new URLSearchParams({
      q: query,
      limit: "50",
      // Used condition group; fixed price only so the number is an actual asking price.
      filter: `buyingOptions:{FIXED_PRICE},conditionIds:{2000|2010|2020|2030|2500|3000},priceCurrency:${currency}`,
    });
    const res = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`, {
      headers: { Authorization: `Bearer ${t}`, "X-EBAY-C-MARKETPLACE-ID": market },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`eBay search failed: ${res.status}`);
    type Item = { title: string; price?: { value: string; currency: string }; image?: { imageUrl?: string }; itemWebUrl?: string };
    const j = (await res.json()) as { itemSummaries?: Item[] };
    const units = (j.itemSummaries || [])
      .filter((i) => i.price && i.price.currency === currency && !NOT_A_UNIT.test(i.title))
      .map((i) => ({ price: Number(i.price!.value), image: i.image?.imageUrl ?? null, url: i.itemWebUrl ?? null }))
      .filter((i) => Number.isFinite(i.price) && i.price > 0);
    const clean = withoutOutliers(units.map((u) => u.price));
    if (clean.length < 3) return null; // too few listings to say anything honest
    const med = median(clean);
    // A typical unit (priced near the median) makes a more representative photo than the cheapest one.
    const photo = units
      .filter((u) => u.image && isEbayImage(u.image) && clean.includes(u.price))
      .sort((a, b) => Math.abs(a.price - med) - Math.abs(b.price - med))[0];
    return {
      modelSlug, marketplace: market, currency,
      minPrice: round2(Math.min(...clean)), medianPrice: round2(med), sampleSize: clean.length,
      observedAt: new Date().toISOString(), source: "ebay-browse",
      imageUrl: photo ? sizedEbayImage(photo.image!) : null, imageListingUrl: photo?.url ?? null,
    };
  },
};

/** Only eBay's own image CDN over https is accepted (it is also the only host the page allows). */
export const isEbayImage = (u: string) => /^https:\/\/i\.ebayimg\.com\//.test(u);

/** eBay image URLs carry their size as s-l<N>; ask for a 500px version for sharp cards. */
export const sizedEbayImage = (u: string) => u.replace(/\/s-l\d+\./, "/s-l500.");
