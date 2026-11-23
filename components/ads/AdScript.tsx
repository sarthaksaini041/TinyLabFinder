import Script from "next/script";
import { ADSENSE_CLIENT } from "./AdConfig";

/** Next.js deduplicates the script across guide navigations. */
export function AdScript() {
  return (
    <Script
      id="adsense"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
