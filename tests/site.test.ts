import assert from "node:assert/strict";
import { test } from "node:test";
import { COMPARISONS } from "../data/comparisons";
import { GUIDES } from "../data/guides";
import { MODELS } from "../data/models";
import { MIN_MATCHES, PUBLISHED_USE_CASES, USE_CASES, matches } from "../data/usecases";
import sitemap from "../app/sitemap";
import { amazonSearchUrl, amazonTag } from "../lib/affiliate/amazon";
import { buildList } from "../lib/build";
import { CATALOG, getView, hasLan } from "../lib/catalog";
import { modelFaqs } from "../lib/faq";
import { memLimited } from "../lib/memlimit";
import { isMalformedPath } from "../lib/paths";
import { priceMarkets, priceStatus } from "../lib/prices/config";
import { median, withoutOutliers } from "../lib/prices/stats";
import { latestFor, historyFor } from "../lib/prices/store";
import { syncPrices } from "../lib/prices/sync";
import type { PriceProvider } from "../lib/prices/types";
import { DEFAULT_ANSWERS, recommend } from "../lib/quiz";

const withEnv = async (env: Record<string, string | undefined>, fn: () => unknown | Promise<unknown>) => {
  const saved: Record<string, string | undefined> = {};
  for (const k of Object.keys(env)) { saved[k] = process.env[k]; if (env[k] === undefined) delete process.env[k]; else process.env[k] = env[k]; }
  try { await fn(); } finally { for (const k of Object.keys(saved)) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } }
};

test("use-case pages: unique, enough matches, references resolve", () => {
  assert.equal(new Set(USE_CASES.map((u) => u.slug)).size, USE_CASES.length);
  assert.ok(PUBLISHED_USE_CASES.length >= 8, "expected most use cases to be published");
  const guideSlugs = new Set(GUIDES.map((g) => g.slug));
  for (const u of PUBLISHED_USE_CASES) {
    assert.ok(matches(u).length >= MIN_MATCHES, u.slug);
    for (const g of u.guides) assert.ok(guideSlugs.has(g), `${u.slug} -> guide ${g}`);
    for (const r of u.related) assert.ok(USE_CASES.some((x) => x.slug === r), `${u.slug} -> ${r}`);
    for (const m of matches(u)) assert.ok(u.why(m).length > 0, `${u.slug} empty reason for ${m.slug}`);
  }
  // A thin page is never published.
  for (const u of USE_CASES.filter((x) => matches(x).length < MIN_MATCHES)) assert.ok(!PUBLISHED_USE_CASES.includes(u));
});

