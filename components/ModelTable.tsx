import Link from "next/link";
import { genRange, networkingLabel, pcieLabel, type ModelView } from "../lib/catalog";

export type Col = "gen" | "ram" | "ramType" | "nvme" | "drives" | "pcie" | "network" | "vpro" | "released" | "why";

const HEAD: Record<Col, string> = {
  gen: "CPU generations", ram: "Max RAM (official)", ramType: "Memory", nvme: "M.2 NVMe", drives: "Drives (NVMe + 2.5\")",
  pcie: "PCIe", network: "Faster networking", vpro: "vPro", released: "Year", why: "Why it matches",
};

function cell(m: ModelView, c: Col, why?: (m: ModelView) => string): string {
  switch (c) {
    case "gen": return genRange(m);
    case "ram": return `${m.ram.maxOfficialGB} GB`;
    case "ramType": return `${m.ram.slots}× ${m.ram.type}-${m.ram.speedMTs}`;
    case "nvme": return String(m.storage.m2Nvme);
    case "drives": return `${m.storage.m2Nvme} + ${m.storage.sata25}`;
    case "pcie": return pcieLabel(m.pcieSlot);
    case "network": return (m.lanUpgrades ?? []).length ? networkingLabel(m) : "1 GbE (USB for more)";
    case "vpro": return m.vpro === "some-skus" ? "Some CPUs" : "No";
    case "released": return String(m.released);
    case "why": return why ? why(m) : "";
  }
}

/** Data-driven table of models for guides and use-case pages. */
export function ModelTable({ models, cols, why, caption }: { models: ModelView[]; cols: Col[]; why?: (m: ModelView) => string; caption?: string }) {
  return (
    <div className="table-scroll panel" tabIndex={caption ? 0 : undefined} role={caption ? "region" : undefined} aria-label={caption} style={{ padding: 0 }}>
      <table className="grid-table">
        {caption && <caption className="skip">{caption}</caption>}
        <thead>
          <tr><th scope="col">Model</th>{cols.map((c) => <th key={c} scope="col">{HEAD[c]}</th>)}</tr>
        </thead>
        <tbody>
          {models.map((m) => (
            <tr key={m.slug}>
              <th scope="row"><Link href={`/models/${m.slug}`}>{m.name}</Link>{m.confidence === "check" && <span className="small muted"> (verify)</span>}</th>
              {cols.map((c) => <td key={c}>{cell(m, c, why)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
