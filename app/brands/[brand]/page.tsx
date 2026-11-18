import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { ModelTable } from "../../../components/ModelTable";
import { BRAND_COLLECTIONS } from "../../../data/brands";
import { CATALOG } from "../../../lib/catalog";
import { absoluteUrl, SITE } from "../../../lib/site";

type Props = { params: Promise<{ brand: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return BRAND_COLLECTIONS.map(({ slug }) => ({ brand: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params;
  const collection = BRAND_COLLECTIONS.find((item) => item.slug === brand);
  if (!collection) notFound();
  const title = `Used ${collection.brand} ${collection.family} PCs compared`;
  const description = collection.description;
  const path = `/brands/${collection.slug}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE.name },
    twitter: { title, description, card: "summary_large_image" },
  };
}

export default async function BrandPage({ params }: Props) {
  const { brand } = await params;
  const collection = BRAND_COLLECTIONS.find((item) => item.slug === brand);
  if (!collection) notFound();
  const models = CATALOG.filter((model) => model.brand === collection.brand)
    .sort((a, b) => b.released - a.released);
  const path = `/brands/${collection.slug}`;
  const title = `Used ${collection.brand} ${collection.family} PCs`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description: collection.description,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: models.map((model, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: model.name,
        url: absoluteUrl(`/models/${model.slug}`),
      })),
    },
  };

  return (
    <>
      <Breadcrumbs items={[{ name: collection.brand, href: path }]} />
      <header className="collection-header">
        <h1>{title}</h1>
        <p className="lede">{collection.description}</p>
        <div className="btn-row">
          <Link href={`/?brand=${collection.brand}#finder`} className="btn btn--primary">Filter {collection.brand} models</Link>
          <Link href="/compare" className="btn">Compare any models</Link>
        </div>
      </header>
      <section className="collection-section" aria-labelledby="brand-specs">
        <h2 id="brand-specs">{collection.brand} mini PC specifications</h2>
        <p className="muted">{models.length} models in the catalog. Open a model for its full specs and buying notes.</p>
        <ModelTable models={models} cols={["released", "ram", "drives", "pcie"]} caption={`${collection.brand} mini PC specifications`} />
      </section>
      <section className="prose collection-section" aria-labelledby="brand-checks">
        <h2 id="brand-checks">What to check on a used listing</h2>
        <ul>{collection.checks.map((check) => <li key={check}>{check}</li>)}</ul>
        <p><Link href="/guides/check-a-used-mini-pc-listing">Read the full used mini PC buying checklist</Link></p>
      </section>
      <nav className="collection-section" aria-label="Other brands">
        <h2>Compare other mini PC brands</h2>
        <ul className="chips">
          {BRAND_COLLECTIONS.filter((item) => item.slug !== brand).map((item) => (
            <li key={item.slug}><Link href={`/brands/${item.slug}`}>{item.brand} {item.family}</Link></li>
          ))}
        </ul>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </>
  );
}