test("comparisons are meaningful, unique and reference real models", () => {
  const slugs = COMPARISONS.map((c) => c.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(COMPARISONS.length >= 30 && COMPARISONS.length <= 70, `count ${COMPARISONS.length}`);
  for (const c of COMPARISONS) {
    const a = getView(c.a), b = getView(c.b);
    assert.ok(a && b && c.a !== c.b, c.slug);
    assert.match(c.slug, /^[a-z0-9-]+-vs-[a-z0-9-]+$/);
    // Generated pairs never mix CPU vendors or jump more than one generation.
    if (c.kind !== "curated") {
      assert.equal(a!.vendor, b!.vendor, c.slug);
      assert.ok(Math.abs(a!.maxGen - b!.maxGen) <= 3, c.slug);
    }
  }
  // Existing URLs keep working.
  for (const legacy of ["m720q-vs-m920q", "m920q-vs-m920x", "m920q-vs-elitedesk-800-g4-mini"]) assert.ok(slugs.includes(legacy), legacy);
});

test("guides: unique slugs, internal links resolve", () => {
  assert.equal(new Set(GUIDES.map((g) => g.slug)).size, GUIDES.length);
  assert.ok(GUIDES.length >= 12);
  // Unpublished /best targets are allowed in data (the page filters them out), but must be real use cases.
  const best = new Set(USE_CASES.map((u) => `/best/${u.slug}`));
  const guides = new Set(GUIDES.map((g) => `/guides/${g.slug}`));
  for (const g of GUIDES) {
    assert.ok(g.description.length >= 80 && g.description.length <= 260, `${g.slug} description length`);
    for (const r of g.related ?? []) assert.ok(best.has(r.href) || guides.has(r.href) || ["/", "/which-mini-pc"].includes(r.href) || r.href.startsWith("/?"), `${g.slug} -> ${r.href}`);
  }
});

test("sitemap lists every public page once", async () => {
  const urls = (await sitemap()).map((e) => e.url);
  assert.equal(new Set(urls).size, urls.length, "duplicate sitemap entries");
  for (const u of PUBLISHED_USE_CASES) assert.ok(urls.some((x) => x.endsWith(`/best/${u.slug}`)), u.slug);
  for (const c of COMPARISONS) assert.ok(urls.some((x) => x.endsWith(`/compare/${c.slug}`)), c.slug);
  for (const m of MODELS) assert.ok(urls.some((x) => x.endsWith(`/models/${m.slug}`)), m.slug);
  assert.ok(!urls.some((x) => /\/(account|login|signup|verify|api)\b/.test(x)), "private pages must not be in the sitemap");
});

test("quiz: transparent rules, no arbitrary scoring", () => {
  const all = recommend(DEFAULT_ANSWERS);
  assert.equal(all.rules.length, 0);
  assert.equal(all.matches.length, CATALOG.length);
  const ten = recommend({ ...DEFAULT_ANSWERS, network: "10g" });
  assert.ok(ten.matches.length > 0);
  for (const r of ten.matches) assert.ok(hasLan(r.model, "10GbE"));
  const av1 = recommend({ ...DEFAULT_ANSWERS, media: "av1", ram: 64 });
  for (const r of av1.matches) assert.ok(r.model.av1 && r.model.ram.maxOfficialGB >= 64);
  const impossible = recommend({ ...DEFAULT_ANSWERS, network: "10g", media: "av1" });
  for (const r of impossible.nearMisses) assert.equal(r.missed.length, 1);
});

test("malformed paths are rejected, normal ones are not", () => {
  for (const bad of ["/alerts%5C", "/alerts%5c%5c", "/a\\b", "/x%00", "/%E0%A4%A"]) assert.ok(isMalformedPath(bad), bad);
  for (const ok of ["/", "/models/lenovo-thinkcentre-m920q", "/compare/m720q-vs-m920q", "/best/mini-pcs-with-pcie-slot", "/guides/a%20b"]) assert.ok(!isMalformedPath(ok), ok);
});

test("price integration is PENDING_CREDENTIALS without eBay keys and never fabricates data", async () => {
  await withEnv({ EBAY_CLIENT_ID: undefined, EBAY_CLIENT_SECRET: undefined, PRICE_SYNC_ENABLED: undefined, DATABASE_URL: undefined }, async () => {
    assert.equal(priceStatus(), "PENDING_CREDENTIALS");
    let called = false;
    const provider: PriceProvider = { id: "ebay-browse", configured: () => true, snapshot: async () => { called = true; return null; } };
    const r = await syncPrices(provider);
    assert.deepEqual(r, { status: "PENDING_CREDENTIALS", saved: 0, empty: 0, failed: 0 });
    assert.equal(called, false, "provider must not be called without credentials");
    assert.deepEqual(await latestFor("lenovo-thinkcentre-m920q"), []);
    assert.deepEqual(await historyFor("lenovo-thinkcentre-m920q", "EBAY_US"), []);
  });
  await withEnv({ EBAY_CLIENT_ID: "x", EBAY_CLIENT_SECRET: "y", PRICE_SYNC_ENABLED: "false" }, () => assert.equal(priceStatus(), "DISABLED"));
  await withEnv({ EBAY_CLIENT_ID: "x", EBAY_CLIENT_SECRET: "y", PRICE_SYNC_ENABLED: undefined }, () => assert.equal(priceStatus(), "ACTIVE"));
  await withEnv({ PRICE_MARKETS: "EBAY_GB, NOPE" }, () => assert.deepEqual(priceMarkets(), ["EBAY_GB"]));
});

test("price stats", () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.deepEqual(withoutOutliers([10, 100, 110, 120, 130]), [100, 110, 120, 130]);
});

