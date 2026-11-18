import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "../../../components/ads/AdSlot";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { GUIDES, GUIDE_CATEGORIES, getGuide } from "../../../data/guides";
import { PUBLISHED_USE_CASES } from "../../../data/usecases";
import { SITE, absoluteUrl } from "../../../lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const { title, description, slug, published, updated } = guide;
  const path = `/guides/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article", title, description, url: path, siteName: SITE.name,
      images: ["/opengraph-image"], publishedTime: published, modifiedTime: updated,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function GuidePage({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const path = `/guides/${guide.slug}`;
  const related = (guide.related ?? []).filter(({ href }) =>
    !href.startsWith("/best/") || PUBLISHED_USE_CASES.some(({ slug }) => `/best/${slug}` === href),
  );
  const category = GUIDE_CATEGORIES[guide.category];
  const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(guide.updated));
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.updated,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    author: { "@type": "Organization", name: SITE.name, url: absoluteUrl("/about") },
    publisher: { "@type": "Organization", name: SITE.name, url: absoluteUrl("/") },
  };

  return (
    <>
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: guide.title, href: path }]} />
      <header className="collection-header guide-header">
        <Link className="guide-header__topic" href={`/guides#${guide.category}`}>{category}</Link>
        <h1 id="guide-title">{guide.title}</h1>
        <p className="lede">{guide.description}</p>
        <p className="small muted">Updated <time dateTime={guide.updated}>{date}</time></p>
      </header>
      <div className="guide-layout">
        <article className="prose guide-body" aria-labelledby="guide-title">
          {guide.body()}
          <AdSlot placement="in-content" />
        </article>
        <aside className="guide-sidebar">
          <nav className="panel guide-sidebar__links" aria-label="Related reading">
            <h2>Continue reading</h2>
            <ul>
              {related.map(({ href, label }) => <li key={href}><Link href={href}>{label}</Link></li>)}
              <li><Link href="/guides">All mini PC guides</Link></li>
            </ul>
          </nav>
          <AdSlot placement="sidebar" />
        </aside>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </>
  );
}
