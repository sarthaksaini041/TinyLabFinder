"use client";
import { useEffect, useState } from "react";
import { ModelPhoto } from "../ModelPhoto";

/** Model-page photo, loaded from the same price endpoint the price box uses. */
export function ModelHeroPhoto({ slug, name }: { slug: string; name: string }) {
  const [img, setImg] = useState<{ imageUrl: string; listingUrl: string | null } | null | undefined>(undefined);
  useEffect(() => {
    fetch(`/api/prices/${slug}`).then((r) => (r.ok ? r.json() : null)).then((j) => setImg(j?.image ?? null)).catch(() => setImg(null));
  }, [slug]);
  if (img === undefined) return <div className="model-photo model-photo--hero model-photo--loading" aria-hidden="true" />;
  return <ModelPhoto name={name} image={img?.imageUrl} listingUrl={img?.listingUrl} size="hero" priority />;
}
