import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "../../../components/ads/AdSlot";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { ListingLinks } from "../../../components/ListingLinks";
import { MediaTable } from "../../../components/MediaTable";
import { SpecSheet } from "../../../components/SpecSheet";
import { CATALOG, alternatives, getView } from "../../../lib/catalog";
import { MEDIA, VERDICT_TEXT } from "../../../lib/media";
import { SITE, absoluteUrl } from "../../../lib/site";
import { comparisonsFor } from "../../../data/comparisons";
import { GUIDES } from "../../../data/guides";
import { useCasesFor } from "../../../data/usecases";
import { AffiliateDisclosure } from "../../../components/AffiliateDisclosure";
import { BuildList } from "../../../components/model/BuildList";
import { PriceBox } from "../../../components/model/PriceBox";
import { SaveButton } from "../../../components/model/SaveButton";
import { ModelPhoto } from "../../../components/ModelPhoto";
import { getModelMarket } from "../../../lib/prices/server";
import { measuredIdle } from "../../../lib/catalog";
import { modelFaqs } from "../../../lib/faq";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CATALOG.map((m) => ({ slug: m.slug }));
}
export const dynamicParams = false;
// Re-render every 6 hours so the photo and price in the HTML follow the daily eBay sync.
export const revalidate = 21600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = getView((await params).slug);
  if (!m) return {};
  const { image } = await getModelMarket(m.slug);
  const title = `${m.shortName} specs, used price & upgrades: RAM, NVMe, PCIe`;
  const description = `${m.name}: ${m.storage.m2Nvme}× M.2 NVMe + ${m.storage.sata25}× 2.5" SATA, ${m.ram.maxOfficialGB} GB official max RAM, ${m.pcieSlot === "none" ? "no PCIe slot" : "PCIe expansion"}. ${VERDICT_TEXT[m.verdict]}. What to check before buying one used.`;
  return {
    title,
    description,
    alternates: { canonical: `/models/${m.slug}` },
    openGraph: { title, description, url: `/models/${m.slug}`, images: image ? [{ url: image.imageUrl, alt: `${m.name}` }, "/opengraph-image"] : ["/opengraph-image"] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ModelPage({ params }: Props) {
  const m = getView((await params).slug);
  if (!m) notFound();
  const alts = alternatives(m);
  const related = comparisonsFor(m.slug);
  const uses = useCasesFor(m);
  const faqs = modelFaqs(m);
  const guides = GUIDES.filter((g) => g.models?.(m));
  const power = m.power ?? [];
  const { price, image } = await getModelMarket(m.slug);
  const money = (v: number, c: string) => new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(v);
  const families = m.cpuList.map((c) => c.igpuFamily);
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${m.name} specifications`,
      url: absoluteUrl(`/models/${m.slug}`),
      dateModified: SITE.dataUpdated,
      about: { "@type": "Thing", name: m.name, manufacturer: { "@type": "Organization", name: m.brand } },
    },
    ...(price ? [{
      "@context": "https://schema.org",
      "@type": "Product",
      name: m.name,
      brand: { "@type": "Brand", name: m.brand },
      category: "Mini PC / small form factor desktop",
      description: `${m.name}: ${m.storage.m2Nvme}× M.2 NVMe, ${m.storage.sata25}× 2.5" SATA, up to ${m.ram.maxOfficialGB} GB ${m.ram.type} (official).`,
      ...(image ? { image: [image.imageUrl] } : {}),
      offers: { "@type": "AggregateOffer", priceCurrency: price.currency, lowPrice: price.min, offerCount: price.n, availability: "https://schema.org/InStock", itemCondition: "https://schema.org/UsedCondition" },
    }] : []),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ name: "Models", href: "/#main" }, { name: m.shortName, href: `/models/${m.slug}` }]} />
      <div className="layout layout--side">
        <article>
          <div className="model-hero">
            <ModelPhoto name={m.name} image={image?.imageUrl} listingUrl={image?.listingUrl} size="hero" priority />
            <div>
          <h1>{m.name}</h1>
          <p className="lede">
            A {m.released} {m.family} {m.chipset ? `on the ${m.chipset} chipset ` : ""}with {m.storage.m2Nvme} M.2 NVMe{" "}
            {m.storage.m2Nvme === 1 ? "slot" : "slots"}, {m.storage.sata25} 2.5&quot; bay and up to {m.ram.maxOfficialGB} GB of
            RAM (official).{" "}
            {m.pcieSlot !== "none" ? "It can take a PCIe card, which is rare in this size." : m.extraNicOption ? "It has a vendor slot for a second network port." : "It has no internal expansion slot."}
          </p>
          <p style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <SaveButton slug={m.slug} />
            <span className="verdict"><span className={`dot dot--${m.verdict}`} aria-hidden="true" />{VERDICT_TEXT[m.verdict]}</span>
            {m.confidence === "high" ? (
              <span className="badge badge--high">Specs widely confirmed</span>
            ) : (
              <span className="badge badge--check">Verify specs before buying</span>
            )}
          </p>
            </div>
          </div>
          {m.confidence === "check" && (
            <p className="notice small">
              We could not confirm every field on this page from an official {m.brand} document. Treat slot counts and
              RAM limits as a starting point and confirm them for the exact machine type in a listing.{" "}
              <Link href="/contact">Know the answer? Send a correction.</Link>
            </p>
          )}

          <h2>Used price</h2>
          <PriceBox slug={m.slug} initial={price} />
          {price && (
            <p className="prose small muted" style={{ marginTop: 0 }}>
              Used {m.shortName} units on eBay US currently start at {money(price.min, price.currency)}, and the typical asking price is about{" "}
              {money(price.median, price.currency)} across {price.n} fixed-price listings. The spread mostly reflects the CPU fitted
              ({m.cpuList.map((c) => c.name.replace("Core ", "")).join(", ")}), RAM and SSD included, and whether a power adapter is in the box.
            </p>
          )}

          <h2>Specifications</h2>
          <SpecSheet m={m} />
          {m.sources.length > 0 && (
            <p className="small muted">
              Checked against:{" "}
              {m.sources.map((src, i) => (
                <span key={src.url}>{i > 0 && ", "}<a href={src.url} rel="nofollow noopener" target="_blank">{src.label}</a></span>
              ))}
              . Official limits can be lower than what owners report working.
            </p>
          )}

          {m.notes.length > 0 && (
            <>
              <h2>What owners should know</h2>
              <ul className="prose">{m.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            </>
          )}

          <AdSlot placement="in-content" />

          <h2>Power consumption</h2>
          {power.length ? (
            <div className="table-scroll"><table className="grid-table">
              <thead><tr><th>Idle</th><th>Load</th><th>Configuration</th><th>Method</th><th>Source</th></tr></thead>
              <tbody>{power.map((p) => (
                <tr key={p.source.url + p.config}><td>{p.idleMaxW ? `${p.idleW}–${p.idleMaxW}` : `~${p.idleW}`} W</td><td>{p.loadW ? `${p.loadW} W` : "–"}</td><td>{p.config}</td><td>{p.method} ({p.measuredOn})</td>
                  <td><a href={p.source.url} rel="nofollow noopener" target="_blank">{p.source.label}</a>{p.via && <span className="small muted"> (cited via <a href={p.via.url} rel="nofollow noopener" target="_blank">{p.via.label}</a>)</span>}</td></tr>
              ))}</tbody>
            </table></div>
          ) : null}
          {power.length > 0 && <p className="small muted">Third-party readings we have not re-measured. Your drives, BIOS power settings and OS change idle draw; see <Link href="/guides/mini-pc-power-consumption">how to measure it</Link> or <Link href="/contact">send your own reading</Link>.</p>}
          {power.length ? null : (
            <p className="prose">
              <strong>Not measured yet.</strong> We only publish idle figures with a source, the configuration and the method.
              {measuredIdle(m) ? "" : " If you have measured one at the wall, "}<Link href="/contact">send us your reading</Link>{" "}
              (CPU, RAM, drives, OS, meter and date). See <Link href="/guides/mini-pc-power-consumption">how to measure idle power</Link>.
            </p>
          )}

          <h2>What to buy with it</h2>
          <BuildList m={m} />

          <h2>Plex and Jellyfin transcoding</h2>
          <p className="prose">{MEDIA[m.bestIgpu].note} The table covers every CPU option sold in this chassis. Check which CPU a listing actually has.</p>
          <MediaTable families={families} />
          <p className="small muted">
            Plex needs a Plex Pass for hardware transcoding; Jellyfin does not. More detail in{" "}
            <Link href="/guides/quick-sync-generations-plex-jellyfin">our Quick Sync generations guide</Link>.
          </p>

          <h2>Before you buy one used</h2>
          <ul className="prose">
            <li>Confirm the exact CPU model in the listing photos or System Information screenshot, not just &quot;Core i5&quot;.</li>
            <li>Check that a power adapter of the right wattage is included{m.psuW ? ` (${m.psuW.map((w) => `${w} W`).join(" or ")})` : ""}. Many ex-office units ship without one.</li>
            <li>Ask whether the BIOS is unlocked. Ex-corporate machines sometimes keep an admin password.</li>
            {m.storage.sata25 > 0 && <li>A 2.5&quot; drive needs the caddy and cable, which are often missing when a unit shipped with only an M.2 SSD.</li>}
            {m.pcieSlot !== "none" && <li>The PCIe riser is usually not included. Budget for it separately.</li>}
          </ul>
          <p><Link href="/guides/check-a-used-mini-pc-listing">Full listing checklist →</Link></p>

          <h2>Find one</h2>
          <ListingLinks model={m} />
          <AffiliateDisclosure />
          <p>
            <Link className="btn btn--primary" href={`/alerts?model=${m.slug}`}>Email me when one is listed under my price</Link>
          </p>

          <h2>Frequently asked questions</h2>
          <dl className="faq">
            {faqs.map((f) => (<div key={f.q}><dt>{f.q}</dt><dd>{f.a}</dd></div>))}
          </dl>

          {uses.length > 0 && (
            <>
              <h2>Good for</h2>
              <ul className="chips">{uses.map((u) => <li key={u.slug}><Link href={`/best/${u.slug}`}>{u.label}</Link></li>)}</ul>
            </>
          )}

          {guides.length > 0 && (
            <>
              <h2>Related guides</h2>
              <ul>{guides.map((g) => <li key={g.slug}><Link href={`/guides/${g.slug}`}>{g.title}</Link></li>)}</ul>
            </>
          )}

          {related.length > 0 && (
            <>
              <h2>Head-to-head comparisons</h2>
              <ul>{related.map((c) => <li key={c.slug}><Link href={`/compare/${c.slug}`}>{c.title}</Link></li>)}</ul>
            </>
          )}

          <h2>Similar models to consider</h2>
          <ul className="cards">
            {alts.map((a) => (
              <li key={a.slug} className="card">
                <Link href={`/models/${a.slug}`} className="card__title">{a.name}</Link>
                <span className="small muted">
                  {a.storage.m2Nvme}× NVMe · {a.ram.maxOfficialGB} GB max · {a.pcieSlot === "none" ? "no PCIe" : "PCIe"} · {VERDICT_TEXT[a.verdict]}
                </span>
              </li>
            ))}
          </ul>
          <p><Link href={`/compare?m=${[m.slug, ...alts.slice(0, 2).map((a) => a.slug)].join(",")}`}>Compare these side by side →</Link></p>
        </article>
        <div><AdSlot placement="sidebar" /></div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
