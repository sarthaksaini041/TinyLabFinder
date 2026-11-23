# TinyLab Finder

A finder and comparison site for **used business mini PCs**: Lenovo ThinkCentre Tiny, Dell OptiPlex Micro and HP EliteDesk/ProDesk Mini. It's built for people setting up home servers (Proxmox, Plex, Jellyfin, Home Assistant), with **price alerts** for eBay listings.

Why this idea, with sources: [docs/RESEARCH.md](docs/RESEARCH.md).

## What it does
- **Finder** (`/`): filter by brand, 2+ NVMe slots, PCIe expansion, second-NIC option, 64 GB RAM, 4K HEVC / AV1 decode, and CPU vendor. Sort by age, threads or drive bays. Filters live in the URL, so results are shareable.
- **Model pages** (`/models/[slug]`): spec sheet, owner notes, a transcoding table per CPU option, a buying checklist, eBay search links (US/UK/DE), similar models, and a confidence badge.
- **Compare** (`/compare?m=a,b,c`): up to 3 models, with differing rows highlighted. Six curated head-to-heads at `/compare/[pair]` cover pairs people actually ask about on Reddit.
- **Brand catalogs** (`/brands/[brand]`): manufacturer-specific specs, upgrade trade-offs and buying checks.
- **Guides** (`/guides`): used hardware buying, home server workloads and upgrades.
- **Accounts** (`/signup`, `/verify`, `/login`, `/forgot`, `/account`): name + email + password, confirmed with a 6-digit emailed code. Only price alerts need an account; everything else is open.
- **Price alerts** (`/alerts`): logged-in users get an email when a fixed-price eBay listing is at or under their price; manage alerts on `/account`; one-click unsubscribe in every email.

## Data policy (read before editing `data/models.ts`)
- `confidence: "high"` requires an official source in `sources` (Lenovo PSREF/manual, Dell spec guide, HP service guide); a test enforces this. `"check"` shows a "Verify specs" badge.
- `idleW` stays `null` until someone actually measures it; a test enforces this. Never estimate it.
- Unofficial facts (for example "64 GB works") go in `notes`, never in the official fields.
- Transcoding facts live once per iGPU family in `lib/media.ts`.
- **Status:** 16 of 23 models are verified against official documents. The 7 still marked `check` are listed in docs/RESEARCH.md; verify them before launch.

## Tech stack
- **Next.js 16** (App Router) with React 19 and TypeScript.
  - Pages are statically generated.
  - API routes are only used for alerts.
- **Postgres** stores accounts, sessions and alerts (Supabase in production). The schema lives in `lib/schema.ts` and is applied automatically (idempotent) on first use.
- **Auth** is built in (`lib/auth/`), no third-party auth service:
  - Passwords: scrypt (N=2^14, r=8, p=1) with per-user salt.
  - Email codes: 6 digits, stored as HMAC-SHA256 keyed by `AUTH_SECRET`, 10-minute expiry, locked after 5 wrong tries, 60 s resend cooldown.
  - Sessions: 256-bit random token in an HttpOnly, SameSite=Lax, Secure cookie; only its SHA-256 is stored; 30-day expiry; password reset signs out every device.
  - Abuse limits (Postgres-backed, so they hold across serverless instances): per-IP limits on signup/login/verify/reset, per-account lock after 8 failed logins in 15 minutes, per-email code limits.
  - CSRF: every state-changing API call requires a same-site `Origin` and a JSON body.
  - No account discovery through "forgot password" or code resends.
- **eBay Browse API** supplies active listings.
- **Resend** sends email (plain HTTP, no SDK).
- **Scheduled price check:** a Vercel Cron job (or any external scheduler) calls `/api/cron/check-prices`.
- **Hosting:** fits Vercel's free or low tiers. It's also a standard `next start` app, so any Node host works.

```
app/                 routes (pages, API, sitemap.ts, robots.ts, ads.txt, OG image)
components/          UI; ads/ (AdConfig, AdSlot, AdContainer, ResponsiveAd, AdScript); analytics/
data/                models.ts, cpus.ts, comparisons.ts, guides.tsx (the product's content)
lib/                 catalog (derived fields), media, listings (eBay links), store, ebay, email, validate, site
tests/               unit tests (data integrity, known facts, validation)
docs/RESEARCH.md     research report
```

## Local development
```bash
npm install
cp .env.example .env.local        # every variable is optional locally
npm run dev                       # http://localhost:3000
npm test                          # unit tests
npm run lint                      # TypeScript type-check
npm run build && npm start        # production build
```
To see ad placements while designing, set `NEXT_PUBLIC_ADS_PROVIDER=placeholder`.

