import { NextResponse } from "next/server";
import { clientIp } from "../../../lib/auth/rate";
import { memLimited } from "../../../lib/memlimit";
import { reportError } from "../../../lib/monitoring";
import { PRICE_FRESH_HOURS, priceMarkets, priceStatus } from "../../../lib/prices/config";
import { latestAll } from "../../../lib/prices/store";

// Compact "currently from" summary for every model, used by the finder cards.
export async function GET(req: Request) {
  if (memLimited(`prices-all:${clientIp(req)}`, 60, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const market = priceMarkets()[0];
  const freshAfter = Date.now() - PRICE_FRESH_HOURS * 3600_000;
  let prices: Record<string, { min: number; median: number; currency: string; n: number; at: string }> = {};
  let degraded = false;
  try {
    for (const s of await latestAll(market)) {
      if (Date.parse(s.observedAt) > freshAfter) prices[s.modelSlug] = { min: s.minPrice, median: s.medianPrice, currency: s.currency, n: s.sampleSize, at: s.observedAt };
    }
  } catch (e) {
    degraded = true;
    prices = {};
    reportError(e, { where: "api/prices(all)" });
  }
  return NextResponse.json(
    { status: priceStatus(), degraded, market, prices },
    { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } },
  );
}
