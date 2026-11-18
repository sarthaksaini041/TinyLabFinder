import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Utility pages declare noindex in HTML. Crawlers need access to read it.
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
