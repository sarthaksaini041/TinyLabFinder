import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { GUIDES, GUIDE_CATEGORIES } from "../../data/guides";
import { SITE } from "../../lib/site";

const title = "Used mini PC buying and home server guides";
const description = "Learn how to buy and upgrade a used mini PC, measure its power draw, and choose hardware for Proxmox, Plex, Jellyfin or Home Assistant.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/guides" },
  openGraph: { title, description, url: "/guides", siteName: SITE.name },
  twitter: { title, description, card: "summary_large_image" },
};

export default function GuidesIndex() {
  const categories = Object.entries(GUIDE_CATEGORIES);
  return (
    <>
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }]} />
      <header className="collection-header">
        <h1>Used mini PC &amp; home server guides</h1>
        <p className="lede">Check a used listing, choose hardware for your services, and plan RAM, storage and networking upgrades.</p>
        <nav aria-label="Guide topics">
          <ul className="chips">
            {categories.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}
          </ul>
        </nav>
      </header>
      {categories.map(([id, label]) => (
        <section key={id} id={id} className="collection-section" aria-labelledby={`${id}-heading`}>
          <h2 id={`${id}-heading`}>{label}</h2>
          <ul className="guide-grid">
            {GUIDES.filter((guide) => guide.category === id).map((guide) => (
              <li key={guide.slug}>
                <Link href={`/guides/${guide.slug}`} className="guide-card">
                  <h3>{guide.title}</h3>
                  <p>{guide.description}</p>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