test("Amazon stays disabled without a valid Associates tag", async () => {
  await withEnv({ NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG: undefined }, () => { assert.equal(amazonTag(), null); assert.equal(amazonSearchUrl("ram"), null); });
  await withEnv({ NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG: "not a tag" }, () => assert.equal(amazonSearchUrl("ram"), null));
  await withEnv({ NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG: "mytag-20", NEXT_PUBLIC_AMAZON_HOST: undefined }, () => {
    const u = amazonSearchUrl("32GB DDR4 SODIMM")!;
    assert.match(u, /^https:\/\/www\.amazon\.com\/s\?/);
    assert.equal(new URL(u).searchParams.get("tag"), "mytag-20");
  });
});

test("build list follows the spec data", () => {
  const g9 = MODELS.find((m) => m.slug === "hp-elite-mini-800-g9")!;
  assert.match(buildList(g9).find((i) => i.id === "ram")!.spec, /DDR5/);
  const m920q = MODELS.find((m) => m.slug === "lenovo-thinkcentre-m920q")!;
  assert.match(buildList(m920q).find((i) => i.id === "nic")!.label, /10GbE/);
  for (const m of MODELS) for (const i of buildList(m)) assert.ok(!/\$|€|£|\d+\.\d\d/.test(i.spec + i.compatibility), `${m.slug} ${i.id} contains a price`);
});

test("model FAQs are complete and grounded", () => {
  for (const m of CATALOG) {
    const f = modelFaqs(m);
    assert.equal(f.length, 6);
    for (const x of f) assert.ok(!/undefined|null|NaN/.test(x.q + x.a), `${m.slug}: ${x.q}`);
  }
});

test("power and networking data carry provenance", () => {
  for (const m of MODELS) {
    for (const p of m.power ?? []) {
      assert.match(p.source.url, /^https:\/\//, m.slug);
      assert.match(p.measuredOn, /^\d{4}(-\d{2}-\d{2})?$/, m.slug);
      if (p.idleMaxW) assert.ok(p.idleMaxW >= p.idleW, m.slug);
      assert.ok(p.idleW > 0 && p.idleW < 100 && p.method.length > 5 && p.config.length > 5, m.slug);
    }
    for (const u of m.lanUpgrades ?? []) assert.ok(u.via.length > 5, m.slug);
    // 10GbE claims need a physical PCIe path.
    if (hasLan(getView(m.slug)!, "10GbE")) assert.notEqual(m.pcieSlot, "none", m.slug);
  }
});

test("power dataset keys are real models", async () => {
  const { POWER } = await import("../data/power");
  for (const k of Object.keys(POWER)) assert.ok(MODELS.some((m) => m.slug === k), k);
  assert.ok(MODELS.filter((m) => (m.power ?? []).length).length >= 10);
});

test("in-memory limiter", () => {
  const t = 1_000;
  for (let i = 0; i < 3; i++) assert.equal(memLimited("k", 3, 1000, t), false);
  assert.equal(memLimited("k", 3, 1000, t), true);
  assert.equal(memLimited("k", 3, 1000, t + 1001), false);
});

test("eBay photo URLs: only eBay CDN, resized to 500px", async () => {
  const { isEbayImage, sizedEbayImage } = await import("../lib/prices/ebay");
  assert.ok(isEbayImage("https://i.ebayimg.com/images/g/abc/s-l225.jpg"));
  assert.ok(!isEbayImage("http://i.ebayimg.com/x.jpg"));
  assert.ok(!isEbayImage("https://evil.example/i.ebayimg.com/x.jpg"));
  assert.equal(sizedEbayImage("https://i.ebayimg.com/images/g/abc/s-l225.jpg"), "https://i.ebayimg.com/images/g/abc/s-l500.jpg");
});