## Environment variables
See `.env.example`.
- **`NEXT_PUBLIC_*`** values are public and baked in at build time, so **rebuild after changing them**.
- **Server-only secrets:** `DATABASE_URL`, `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`.

## Production deployment (Vercel)
1. Import the repository into Vercel.
2. Set `NEXT_PUBLIC_SITE_URL` to your domain and `NEXT_PUBLIC_CONTACT_EMAIL` to your address.
3. **Database (Supabase project `tinylab-finder`, us-east-1, already created, with the `alerts` table and row-level security set up):**
   - In Supabase, open **Connect → Transaction pooler** and copy the URI (port 6543). Put your database password into it and set it as `DATABASE_URL`.
   - Go to **Settings → Database → SSL Configuration → Download certificate** and paste the PEM into `DATABASE_CA_CERT`, so the connection is encrypted and verified.
   - The table has RLS on with no policies, so Supabase's public REST API can't read it. Only the server, using the database password, can.
4. **eBay:** create a production keyset at developer.ebay.com, then set `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET`.
5. **Email:** verify your domain in Resend, then set `RESEND_API_KEY` and `EMAIL_FROM`.
6. **Cron:** set `CRON_SECRET` to a long random string. `vercel.json` runs the check once a day at 06:17 UTC (the most often Vercel's free Hobby plan allows; on Pro you can shorten it to every 6 hours), and Vercel sends the secret as a Bearer token.
7. **Domain:** in Vercel's Domains settings, add the domain and create the DNS records it shows you.
8. **Search Console:** verify the domain property with a DNS record, or add `GOOGLE_SITE_VERIFICATION` in Vercel using the `content` value of the verification tag for the `https://tinylabfinder.online/` URL-prefix property and redeploy. Submit `https://tinylabfinder.online/sitemap.xml` in Sitemaps. Use URL Inspection to check the selected canonical and request a crawl of individual new pages.

On any other host, run `npm run build && npm start` and call `/api/cron/check-prices` with the header `Authorization: Bearer $CRON_SECRET` on a schedule.

## Analytics
Analytics are cookieless (no consent banner needed for them).
- **Plausible:** set `NEXT_PUBLIC_ANALYTICS=plausible` and `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.
- **Umami:** set `NEXT_PUBLIC_ANALYTICS=umami`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID` and `NEXT_PUBLIC_UMAMI_SRC`.

Tracked events (no personal data):
- `filter_change`
- `compare_add`
- `compare_view`
- `listing_click`
- `alert_created`

Traffic sources, top pages, returning visitors and search traffic come from the provider dashboard. Connect Search Console for search queries.

## AdSense setup (after approval; approval is not guaranteed)
1. Publish the Google consent message in **Privacy & messaging** for the EEA, UK and Switzerland.
2. Keep **Auto ads** and **Auto optimize** disabled for the site in AdSense.
3. Set `NEXT_PUBLIC_ADSENSE_CLIENT` to the publisher's `ca-pub-…` value in production. The site uses it for `/ads.txt` even when display ads are off.
4. Create one responsive Display ads unit, set `NEXT_PUBLIC_AD_SLOT_FOOTER` to its ID, and set `NEXT_PUBLIC_ADS_PROVIDER=adsense`. Rebuild and deploy.

The site renders one labelled slot after a full guide and its related links. Finder, model, comparison, account and quiz pages have no ad placements. Vercel previews omit live ads. Google serves ads after the site is approved and eligible inventory is available.

## Other monetization already wired up
- **eBay Partner Network:** set `NEXT_PUBLIC_EPN_CAMPAIGN_ID`. Links then become `rel="sponsored"` and show a disclosure.
- **Possible paid tier for alerts:** more alerts per email (the limit is 5 today), more marketplaces, sold-price history. Sold-price history needs eBay Marketplace Insights API approval.

## Testing done
- Unit tests: 14 passing (includes password hashing, code binding, session tokens, redirect safety).
- Auth end-to-end (Playwright + real Postgres): signup → wrong/right code → alert → account → delete → logout → login → forgot/reset (other devices signed out), plus CSRF, brute-force lock, login lockout, no account discovery.
- Browser tests (Playwright, 390px mobile and 1366px desktop): 66/66 checks passing. They covered:
  - Filtering, URL state and the empty state.
  - Compare flow and the alert form, including client validation, the success path and a simulated API failure.
  - Ad slots: labelled, space reserved, sidebar desktop-only.
  - No horizontal scrolling and no console errors.
  - SEO: title, description, canonical, og:image, exactly one h1 and JSON-LD on each page type.
  - A crawl of 39 internal pages found no broken links.
- API behaviour checked: 400, 422, 201, 429, confirm redirect, unsubscribe (including a repeat), and cron returning 401 without the secret and 503 without eBay keys.
