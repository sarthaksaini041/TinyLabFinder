import Link from "next/link";
import type { ModelView } from "../lib/catalog";
import { genRange, idleLabel, pcieLabel } from "../lib/catalog";
import { VERDICT_TEXT } from "../lib/media";

const ROWS: [string, (m: ModelView) => string][] = [
  ["Released", (m) => String(m.released)],
  ["CPU generations", genRange],
  ["Most threads", (m) => String(m.maxThreads)],
  ["Chipset", (m) => m.chipset ?? "Not listed"],
  ["Memory type", (m) => `${m.ram.type}-${m.ram.speedMTs}`],
  ["Max RAM (official)", (m) => `${m.ram.maxOfficialGB} GB`],
  ["M.2 NVMe slots", (m) => String(m.storage.m2Nvme)],
  ['2.5" bays', (m) => String(m.storage.sata25)],
  ["PCIe expansion", (m) => pcieLabel(m.pcieSlot)],
  ["Onboard NIC", (m) => m.nic ?? "Not listed"],
  ["Second NIC option", (m) => m.extraNicOption ?? "USB only"],
  ["2.5/10GbE path", (m) => (m.lanUpgrades ?? []).map((u) => `${u.speed}${u.basis === "community" ? " (owner-reported)" : ""}`).join(", ") || "USB only"],
  ["AV1 decode", (m) => (m.av1 ? "Yes (best CPU option)" : "No")],
  ["Transcoding", (m) => VERDICT_TEXT[m.verdict]],
  ["Idle power (measured)", idleLabel],
  ["Spec confidence", (m) => (m.confidence === "high" ? "Widely confirmed" : "Verify before buying")],
];

export function CompareTable({ models }: { models: ModelView[] }) {
  return (
    <div className="table-scroll panel" role="region" aria-label="Model specifications comparison" tabIndex={0} style={{ padding: 0 }}>
      <table className="grid-table">
        <thead>
          <tr>
            <th scope="col">Spec</th>
            {models.map((m) => <th key={m.slug} scope="col"><Link href={`/models/${m.slug}`}>{m.shortName}</Link></th>)}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([label, get]) => {
            const vals = models.map(get);
            const differs = new Set(vals).size > 1;
            return (
              <tr key={label} className={differs ? "diff" : undefined}>
                <th scope="row">{label}</th>
                {vals.map((v, i) => <td key={models[i].slug}>{v}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Plain-language differences, derived from data (no hand-written marketing copy). */
export function differences(a: ModelView, b: ModelView): string[] {
  const out: string[] = [];
  if (a.storage.m2Nvme !== b.storage.m2Nvme) {
    const [more, less] = a.storage.m2Nvme > b.storage.m2Nvme ? [a, b] : [b, a];
    out.push(`${more.shortName} has ${more.storage.m2Nvme} M.2 NVMe slots; ${less.shortName} has ${less.storage.m2Nvme}. That matters for ZFS mirrors or separating boot and VM storage.`);
  }
  if ((a.pcieSlot === "none") !== (b.pcieSlot === "none")) {
    const [yes, no] = a.pcieSlot !== "none" ? [a, b] : [b, a];
    out.push(`${yes.shortName} can take a PCIe card (${pcieLabel(yes.pcieSlot)}); ${no.shortName} cannot. Choose ${yes.shortName} for a router, 10GbE or an HBA.`);
  }
  if ((a.extraNicOption === null) !== (b.extraNicOption === null)) {
    const [yes, no] = a.extraNicOption ? [a, b] : [b, a];
    out.push(`${yes.shortName} has a built-in path to a second network port (${yes.extraNicOption}); on ${no.shortName} you would need a USB adapter.`);
  }
  if (a.ram.maxOfficialGB !== b.ram.maxOfficialGB) {
    const [more, less] = a.ram.maxOfficialGB > b.ram.maxOfficialGB ? [a, b] : [b, a];
    out.push(`${more.shortName} officially supports ${more.ram.maxOfficialGB} GB of RAM versus ${less.ram.maxOfficialGB} GB, useful if you plan several VMs.`);
  }
  if (a.maxThreads !== b.maxThreads) {
    const [more, less] = a.maxThreads > b.maxThreads ? [a, b] : [b, a];
    out.push(`The top CPU option in ${more.shortName} has ${more.maxThreads} threads versus ${less.maxThreads} in ${less.shortName}.`);
  }
  if (a.ram.type !== b.ram.type) out.push(`${a.shortName} takes ${a.ram.type} and ${b.shortName} takes ${b.ram.type} SODIMMs: RAM is not interchangeable between them.`);
  if ((a.lanUpgrades?.length ?? 0) !== (b.lanUpgrades?.length ?? 0)) {
    const [yes, no] = a.lanUpgrades?.length ? [a, b] : [b, a];
    out.push(`${yes.shortName} has a path to ${yes.lanUpgrades!.map((u) => u.speed).join("/")} networking; ${no.shortName} is limited to 1 GbE plus USB adapters.`);
  }
  if (a.verdict !== b.verdict) out.push(`Transcoding: ${a.shortName}: ${VERDICT_TEXT[a.verdict].toLowerCase()}; ${b.shortName}: ${VERDICT_TEXT[b.verdict].toLowerCase()}.`);
  if ((a.nic ?? "") !== (b.nic ?? "") && a.nic && b.nic) out.push(`Onboard Ethernet differs: ${a.shortName} uses ${a.nic}, ${b.shortName} uses ${b.nic}.`);
  if (!out.length) out.push("On paper these are nearly identical. Buy whichever is cheaper in the configuration you need, and check the CPU and power adapter.");
  return out;
}
