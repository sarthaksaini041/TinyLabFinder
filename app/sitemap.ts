import type { MetadataRoute } from "next";
import { COMPARISONS } from "../data/comparisons";
import { GUIDES } from "../data/guides";
import { PUBLISHED_USE_CASES } from "../data/usecases";
import { CATALOG } from "../lib/catalog";
import { SITE, absoluteUrl } from "../lib/site";

import { getAllMarket } from "../lib/prices/server";

export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const market = await getAllMarket();
  const d = new Date(SITE.dataUpdated);
  return [
    { url: absoluteUrl("/"), lastModified: d, priority: 1 },
    { url: absoluteUrl("/compare"), lastModified: d },
    { url: absoluteUrl("/guides"), lastModified: d },
    { url: absoluteUrl("/alerts"), lastModified: d },
    { url: absoluteUrl("/best"), lastModified: d, priority: 0.8 },
    { url: absoluteUrl("/which-mini-pc"), lastModified: d, priority: 0.7 },
    ...PUBLISHED_USE_CASES.map((u) => ({ url: absoluteUrl(`/best/${u.slug}`), lastModified: d, priority: 0.8 })),
    ...CATALOG.map((m) => ({
      url: absoluteUrl(`/models/${m.slug}`),
      lastModified: market.prices[m.slug] ? new Date(market.prices[m.slug].at) : d,
      priority: 0.8,
      ...(market.images[m.slug] ? { images: [market.images[m.slug].imageUrl] } : {}),
    })),
    ...COMPARISONS.map((c) => ({ url: absoluteUrl(`/compare/${c.slug}`), lastModified: d, priority: 0.7 })),
    ...GUIDES.map((g) => ({ url: absoluteUrl(`/guides/${g.slug}`), lastModified: new Date(g.updated), priority: 0.7 })),
    ...["/about", "/privacy", "/cookies", "/terms", "/contact"].map((p) => ({ url: absoluteUrl(p), lastModified: d, priority: 0.2 })),
  ];
}
