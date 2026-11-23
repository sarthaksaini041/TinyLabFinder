import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CompareTable, differences } from "../../../components/CompareTable";
import { COMPARISONS, comparisonsFor } from "../../../data/comparisons";
import { useCasesFor } from "../../../data/usecases";
import { ShareLinks } from "../../../components/ShareLinks";
import { absoluteUrl } from "../../../lib/site";
import { getView } from "../../../lib/catalog";

type Props = { params: Promise<{ pair: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ pair: c.slug }));
}
function load(slug: string) {
  const c = COMPARISONS.find((x) => x.slug === slug);
  if (!c) return null;
  const a = getView(c.a);
  const b = getView(c.b);
  return a && b ? { c, a, b } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = load((await params).pair);
  if (!d) return {};
  const title = `${d.c.title} for a home server`;
  const description = `${d.c.question} ${differences(d.a, d.b)[0]}`;
  return {
    title,
    description,
    alternates: { canonical: `/compare/${d.c.slug}` },
    openGraph: { type: "article", title, description, url: `/compare/${d.c.slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PairPage({ params }: Props) {
  const d = load((await params).pair);
  if (!d) notFound();
  const { c, a, b } = d;
  const others = [...comparisonsFor(a.slug), ...comparisonsFor(b.slug)].filter((o, i, arr) => o.slug !== c.slug && arr.findIndex((x) => x.slug === o.slug) === i).slice(0, 6);
  return (
    <>
      <Breadcrumbs items={[{ name: "Compare", href: "/compare" }, { name: c.title, href: `/compare/${c.slug}` }]} />
      <h1>{c.title}</h1>
      <p className="lede">{c.question} The differences that matter for a home server:</p>
      <ul className="prose">{differences(a, b).map((t) => <li key={t}>{t}</li>)}</ul>
      <h2>Full spec comparison</h2>
      <CompareTable models={[a, b]} />
      {(a.confidence === "check" || b.confidence === "check") && (
        <p className="notice small">At least one of these models has specs we have not fully verified against the official manual. Confirm slot counts for the exact machine type before buying.</p>
      )}
      <h2>Which one for which job</h2>
      <div className="grid-2">
        {[a, b].map((m) => {
          const uses = useCasesFor(m);
          return (
            <div key={m.slug} className="panel">
              <h3 style={{ marginTop: 0 }}><Link href={`/models/${m.slug}`}>{m.shortName}</Link></h3>
              {uses.length ? <ul className="chips">{uses.map((u) => <li key={u.slug}><Link href={`/best/${u.slug}`}>{u.label}</Link></li>)}</ul> : <p className="small muted">Meets none of our use-case criteria on its own; best as a light single-purpose server.</p>}
              <p className="small">Upgrades: {m.ram.slots}× {m.ram.type}-{m.ram.speedMTs} SODIMM (max {m.ram.maxOfficialGB} GB official), {m.storage.m2Nvme}× M.2 2280 NVMe{m.storage.sata25 ? ` + ${m.storage.sata25}× 2.5" SATA` : ""}{m.extraNicOption ? `, ${m.extraNicOption}` : ""}.</p>
            </div>
          );
        })}
      </div>
      <p className="btn-row">
        <Link className="btn" href={`/models/${a.slug}`}>{a.shortName} details</Link>
        <Link className="btn" href={`/models/${b.slug}`}>{b.shortName} details</Link>
      </p>
      <h2>Share this comparison</h2>
      <ShareLinks url={absoluteUrl(`/compare/${c.slug}`)} title={`${c.title}: ${c.question}`} />
      {others.length > 0 && (
        <>
          <h2>Other comparisons</h2>
          <ul>{others.map((o) => <li key={o.slug}><Link href={`/compare/${o.slug}`}>{o.title}</Link>: {o.question}</li>)}</ul>
        </>
      )}
    </>
  );
}
