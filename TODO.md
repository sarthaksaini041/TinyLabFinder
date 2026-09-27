# TinyLab Finder: what to do next

This is the short, actionable checklist. Background, research and reasons are in [`improvement.md`](improvement.md).
Tick items as you go (`- [x]`). Items are ordered by value within each section.

**Last updated:** 2026-09-27

---

## 1. Owner actions (need your accounts; nobody else can do these)

### Right now
- [ ] **Confirm the site loads over HTTPS** at https://tinylabfinder.online and https://www.tinylabfinder.online.
  - DNS was put back on 2026-09-27 to `A @ 76.76.21.21` and `CNAME www → cname.vercel-dns.com.` after the new Vercel IP caused a certificate error.
  - If the browser still warns, clear its cache or wait up to 1 hour for DNS to update, then click **Refresh** on both domains in Vercel → Domains.
  - Leave the "DNS Change Recommended" notice alone for now. The legacy records are officially supported.
- [ ] **Test signup once** on the live site. This confirms Vercel → Supabase → Resend all work.
  - If it fails, change `DATABASE_URL`'s host from `aws-0` to `aws-1`.
- [ ] **Change the Supabase database password.** It was shared in chat. After changing it, update `DATABASE_URL` in Vercel.
- [ ] **Google Search Console:** click Verify, then submit `https://tinylabfinder.online/sitemap.xml`.
- [ ] **Vercel:** enable Speed Insights (Analytics is already on).
- [ ] **GitHub:** protect `main` and require the **CI / checks** status to pass, so a broken build can't be merged.
  - The repo moved to `sarthaksaini041/TinyLabFinder`. Check that Vercel's Git connection points there.
- [ ] **GitHub:** delete the old branch `claude/youthful-rubin-kwmvqg`.

### eBay: turns on live prices, price history and alert emails
- [ ] Create a developer account at developer.ebay.com.
- [ ] Create a **Production** keyset. For "Marketplace Account Deletion", choose the exemption (we store no eBay user data).
- [ ] Add `EBAY_CLIENT_ID` (the App ID) and `EBAY_CLIENT_SECRET` (the Cert ID, marked Sensitive) in Vercel → Environment Variables.
- [ ] Optional: set `PRICE_MARKETS=EBAY_US,EBAY_GB,EBAY_DE`.
- [ ] Redeploy, then run the first sync once:
  `curl -H "Authorization: Bearer <CRON_SECRET>" https://tinylabfinder.online/api/cron/sync-prices`
  - After that it runs daily on its own. The database table already exists.
- [ ] eBay Partner Network: apply, create a campaign, then set `NEXT_PUBLIC_EPN_CAMPAIGN_ID`.

### Amazon Associates: turns on "What to buy with it" links
- [ ] Apply to Amazon Associates. You must make **3 qualifying sales within 180 days** or Amazon closes the account.
- [ ] Set `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG=<yourtag>-20` in Vercel and redeploy. The disclosure text appears automatically.

### AdSense: when there is traffic (a few weeks after indexing)
- [ ] Apply for AdSense.
- [ ] After approval:
  - Set `NEXT_PUBLIC_ADS_PROVIDER=adsense`, `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-…` and the `NEXT_PUBLIC_AD_SLOT_*` IDs.
  - Turn on Google's consent message for the EEA, UK and Switzerland.

---

## 2. Development work (no accounts needed; can start any time)

### Content and data: biggest SEO impact
- [ ] Add newer models from **official documents only** (Lenovo PSREF, Dell setup & specifications, HP QuickSpecs):
  - [ ] Lenovo ThinkCentre M70q Gen 3 / M90q Gen 3 / M80q Gen 2
  - [ ] Dell OptiPlex 7000 / 7010 Micro
  - [ ] HP ProDesk 400/600 G4–G6 Mini
  - [ ] Lenovo M900 / M910q, Dell OptiPlex 5000-series Micro
  - Adding at least one more 11th-gen-or-newer model publishes the **AV1 decode** list automatically.
- [ ] Verify the models marked `confidence: "check"` against official documents.
- [ ] Add ENERGY STAR idle-state power figures where the configuration matches (`data/power.ts`, kind `manufacturer`).
- [ ] Add more spec fields: PCIe generation per M.2 slot, dimensions, USB-C/Thunderbolt, IOMMU, ECC.
- [ ] New guides: Proxmox 3-node cluster, HP Flex IO module compatibility, reading Lenovo MTM / HP product numbers, BIOS password issues, which power brick fits which model.
- [ ] Add "[model] vs N100" pages for the most-searched models.

### Features
- [ ] Community power-reading submission form, with moderation. It must fill `PowerRecord` (config, method, date, source).
- [ ] Connect the watchlist to alerts: "tell me when a saved model drops below X".
- [ ] Saved builds (a model plus chosen parts).
- [ ] Embeddable comparison widget.

### Technical
- [ ] Content-Security-Policy. Test it in report-only mode first; see `improvement.md` §9 for the planned policy.
- [ ] Vercel Firewall: a rate-limit rule on `/api/auth/*`, plus Bot Protection.
- [ ] Error monitoring: set `ERROR_WEBHOOK_URL` (Slack/Discord), or swap in Sentry in `lib/monitoring.ts`.
- [ ] Uptime check (e.g. UptimeRobot) on `/` and `/api/prices/lenovo-thinkcentre-m920q`.
- [ ] Add Playwright end-to-end tests to CI (signup, save model, quiz, 404s).
- [ ] A retention job for `price_snapshots`, once prices are flowing.

---

## 3. Wait until eBay prices are live
- [ ] "Best used mini PC under $X" pages. These need real prices, never estimates.
- [ ] Show "Currently from $X" in finder cards and on comparison pages.
- [ ] Tune the listing filters (`NOT_A_UNIT` regex, outlier threshold) against real results.
- [ ] Apply for eBay's Marketplace Insights API to get **sold** prices, which are better than asking prices.

## 4. Wait until Amazon has 10 sales in 30 days
- [ ] Creators API: live part prices and an estimated build total in the build list.

---

## How to enable things quickly

| Feature | What turns it on | Where |
|---|---|---|
| Live eBay prices | `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET` | Vercel env vars |
| Pause price sync | `PRICE_SYNC_ENABLED=false` | Vercel env vars |
| eBay affiliate links | `NEXT_PUBLIC_EPN_CAMPAIGN_ID` | Vercel env vars |
| Amazon links | `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` | Vercel env vars |
| Ads | `NEXT_PUBLIC_ADS_PROVIDER=adsense` + client and slot IDs | Vercel env vars |
| Error alerts | `ERROR_WEBHOOK_URL` | Vercel env vars |

Every one of these is **off by default**, and the site works normally without any of them.
