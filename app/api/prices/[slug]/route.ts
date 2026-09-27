import { NextResponse } from "next/server";
import { getModel } from "../../../../data/models";
import { clientIp } from "../../../../lib/auth/rate";
import { memLimited } from "../../../../lib/memlimit";
import { reportError } from "../../../../lib/monitoring";
import { PRICE_FRESH_HOURS, priceMarkets, priceStatus } from "../../../../lib/prices/config";
import { historyFor, latestFor, latestImages } from "../../../../lib/prices/store";

// Public, cacheable price summary for one model. Always answers 200 with a status so the UI
// can show an honest empty state ("coming soon" / "no data yet") instead of an error.
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getModel(slug)) return NextResponse.json({ error: "Unknown model." }, { status: 404 });
  if (memLimited(`prices:${clientIp(req)}`, 60, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const status = priceStatus();
  let latest: Awaited<ReturnType<typeof latestFor>> = [];
  let history: Awaited<ReturnType<typeof historyFor>> = [];
  let degraded = false;
  let image: { imageUrl: string; listingUrl: string | null } | null = null;
  try {
    latest = await latestFor(slug);
    image = (await latestImages())[slug] ?? null;
    history = await historyFor(slug, priceMarkets()[0]);
  } catch (e) {
    degraded = true;
    reportError(e, { where: "api/prices", slug });
  }
  const freshAfter = Date.now() - PRICE_FRESH_HOURS * 3600_000;
  return NextResponse.json(
    { status, degraded, image, latest: latest.map((s) => ({ ...s, fresh: Date.parse(s.observedAt) > freshAfter })), history },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}
