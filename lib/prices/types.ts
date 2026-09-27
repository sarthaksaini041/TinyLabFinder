import type { MarketplaceId } from "../listings";

/**
 * One observation of current asking prices for a model on one marketplace. Written only by
 * the price sync from a real API response; never entered by hand or estimated.
 */
export interface PriceSnapshot {
  modelSlug: string;
  marketplace: MarketplaceId;
  currency: string;
  minPrice: number;
  medianPrice: number;
  sampleSize: number;
  observedAt: string; // ISO timestamp
  source: "ebay-browse";
  /** Photo of a representative listing (the one priced closest to the median), shown with a link to it. */
  imageUrl?: string | null;
  imageListingUrl?: string | null;
}

/**
 * ACTIVE: credentials present and sync enabled.
 * PENDING_CREDENTIALS: eBay Developer keys not configured yet (current production state).
 * DISABLED: explicitly switched off with PRICE_SYNC_ENABLED=false.
 */
export type PriceStatus = "ACTIVE" | "PENDING_CREDENTIALS" | "DISABLED";

export interface PriceProvider {
  id: PriceSnapshot["source"];
  configured(): boolean;
  /** Returns null when no usable listings were found. Throws on API/network errors. */
  snapshot(modelSlug: string, query: string, market: MarketplaceId): Promise<PriceSnapshot | null>;
}
