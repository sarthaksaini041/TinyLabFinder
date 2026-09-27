import { dbConfigured, query } from "../db";
import type { MarketplaceId } from "../listings";
import type { PriceSnapshot } from "./types";

type Row = { model_slug: string; marketplace: MarketplaceId; currency: string; min_price: string; median_price: string; sample_size: number; observed_at: Date; source: "ebay-browse"; image_url: string | null; image_listing_url: string | null };
const toSnap = (r: Row): PriceSnapshot => ({
  modelSlug: r.model_slug, marketplace: r.marketplace, currency: r.currency,
  minPrice: Number(r.min_price), medianPrice: Number(r.median_price), sampleSize: r.sample_size,
  observedAt: r.observed_at.toISOString(), source: r.source,
  imageUrl: r.image_url, imageListingUrl: r.image_listing_url,
});

export async function saveSnapshot(s: PriceSnapshot): Promise<void> {
  await query(
    `insert into price_snapshots (model_slug, marketplace, currency, min_price, median_price, sample_size, observed_at, source, image_url, image_listing_url)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [s.modelSlug, s.marketplace, s.currency, s.minPrice, s.medianPrice, s.sampleSize, s.observedAt, s.source, s.imageUrl ?? null, s.imageListingUrl ?? null],
  );
}

/** Latest snapshot per marketplace. Empty when there is no database or no data. */
export async function latestFor(slug: string): Promise<PriceSnapshot[]> {
  if (!dbConfigured()) return [];
  const r = await query<Row>(
    `select distinct on (marketplace) * from price_snapshots where model_slug = $1 order by marketplace, observed_at desc`,
    [slug],
  );
  return r.rows.map(toSnap);
}

/** Daily history (one point per day: that day's lowest asking price) for one marketplace. */
export async function historyFor(slug: string, market: MarketplaceId, days = 180): Promise<{ day: string; minPrice: number; currency: string }[]> {
  if (!dbConfigured()) return [];
  const r = await query<{ day: string; min_price: string; currency: string }>(
    `select to_char(date_trunc('day', observed_at), 'YYYY-MM-DD') as day, min(min_price) as min_price, min(currency) as currency
       from price_snapshots
      where model_slug = $1 and marketplace = $2 and observed_at > now() - make_interval(days => $3)
      group by 1 order by 1`,
    [slug, market, days],
  );
  return r.rows.map((x) => ({ day: x.day, minPrice: Number(x.min_price), currency: x.currency }));
}

/** Latest snapshot for every model on one marketplace (one query, for listing pages). */
export async function latestAll(market: MarketplaceId): Promise<PriceSnapshot[]> {
  if (!dbConfigured()) return [];
  const r = await query<Row>(
    `select distinct on (model_slug) * from price_snapshots where marketplace = $1 order by model_slug, observed_at desc`,
    [market],
  );
  return r.rows.map(toSnap);
}

/** Most recent representative photo per model (a day without a photo keeps the previous one). */
export async function latestImages(): Promise<Record<string, { imageUrl: string; listingUrl: string | null }>> {
  if (!dbConfigured()) return {};
  const r = await query<{ model_slug: string; image_url: string; image_listing_url: string | null }>(
    `select distinct on (model_slug) model_slug, image_url, image_listing_url from price_snapshots
      where image_url is not null order by model_slug, observed_at desc`,
  );
  return Object.fromEntries(r.rows.map((x) => [x.model_slug, { imageUrl: x.image_url, listingUrl: x.image_listing_url }]));
}
