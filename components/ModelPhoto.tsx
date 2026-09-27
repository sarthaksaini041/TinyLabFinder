/* eslint-disable @next/next/no-img-element -- eBay's CDN already serves sized images; avoids image-optimisation quota */

/**
 * A real photo of the model from a representative eBay listing, or a neutral illustration
 * when no photo has been collected yet. Photos link to their listing, as eBay's API terms expect.
 */
export function ModelPhoto({ name, image, listingUrl, priority = false, size = "card" }: {
  name: string;
  image?: string | null;
  listingUrl?: string | null;
  priority?: boolean;
  size?: "card" | "hero";
}) {
  const cls = `model-photo model-photo--${size}`;
  if (!image) {
    return (
      <div className={`${cls} model-photo--empty`} aria-hidden="true">
        <svg viewBox="0 0 120 60" width="96" height="48">
          <rect x="6" y="14" width="108" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="100" cy="30" r="3" fill="currentColor" />
          <line x1="16" y1="24" x2="52" y2="24" stroke="currentColor" strokeWidth="2" opacity=".5" />
          <line x1="16" y1="32" x2="44" y2="32" stroke="currentColor" strokeWidth="2" opacity=".5" />
        </svg>
      </div>
    );
  }
  const img = (
    <img src={image} alt={`${name} (photo from an eBay listing)`} loading={priority ? "eager" : "lazy"} decoding="async" width={500} height={375} referrerPolicy="no-referrer" />
  );
  return (
    <figure className={cls}>
      {listingUrl ? <a href={listingUrl} target="_blank" rel="nofollow noopener" aria-label={`View the eBay listing this ${name} photo is from`}>{img}</a> : img}
      {size === "hero" && <figcaption className="small muted">Photo from a current eBay listing{listingUrl ? " (click to view)" : ""}. Units vary.</figcaption>}
    </figure>
  );
}
