"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

/** A single responsive AdSense unit. Pushes once per mount. */
export function ResponsiveAd({ client, slot }: { client: string; slot: string }) {
  const pushed = useRef(false);
  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or a missing script must never break the page.
    }
  }, []);
  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "100%" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="horizontal"
      data-full-width-responsive="true"
    />
  );
}
