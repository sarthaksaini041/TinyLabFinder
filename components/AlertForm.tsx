"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { MARKETPLACES, type MarketplaceId } from "../lib/listings";
import { track } from "./analytics/track";
import { errorsFrom, postJson } from "./auth/api";
import { DropdownSelect } from "./DropdownSelect";

interface Option { slug: string; name: string }

export function AlertForm({ models, email }: { models: Option[]; email: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const preset = models.some((m) => m.slug === params.get("model")) ? params.get("model")! : "";
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = { modelSlug: String(f.get("modelSlug") ?? ""), marketplace: String(f.get("marketplace") ?? "EBAY_US"), maxPrice: f.get("maxPrice") };
    const local: Record<string, string> = {};
    if (!body.modelSlug) local.modelSlug = "Choose a model.";
    const p = Number(body.maxPrice);
    if (!Number.isFinite(p) || p < 20 || p > 5000) local.maxPrice = "Enter a price between 20 and 5000.";
    setErrors(local);
    if (Object.keys(local).length) return;

    setBusy(true);
    const r = await postJson("/api/alerts", body);
    setBusy(false);
    if (r.data.ok) {
      setDone(true);
      track("alert_created", { market: body.marketplace });
      router.refresh();
    } else if (r.status === 401) {
      router.push(`/login?next=${encodeURIComponent("/alerts")}`);
    } else setErrors(errorsFrom(r));
  }

  if (done) {
    return (
      <div className="notice notice--ok" role="status">
        <p style={{ margin: 0 }}>Alert created. We&apos;ll email <strong>{email}</strong> when a matching listing appears.</p>
        <p className="btn-row" style={{ marginBottom: 0 }}>
          <Link className="btn" href="/account">View my alerts</Link>
          <button type="button" className="btn" onClick={() => setDone(false)}>Add another</button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="panel">
      <div className="field">
        <label htmlFor="modelSlug">Model</label>
        <DropdownSelect
          id="modelSlug"
          name="modelSlug"
          defaultValue={preset}
          placeholder="Choose a model…"
          options={[
            { value: "", label: "Choose a model…" },
            ...models.map((m) => ({ value: m.slug, label: m.name })),
          ]}
          ariaInvalid={!!errors.modelSlug}
          ariaDescribedBy={errors.modelSlug ? "e-model" : undefined}
        />
        {errors.modelSlug && <p className="field-error" id="e-model">{errors.modelSlug}</p>}
      </div>
      <div className="two-col">
        <div className="field">
          <label htmlFor="marketplace">Marketplace</label>
          <DropdownSelect
            id="marketplace"
            name="marketplace"
            defaultValue="EBAY_US"
            options={(Object.keys(MARKETPLACES) as MarketplaceId[]).map((id) => ({
              value: id,
              label: `${MARKETPLACES[id].label} (${MARKETPLACES[id].currency})`,
            }))}
          />
        </div>
        <div className="field">
          <label htmlFor="maxPrice">Maximum price</label>
          <input id="maxPrice" name="maxPrice" type="number" inputMode="numeric" min={20} max={5000} step={1} placeholder="e.g. 150" aria-invalid={!!errors.maxPrice} aria-describedby={errors.maxPrice ? "e-price" : undefined} />
          {errors.maxPrice && <p className="field-error" id="e-price">{errors.maxPrice}</p>}
        </div>
      </div>
      {errors.form && <p className="notice notice--err" role="alert">{errors.form}</p>}
      <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Create alert"}</button>
      <p className="small muted">Alerts go to {email}. At most one email a day per alert; every email has a one-click unsubscribe.</p>
    </form>
  );
}
