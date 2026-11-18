import type { MetadataRoute } from "next";
import { BRAND_COLLECTIONS } from "../data/brands";
import { COMPARISONS } from "../data/comparisons";
import { GUIDES } from "../data/guides";
import { PUBLISHED_USE_CASES } from "../data/usecases";
import { CATALOG } from "../lib/catalog";
import { getAllMarket } from "../lib/prices/server";
import { SITE, absoluteUrl } from "../lib/site";

export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { images } = await getAllMarket();
  return [
    ...["/", "/compare", "/guides", "/alerts", "/best", "/which-mini-pc", "/about", "/privacy", "/cookies", "/terms", "/contact"]
      .map((path) => ({ url: absoluteUrl(path) })),
    ...BRAND_COLLECTIONS.map(({ slug }) => ({ url: absoluteUrl(`/brands/${slug}`) })),
    ...PUBLISHED_USE_CASES.map(({ slug }) => ({ url: absoluteUrl(`/best/${slug}`), lastModified: SITE.dataUpdated })),
    ...CATALOG.map(({ slug }) => ({
      url: absoluteUrl(`/models/${slug}`),
      lastModified: SITE.dataUpdated,
      ...(images[slug] ? { images: [images[slug].imageUrl] } : {}),
    })),
    ...COMPARISONS.map(({ slug }) => ({ url: absoluteUrl(`/compare/${slug}`), lastModified: SITE.dataUpdated })),
    ...GUIDES.map(({ slug, updated }) => ({ url: absoluteUrl(`/guides/${slug}`), lastModified: updated })),
  ];
}
