import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { ModelTable } from "../../../components/ModelTable";
import { GUIDES } from "../../../data/guides";
import { PUBLISHED_USE_CASES, getUseCase, matches } from "../../../data/usecases";
import { SITE, absoluteUrl } from "../../../lib/site";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return PUBLISHED_USE_CASES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const u = getUseCase((await params).slug);
  if (!u) return {};
  return {
    title: u.title,
    description: u.description,
    alternates: { canonical: `/best/${u.slug}` },
    openGraph: { title: u.title, description: u.description, url: `/best/${u.slug}`, images: ["/opengraph-image"] },
    twitter: { card: "summary_large_image", title: u.title, description: u.description },
  };
}

export default async function UseCasePage({ params }: Props) {
  const u = getUseCase((await params).slug);
  if (!u) notFound();
  const list = matches(u);
  const guides = u.guides.map((g) => GUIDES.find((x) => x.slug === g)).filter((g): g is NonNullable<typeof g> => Boolean(g));
  const related = u.related.map((r) => PUBLISHED_USE_CASES.find((x) => x.slug === r)).filter((r): r is NonNullable<typeof r> => Boolean(r));
  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: u.title,
    description: u.description,
    url: absoluteUrl(`/best/${u.slug}`),
    numberOfItems: list.length,
    itemListElement: list.map((m, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/models/${m.slug}`), name: m.name })),
  };
  return (
    <>
      <Breadcrumbs items={[{ name: "Best for", href: "/best" }, { name: u.label, href: `/best/${u.slug}` }]} />
      <div className="layout">
        <article>
          <h1>{u.title}</h1>
          <p className="lede">{u.context}</p>
          <p className="notice small"><strong>Criteria:</strong> {u.criteria} {list.length} of our models match. Data last reviewed {SITE.dataUpdated}.</p>
          <ModelTable models={list} cols={["released", "gen", "why"]} why={u.why} caption={u.title} />
          {u.finderQuery && <p><Link href={`/${u.finderQuery}`}>Open this filter in the finder →</Link></p>}
          {guides.length > 0 && (
            <>
              <h2>Guides</h2>
              <ul>{guides.map((g) => <li key={g.slug}><Link href={`/guides/${g.slug}`}>{g.title}</Link></li>)}</ul>
            </>
          )}
          {related.length > 0 && (
            <>
              <h2>Related lists</h2>
              <ul>{related.map((r) => <li key={r.slug}><Link href={`/best/${r.slug}`}>{r.title}</Link></li>)}</ul>
            </>
          )}
          <p className="small muted">Something wrong or missing? <Link href="/contact">Send a correction</Link>. Lists are built from each model&apos;s documented specs; models marked &quot;verify&quot; have fields we could not confirm from an official document.</p>
        </article>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
