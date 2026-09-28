import { cache } from "react";
import { reportError } from "../monitoring";
import { PRICE_FRESH_HOURS, priceMarkets } from "./config";
import { latestAll, latestFor, latestImages } from "./store";
import type { PriceSnapshot } from "./types";

// Server-side reads for pages (rendered into HTML so photos and prices are visible to
// search engines and appear without a loading flash). Never throws: pages render without
// market data when the database is unavailable.
export interface MarketSummary { min: number; median: number; currency: string; n: number; at: string }
export interface ModelImage { imageUrl: string; listingUrl: string | null }

const fresh = (s: PriceSnapshot) => Date.parse(s.observedAt) > Date.now() - PRICE_FRESH_HOURS * 3600_000;
const summary = (s: PriceSnapshot): MarketSummary => ({ min: s.minPrice, median: s.medianPrice, currency: s.currency, n: s.sampleSize, at: s.observedAt });

export const getAllMarket = cache(async (): Promise<{ prices: Record<string, MarketSummary>; images: Record<string, ModelImage> }> => {
  try {
    const [snaps, images] = await Promise.all([latestAll(priceMarkets()[0]), latestImages()]);
    return { prices: Object.fromEntries(snaps.filter(fresh).map((s) => [s.modelSlug, summary(s)])), images };
  } catch (e) {
    reportError(e, { where: "page:getAllMarket" });
    return { prices: {}, images: {} };
  }
});

export const getModelMarket = cache(async (slug: string): Promise<{ price: MarketSummary | null; image: ModelImage | null }> => {
  try {
    const market = priceMarkets()[0];
    const latest = (await latestFor(slug)).find((s) => s.marketplace === market && fresh(s));
    const image = (await latestImages())[slug] ?? null;
    return { price: latest ? summary(latest) : null, image };
  } catch (e) {
    reportError(e, { where: "page:getModelMarket", slug });
    return { price: null, image: null };
  }
});
