"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ModelView } from "../lib/catalog";
import { VERDICT_TEXT } from "../lib/media";
import { track } from "./analytics/track";
import { DropdownSelect } from "./DropdownSelect";
import { useCompare } from "./useCompare";

type Sort = "newest" | "oldest" | "threads" | "drives";

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest (cheapest) first" },
  { value: "threads", label: "Most CPU threads" },
  { value: "drives", label: "Most drive bays" },
];
interface Filters {
  brands: string[];
  twoNvme: boolean;
  pcie: boolean;
  secondNic: boolean;
  ram64: boolean;
  media: "any" | "hevc10" | "av1";
  vendor: "any" | "Intel" | "AMD";
  sort: Sort;
}
const DEFAULTS: Filters = { brands: [], twoNvme: false, pcie: false, secondNic: false, ram64: false, media: "any", vendor: "any", sort: "newest" };

function fromQuery(q: URLSearchParams): Filters {
  const media = q.get("media");
  const vendor = q.get("cpu");
  const sort = q.get("sort");
  return {
    brands: (q.get("brand") || "").split(",").filter(Boolean),
    twoNvme: q.get("nvme") === "2",
    pcie: q.get("pcie") === "1",
    secondNic: q.get("nic2") === "1",
    ram64: q.get("ram") === "64",
    media: media === "hevc10" || media === "av1" ? media : "any",
    vendor: vendor === "Intel" || vendor === "AMD" ? vendor : "any",
    sort: sort === "oldest" || sort === "threads" || sort === "drives" ? sort : "newest",
  };
}
function toQuery(f: Filters): string {
  const q = new URLSearchParams();
  if (f.brands.length) q.set("brand", f.brands.join(","));
  if (f.twoNvme) q.set("nvme", "2");
  if (f.pcie) q.set("pcie", "1");
  if (f.secondNic) q.set("nic2", "1");
  if (f.ram64) q.set("ram", "64");
  if (f.media !== "any") q.set("media", f.media);
  if (f.vendor !== "any") q.set("cpu", f.vendor);
  if (f.sort !== "newest") q.set("sort", f.sort);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function applyFilters(items: ModelView[], f: Filters): ModelView[] {
  const out = items.filter(
    (m) =>
      (!f.brands.length || f.brands.includes(m.brand)) &&
      (!f.twoNvme || m.storage.m2Nvme >= 2) &&
      (!f.pcie || m.pcieSlot !== "none") &&
      (!f.secondNic || m.extraNicOption !== null) &&
      (!f.ram64 || m.ram.maxOfficialGB >= 64) &&
      (f.media === "any" || (f.media === "hevc10" ? m.hevc10 : m.av1)) &&
      (f.vendor === "any" || m.vendor === f.vendor),
  );
  const by: Record<Sort, (a: ModelView, b: ModelView) => number> = {
    newest: (a, b) => b.released - a.released || b.maxGen - a.maxGen,
    oldest: (a, b) => a.released - b.released,
    threads: (a, b) => b.maxThreads - a.maxThreads,
    drives: (a, b) => b.totalDrives - a.totalDrives || b.storage.m2Nvme - a.storage.m2Nvme,
  };
  return out.sort(by[f.sort]);
}

export function Finder({ items }: { items: ModelView[] }) {
  const [f, setF] = useState<Filters>(DEFAULTS);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const compare = useCompare();

  useEffect(() => {
    setF(fromQuery(new URLSearchParams(window.location.search)));
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    window.history.replaceState(null, "", `${window.location.pathname}${toQuery(f)}`);
  }, [f, hydrated]);

  const results = useMemo(() => applyFilters(items, f), [items, f]);
  const update = (patch: Partial<Filters>, name: string) => {
    setF((prev) => ({ ...prev, ...patch }));
    track("filter_change", { filter: name });
  };
  const brands = [...new Set(items.map((i) => i.brand))];
  const activeCount =
    f.brands.length + [f.twoNvme, f.pcie, f.secondNic, f.ram64, f.media !== "any", f.vendor !== "any"].filter(Boolean).length;
  const active = activeCount > 0;

  return (
    <div className="finder">
      <section className="filters panel" data-open={open} aria-label="Filters">
        <button type="button" className="btn filters-toggle" aria-expanded={open} aria-controls="filters-body" onClick={() => setOpen(!open)}>
          <span className="filters-toggle__label">
            Filters
            {activeCount > 0 && <span className="filters-toggle__count" aria-label={`${activeCount} active`}>{activeCount}</span>}
          </span>
          <span className="filters-toggle__chev" aria-hidden="true" />
        </button>
        <div className="filters__body" id="filters-body">
          <fieldset>
            <legend>Brand</legend>
            {brands.map((b) => (
              <label key={b} className="check">
                <input
                  type="checkbox"
                  checked={f.brands.includes(b)}
                  onChange={(e) => update({ brands: e.target.checked ? [...f.brands, b] : f.brands.filter((x) => x !== b) }, "brand")}
                />
                {b}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Storage &amp; expansion</legend>
            <label className="check"><input type="checkbox" checked={f.twoNvme} onChange={(e) => update({ twoNvme: e.target.checked }, "nvme2")} />2+ M.2 NVMe slots</label>
            <label className="check"><input type="checkbox" checked={f.pcie} onChange={(e) => update({ pcie: e.target.checked }, "pcie")} />PCIe / riser expansion</label>
            <label className="check"><input type="checkbox" checked={f.secondNic} onChange={(e) => update({ secondNic: e.target.checked }, "nic2")} />Second NIC option (no USB)</label>
            <label className="check"><input type="checkbox" checked={f.ram64} onChange={(e) => update({ ram64: e.target.checked }, "ram64")} />64 GB RAM officially</label>
          </fieldset>
          <fieldset>
            <legend>Plex / Jellyfin transcoding</legend>
            {([["any", "Any"], ["hevc10", "4K HEVC 10-bit decode"], ["av1", "AV1 decode"]] as const).map(([v, l]) => (
              <label key={v} className="check">
                <input type="radio" name="media" checked={f.media === v} onChange={() => update({ media: v }, "media")} />
                {l}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>CPU</legend>
            {(["any", "Intel", "AMD"] as const).map((v) => (
              <label key={v} className="check">
                <input type="radio" name="cpu" checked={f.vendor === v} onChange={() => update({ vendor: v }, "cpu")} />
                {v === "any" ? "Any" : v}
              </label>
            ))}
          </fieldset>
          {active && (
            <button type="button" className="btn" onClick={() => update({ ...DEFAULTS, sort: f.sort }, "reset")}>
              Clear filters
            </button>
          )}
        </div>
      </section>

      <section aria-label="Results">
        <div className="results-bar">
          <p className="muted" role="status" aria-live="polite" style={{ margin: 0 }}>
            {results.length} of {items.length} models
          </p>
          <div className="sort-control">
            <span className="sort-label" id="sort-label">Sort</span>
            <DropdownSelect<Sort>
              id="sort-select"
              ariaLabelledBy="sort-label"
              value={f.sort}
              onChange={(next) => update({ sort: next }, "sort")}
              options={SORT_OPTIONS}
              size="small"
            />
          </div>
        </div>

        {results.length === 0 ? (
          <div className="empty">
            <p><strong>No model matches all of those filters.</strong></p>
            <p className="muted">The rarest combination is PCIe expansion with two NVMe slots. Try removing one filter.</p>
            <button type="button" className="btn" onClick={() => update({ ...DEFAULTS, sort: f.sort }, "reset")}>Clear filters</button>
          </div>
        ) : (
          <ul className="cards">
            {results.map((m) => {
              const inCompare = compare.list.includes(m.slug);
              return (
                <li key={m.slug} className="card">
                  <div className="card__top">
                    <h2 className="card__title"><Link href={`/models/${m.slug}`}>{m.name}</Link></h2>
                    <span className="muted small">{m.released} · {m.chipset ?? m.family}</span>
                  </div>
                  <span className="verdict small"><span className={`dot dot--${m.verdict}`} aria-hidden="true" />{VERDICT_TEXT[m.verdict]}</span>
                  <dl className="kv">
                    <div><dt>CPUs</dt><dd>{m.cpuList.map((c) => c.name.replace(/^(Core|Ryzen \d PRO) /, "")).join(", ")}</dd></div>
                    <div><dt>NVMe / 2.5&quot;</dt><dd>{m.storage.m2Nvme} / {m.storage.sata25}</dd></div>
                    <div><dt>Max RAM</dt><dd>{m.ram.maxOfficialGB} GB official</dd></div>
                    <div><dt>Expansion</dt><dd>{m.pcieSlot === "none" ? (m.extraNicOption ? "Flex IO" : "None") : "PCIe"}</dd></div>
                  </dl>
                  <div className="btn-row" style={{ margin: "4px 0 0" }}>
                    <Link className="btn" href={`/models/${m.slug}`}>Specs &amp; buying notes</Link>
                    <button
                      type="button"
                      className="btn"
                      aria-pressed={inCompare}
                      disabled={!inCompare && compare.full}
                      onClick={() => {
                        compare.toggle(m.slug);
                        if (!inCompare) track("compare_add", { model: m.slug });
                      }}
                    >
                      {inCompare ? "✓ In compare" : "Add to compare"}
                    </button>
                    {m.confidence === "check" && <span className="badge badge--check" title="Some specs not yet verified against the official manual">Verify specs</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {compare.list.length > 0 && (
          <div className="compare-tray" role="region" aria-label="Compare selection">
            <span>{compare.list.length} of {compare.max} selected</span>
            <span className="btn-row" style={{ margin: 0 }}>
              <button type="button" className="btn" onClick={compare.clear}>Clear</button>
              <Link className="btn btn--primary" href={`/compare?m=${compare.list.join(",")}`}>Compare now</Link>
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
