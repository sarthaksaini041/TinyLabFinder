"use client";
import { useEffect, useState } from "react";
import { MARKETPLACES, type MarketplaceId } from "../../lib/listings";
import { PriceChart } from "./PriceChart";

type Latest = { marketplace: MarketplaceId; currency: string; minPrice: number; medianPrice: number; sampleSize: number; observedAt: string; fresh: boolean };
type Resp = { status: "ACTIVE" | "PENDING_CREDENTIALS" | "DISABLED"; degraded: boolean; latest: Latest[]; history: { day: string; minPrice: number; currency: string }[] };

const money = (v: number, c: string) => new Intl.NumberFormat("en", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(v);

/** Live asking prices from the price sync. Shows an honest empty state when there is no data. */
type Initial = { min: number; median: number; currency: string; n: number; at: string } | null;

export function PriceBox({ slug, initial }: { slug: string; initial?: Initial }) {
  const [d, setD] = useState<Resp | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let live = true;
    fetch(`/api/prices/${slug}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(r.status))).then((j) => live && setD(j)).catch(() => live && setErr(true));
    return () => { live = false; };
  }, [slug]);

  // Until the client refresh arrives, show the server-rendered price (no loading flash, no layout shift).
  if (!d && initial) {
    return (
      <div className="panel price-box">
        <p style={{ margin: "0 0 4px" }}>
          <strong>Currently from {money(initial.min, initial.currency)}</strong> on eBay US{" "}
          <span className="small muted">(median {money(initial.median, initial.currency)} across {initial.n} used listings, checked {new Date(initial.at).toLocaleDateString()})</span>
        </p>
        <p className="small muted" style={{ margin: "4px 0 0" }}>Asking prices of active fixed-price listings; configuration (CPU, RAM, SSD) varies.</p>
      </div>
    );
  }
  if (err) return <p className="notice small">Prices are unavailable right now. The marketplace search links below still work.</p>;
  if (!d) return <div className="panel price-box" aria-busy="true"><p className="muted small" style={{ margin: 0 }}>Checking current eBay prices…</p></div>;
  const fresh = d.latest.filter((l) => l.fresh);
  if (!fresh.length) {
    return (
      <div className="panel price-box">
        <p style={{ margin: 0 }}><strong>Price data coming soon.</strong></p>
        <p className="small muted" style={{ margin: "4px 0 0" }}>
          {d.status === "PENDING_CREDENTIALS"
            ? "We will show live used-market asking prices here once our marketplace data feed is connected. We never show estimated prices."
            : "No recent listings were found for this model. Try the marketplace searches below."}
        </p>
      </div>
    );
  }
  return (
    <div className="panel price-box">
      {fresh.map((l) => (
        <p key={l.marketplace} style={{ margin: "0 0 4px" }}>
          <strong>Currently from {money(l.minPrice, l.currency)}</strong> on {MARKETPLACES[l.marketplace].label}{" "}
          <span className="small muted">(median {money(l.medianPrice, l.currency)} across {l.sampleSize} used listings, checked {new Date(l.observedAt).toLocaleDateString()})</span>
        </p>
      ))}
      <p className="small muted" style={{ margin: "4px 0 0" }}>Asking prices of active fixed-price listings; configuration (CPU, RAM, SSD) varies.</p>
      {d.history.length >= 2 && <PriceChart points={d.history} />}
    </div>
  );
}
