import Link from "next/link";
import type { ReactNode } from "react";
import { MediaTable } from "../components/MediaTable";
import { CATALOG, type ModelView } from "../lib/catalog";
import { NEW_GUIDES } from "./guides-more";

import { HOME_SERVER_GUIDES } from "./guides-home-server";

export const GUIDE_CATEGORIES = {
  buying: "Buying & power",
  workloads: "Home server workloads",
  upgrades: "Parts & upgrades",
} as const;

export interface Guide {
  slug: string;
  category: keyof typeof GUIDE_CATEGORIES;
  title: string;
  description: string;
  updated: string;
  published?: string;
  body: () => ReactNode;
  /** Models this guide is relevant to (drives "Related guides" on model pages). */
  models?: (m: ModelView) => boolean;
  /** Related /best pages and guides, shown under the article. */
  related?: { href: string; label: string }[];
}

export const GUIDES: Guide[] = [
  {
    slug: "quick-sync-generations-plex-jellyfin",
    category: "workloads",
    title: "Which used mini PCs can transcode 4K for Plex and Jellyfin?",
    description: "Intel Quick Sync and AMD VCN capabilities by generation, and what they mean for 4K HEVC, HDR and AV1 files on a used mini PC media server.",
    updated: "2026-09-25",
    models: (m) => m.vendor === "Intel",
    related: [{ href: "/best/best-mini-pc-for-plex-4k", label: "Best used mini PCs for Plex 4K" }, { href: "/best/mini-pcs-with-av1-decode", label: "Mini PCs with AV1 decode" }, { href: "/?media=av1", label: "Filter the finder for AV1 decode" }],
    body: () => (
      <>
        <p>
          The CPU generation decides what a used mini PC can transcode, not the brand or the chassis. The video engine
          inside the processor&apos;s integrated graphics does the work. The key question is whether it can decode the
          formats in your library in hardware.
        </p>
        <MediaTable families={["intel-gen9", "intel-gen9.5", "intel-xe", "amd-vcn1", "amd-vcn2"]} />
        <h2>The practical rules</h2>
        <ul>
          <li><strong>6th gen (Skylake), e.g. i5-6500T:</strong> fine for 1080p H.264. It cannot fully decode 10-bit HEVC in hardware, which is what most 4K HDR files use, so those fall back to the CPU and stutter.</li>
          <li><strong>7th–10th gen (Kaby Lake to Comet Lake), e.g. i5-8500T, i5-10500T:</strong> hardware-decode 10-bit HEVC and VP9. This is the sweet spot on price in used 1-litre PCs. No AV1 decode.</li>
          <li><strong>11th gen and newer, e.g. i5-11500T, i5-12500T:</strong> add AV1 decode. Buy this if your library or your sources are moving to AV1.</li>
          <li><strong>AMD Ryzen PRO APUs:</strong> they work with Jellyfin via VA-API, but encoder quality and media-server support are behind Intel Quick Sync. Buy AMD for CPU cores, not for transcoding.</li>
        </ul>
        <h2>Plex vs Jellyfin</h2>
        <p>
          Plex requires a Plex Pass subscription to use hardware transcoding; Jellyfin supports it for free. Jellyfin&apos;s
          hardware-selection documentation has removed Intel 7th–10th gen from its recommended list because Intel deprecated
          its media toolkit for those generations. They still decode 10-bit HEVC today, but newer generations are the
          longer-term choice.
        </p>
        <h2>Avoid transcoding in the first place</h2>
        <p>
          The best transcode is none at all. If your TVs and phones can play your files directly (&quot;direct play&quot;),
          even an old 6th-gen box works. Transcoding is mostly needed for remote streaming at lower bitrates and for
          clients that do not support HEVC.
        </p>
        <h2>Models by transcoding capability</h2>
        <ul>
          {CATALOG.filter((m) => m.hevc10).map((m) => (
            <li key={m.slug}><Link href={`/models/${m.slug}`}>{m.name}</Link> ({m.cpuList.map((c) => c.name).join(", ")})</li>
          ))}
        </ul>
        <p><Link href="/?media=hevc10">Filter the finder to 4K HEVC-capable models →</Link></p>
      </>
    ),
  },
  {
    slug: "check-a-used-mini-pc-listing",
    category: "buying",
    title: "How to check a used mini PC listing before you buy",
    description: "A practical checklist for buying an ex-office ThinkCentre Tiny, OptiPlex Micro or EliteDesk Mini: CPU, RAM, power adapter, drive caddies, BIOS locks and fair prices.",
    updated: "2026-09-25",
    models: () => true,
    related: [
      { href: "/which-mini-pc", label: "Which mini PC is right for me? (quiz)" },
      { href: "/guides/intel-t-vs-non-t-mini-pc", label: "What Intel T-series CPUs mean for a used mini PC" },
    ],
    body: () => (
      <>
        <p>Refurbished office mini PCs are cheap because they come by the pallet. Listings are often vague, so the same model can be a bargain or a dud depending on what is actually in the box. Check these before you pay.</p>
        <h2>1. The exact CPU, not &quot;Core i5&quot;</h2>
        <p>An &quot;EliteDesk 800 G3 Mini i5&quot; can be a 6th-gen i5-6500T or a 7th-gen i5-7500T, and only the second hardware-decodes 4K HEVC. Look for the full model number in the title, a photo of the BIOS or System Information screen, or ask the seller.</p>
        <h2>2. RAM: how much, and in how many sticks</h2>
        <p>These machines have two SO-DIMM slots. 16 GB as 2×8 GB leaves no free slot, so upgrading to 32 GB means replacing both sticks. With memory prices high in 2026, a unit that already has 16–32 GB can be worth more than the price difference suggests.</p>
        <h2>3. Is a power adapter included?</h2>
        <p>Many ex-office lots ship without the power brick. Lenovo and HP use proprietary barrel or rectangular connectors, so budget for the correct-wattage adapter if it is missing.</p>
        <h2>4. Storage: what is included, and what is missing</h2>
        <ul>
          <li>&quot;No SSD&quot; or &quot;no OS&quot; listings are common and fine if priced accordingly.</li>
          <li>A 2.5&quot; drive needs the caddy and SATA cable. Units that shipped with only an M.2 SSD often lack both.</li>
          <li>Check how many M.2 NVMe slots the model has. The <Link href="/compare/m920q-vs-m920x">M920q vs M920x</Link> mix-up is the classic mistake.</li>
        </ul>
        <h2>5. BIOS and management locks</h2>
        <p>Ex-corporate machines sometimes keep a BIOS administrator password or remote-management settings. Ask the seller to confirm the BIOS is unlocked, and avoid listings that mention a locked BIOS unless you know how to deal with it.</p>
        <h2>6. Expansion parts are sold separately</h2>
        <p>PCIe risers for Lenovo Tiny models and HP Flex IO network modules are almost never included. If you need a second NIC, price the part before choosing the model.</p>
        <h2>7. Judge the price by configuration</h2>
        <p>Compare listings with the same CPU, RAM and storage, and include shipping. Asking prices vary a lot between countries. A <Link href="/alerts">price alert</Link> for your target price saves checking every day.</p>
      </>
    ),
  },
  ...HOME_SERVER_GUIDES,
  ...NEW_GUIDES,
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
