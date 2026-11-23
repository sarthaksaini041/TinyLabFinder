import { ADSENSE_CLIENT } from "../../components/ads/AdConfig";

// Serves /ads.txt from NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-XXXX -> pub-XXXX).
// f08c47fec0942fa0 is Google's certification authority ID, per Google's ads.txt guide.
export const dynamic = "force-static";

export function GET() {
  const pub = ADSENSE_CLIENT.replace(/^ca-/, "");
  const body = /^pub-\d{16}$/.test(pub) ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : "# ads.txt: no ad sellers configured yet\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
