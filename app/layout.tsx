import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { ADSENSE_CLIENT } from "../components/ads/AdConfig";
import { Analytics } from "../components/analytics/Analytics";
import { VercelInsights } from "../components/analytics/VercelInsights";
import { CookieConsent } from "../components/consent/CookieConsent";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { SITE } from "../lib/site";
import "./globals.css";

const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-sans", display: "swap" });
const mono = IBM_Plex_Mono({ preload: false, subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: used mini PCs for home servers, compared`, template: `%s | ${SITE.name}` },
  description:
    "Compare used Lenovo ThinkCentre Tiny, Dell OptiPlex Micro and HP EliteDesk Mini PCs for Proxmox, Plex, Jellyfin and home servers: NVMe slots, PCIe, max RAM, NIC and Quick Sync support.",
  applicationName: SITE.name,
  openGraph: { type: "website", siteName: SITE.name, locale: "en_US" },
  twitter: { card: "summary_large_image" },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  other: process.env.VERCEL_ENV !== "preview" && /^ca-pub-\d{16}$/.test(ADSENSE_CLIENT)
    ? { "google-adsense-account": ADSENSE_CLIENT }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7ef" },
    { media: "(prefers-color-scheme: dark)", color: "#191e19" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Header />
        <main id="main">
          <div className="wrap">{children}</div>
        </main>
        <Footer />
        <CookieConsent />
        <Analytics />
        {/* Only on Vercel deployments: the scripts are served by Vercel itself. */}
        {process.env.NEXT_PUBLIC_VERCEL_ENV && <VercelInsights />}
      </body>
    </html>
  );
}
