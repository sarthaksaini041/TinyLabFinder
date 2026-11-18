export const PRODUCTION_SITE_URL = "https://tinylabfinder.online";

// Central site configuration. Everything environment-specific is read here, once.
export const SITE = {
  name: "TinyLab Finder",
  tagline: "Used mini PCs for home servers, compared properly",
  // Keep canonical URLs stable when Vercel's deployment aliases change.
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production" ? PRODUCTION_SITE_URL : "http://localhost:3000")
  ).replace(/\/$/, ""),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@example.com",
  dataUpdated: "2026-09-25",
};

export function absoluteUrl(path = "/"): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
