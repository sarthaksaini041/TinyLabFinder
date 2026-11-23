import { ImageResponse } from "next/og";
import { getBrandIconDataUrl } from "../lib/brand";
import { SITE } from "../lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = SITE.tagline;

export default async function OG() {
  const logo = await getBrandIconDataUrl();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#f6f7ef", color: "#202820" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 36, fontWeight: 700 }}>
          <img src={logo} width={64} height={64} alt="" style={{ borderRadius: 14 }} />
          {SITE.name}
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 40, lineHeight: 1.1 }}>{SITE.tagline}</div>
        <div style={{ fontSize: 30, marginTop: 28, color: "#546052" }}>ThinkCentre Tiny · OptiPlex Micro · EliteDesk Mini</div>
      </div>
    ),
    size,
  );
}
