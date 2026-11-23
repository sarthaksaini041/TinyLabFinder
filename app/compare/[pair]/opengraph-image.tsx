import { ImageResponse } from "next/og";
import { COMPARISONS } from "../../../data/comparisons";
import { getBrandIconDataUrl } from "../../../lib/brand";
import { getView } from "../../../lib/catalog";
import { SITE } from "../../../lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Side-by-side spec comparison";

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ pair: c.slug }));
}

const row = (label: string, a: string, b: string) => ({ label, a, b, diff: a !== b });

export default async function OG({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const logo = await getBrandIconDataUrl();
  const c = COMPARISONS.find((x) => x.slug === pair);
  const a = c && getView(c.a);
  const b = c && getView(c.b);
  const rows = a && b ? [
    row("Max RAM", `${a.ram.maxOfficialGB} GB ${a.ram.type}`, `${b.ram.maxOfficialGB} GB ${b.ram.type}`),
    row("NVMe + 2.5\"", `${a.storage.m2Nvme} + ${a.storage.sata25}`, `${b.storage.m2Nvme} + ${b.storage.sata25}`),
    row("PCIe", a.pcieSlot === "none" ? "No" : "Yes", b.pcieSlot === "none" ? "No" : "Yes"),
    row("Top CPU threads", String(a.maxThreads), String(b.maxThreads)),
    row("AV1 decode", a.av1 ? "Yes" : "No", b.av1 ? "Yes" : "No"),
  ] : [];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: 64, background: "#f6f7ef", color: "#202820" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 28, fontWeight: 700, color: "#546052" }}>
          <img src={logo} width={40} height={40} alt="" style={{ borderRadius: 9 }} />
          {SITE.name} · head-to-head
        </div>
        <div style={{ display: "flex", fontSize: 58, fontWeight: 700, marginTop: 18, lineHeight: 1.1 }}>{c ? c.title : SITE.tagline}</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontSize: 30 }}>
          {rows.map((r) => (
            <div key={r.label} style={{ display: "flex", padding: "10px 0", borderBottom: "2px solid #d9dfd1" }}>
              <div style={{ display: "flex", width: 330, color: "#546052" }}>{r.label}</div>
              <div style={{ display: "flex", width: 330, fontWeight: r.diff ? 700 : 400, color: r.diff ? "#315b3b" : "#202820" }}>{r.a}</div>
              <div style={{ display: "flex", width: 330, fontWeight: r.diff ? 700 : 400, color: r.diff ? "#315b3b" : "#202820" }}>{r.b}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
