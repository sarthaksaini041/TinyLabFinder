import Link from "next/link";
import { AdSlot } from "../components/ads/AdSlot";
import { Finder } from "../components/Finder";
import { CATALOG } from "../lib/catalog";
import { PUBLISHED_USE_CASES } from "../data/usecases";
import { getAllMarket } from "../lib/prices/server";

export const revalidate = 21600;
import { SITE, absoluteUrl } from "../lib/site";

export default async function Home() {
  const market = await getAllMarket();
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: absoluteUrl("/"),
    description: SITE.tagline,
  };
  return (
    <>
      <h1>Find the right used mini PC for your home server</h1>
      <p className="lede">
        Ex-office 1-litre PCs (Lenovo ThinkCentre Tiny, Dell OptiPlex Micro, HP EliteDesk Mini) are the cheapest good
        way into Proxmox, Plex, Jellyfin or Home Assistant. They look alike in listings but differ in the details that
        matter: NVMe slots, PCIe expansion, second-NIC options, RAM limits and video transcoding. Filter by what you
        need.
      </p>
      <p className="btn-row" style={{ marginTop: 0 }}>
        <Link className="btn btn--primary" href="/which-mini-pc">Not sure? Take the 6-question quiz</Link>
        <Link className="btn" href="/best">Best picks by use case</Link>
      </p>
      <Finder items={CATALOG} initialPrices={market.prices} initialImages={market.images} />
      <AdSlot placement="below-results" />
      <section className="prose">
        <h2>How to read this data</h2>
        <p>
          Specs describe the chassis as documented by the manufacturer. Models marked <strong>Verify specs</strong>{" "}
          have details we have not yet checked against the official manual, so confirm them before you buy. Transcoding
          verdicts follow the newest CPU generation sold in that chassis. Check the exact CPU in any listing. See{" "}
          <Link href="/about">our methodology</Link> or <Link href="/contact">send a correction</Link>.
        </p>
        <h2>Popular lists</h2>
        <ul className="chips">{PUBLISHED_USE_CASES.map((u) => <li key={u.slug}><Link href={`/best/${u.slug}`}>{u.label}</Link></li>)}</ul>
        <p>
          New to this? Start with <Link href="/guides/check-a-used-mini-pc-listing">how to check a used mini PC listing</Link>{" "}
          and <Link href="/guides/quick-sync-generations-plex-jellyfin">which generations transcode 4K</Link>.
        </p>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
