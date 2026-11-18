import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "../components/ads/AdSlot";
import { Finder } from "../components/Finder";
import { BRAND_COLLECTIONS } from "../data/brands";
import { PUBLISHED_USE_CASES } from "../data/usecases";
import { CATALOG } from "../lib/catalog";
import { getAllMarket } from "../lib/prices/server";
import { SITE, absoluteUrl } from "../lib/site";

export const revalidate = 21600;

const title = "Compare used mini PCs for home servers";
const description = "Compare used Lenovo ThinkCentre Tiny, Dell OptiPlex Micro and HP Mini PCs by RAM, NVMe, PCIe and video codecs. Find a model for Proxmox, Plex or Home Assistant.";

export const metadata: Metadata = {
  title: { absolute: `${title} | ${SITE.name}` },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/", type: "website", siteName: SITE.name },
  twitter: { title, description, card: "summary_large_image" },
};

const workloads = [
  { href: "/best/best-mini-pc-for-proxmox", title: "Proxmox", description: "Compare RAM limits, drive bays and CPU threads." },
  { href: "/best/best-mini-pc-for-plex-4k", title: "Plex & Jellyfin", description: "Find models that hardware-decode 4K HEVC." },
  { href: "/guides/home-assistant-mini-pc", title: "Home Assistant", description: "Choose hardware for automations and USB radios." },
];

export default async function Home() {
  const market = await getAllMarket();
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: absoluteUrl("/"),
    description,
  };

  return (
    <>
      <header className="finder-hero">
        <div className="finder-hero__intro">
          <h1>Find the right used mini PC for your home server</h1>
          <p className="lede">Compare {CATALOG.length} ex-office mini PCs by RAM, NVMe slots, network upgrades and video codecs.</p>
          <div className="btn-row">
            <a className="btn btn--primary" href="#finder">Browse the catalog <span aria-hidden="true">↓</span></a>
            <Link className="btn" href="/which-mini-pc">Get a recommendation</Link>
          </div>
        </div>
        <nav className="finder-hero__workloads" aria-labelledby="workload-heading">
          <h2 id="workload-heading">What are you building?</h2>
          <ul>
            {workloads.map((workload) => (
              <li key={workload.href}>
                <Link href={workload.href}>
                  <span><strong>{workload.title}</strong><small>{workload.description}</small></span>
                  <span aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <section id="finder" className="collection-section" aria-labelledby="finder-heading">
        <div className="finder-heading">
          <h2 id="finder-heading">Mini PC finder</h2>
          <nav aria-label="Mini PC brands">
            <ul className="chips">
              {BRAND_COLLECTIONS.map((collection) => (
                <li key={collection.slug}><Link href={`/brands/${collection.slug}`}>{collection.brand} {collection.family}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
        <Finder items={CATALOG} initialPrices={market.prices} initialImages={market.images} />
      </section>
      <AdSlot placement="below-results" />

      <section className="collection-section" aria-labelledby="shortlist-heading">
        <h2 id="shortlist-heading">Browse by feature or workload</h2>
        <ul className="chips">{PUBLISHED_USE_CASES.map((u) => <li key={u.slug}><Link href={`/best/${u.slug}`}>{u.label}</Link></li>)}</ul>
      </section>
      <section className="collection-section prose" aria-labelledby="data-heading">
        <h2 id="data-heading">How to read the specs</h2>
        <p>
          RAM limits are the manufacturer’s official maximum. A <strong>Verify specs</strong> flag means some fields
          still need confirmation against the official documentation. Transcoding verdicts use the best integrated
          graphics option for a chassis, so check the exact CPU in the listing.
        </p>
        <p>
          Read <Link href="/about">our methodology</Link>, use the <Link href="/guides/check-a-used-mini-pc-listing">buying checklist</Link>,
          or <Link href="/contact">send a correction</Link>.
        </p>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
