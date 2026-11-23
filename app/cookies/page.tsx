import type { Metadata } from "next";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import Link from "next/link";
import { adsEnabled } from "../../components/ads/AdConfig";
import { CookieSettingsButton } from "../../components/consent/CookieConsent";
import { SITE } from "../../lib/site";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: `Every cookie and browser storage item ${SITE.name} uses, and why.`,
  alternates: { canonical: "/cookies" },
};

export default function Cookies() {
  const adsOn = adsEnabled();
  return (
    <div className="prose">
      <Breadcrumbs items={[{ name: "Cookies", href: "/cookies" }]} />
      <h1>Cookie policy</h1>
      <p className="muted small">Last updated {SITE.dataUpdated}</p>
      <p>
        We set a login cookie when you sign in. Model browsing, filters and comparisons do not require it. See the
        advertising section for cookies Google may use on guides.
      </p>

      <h2>What we use</h2>
      <div className="table-scroll">
        <table className="grid-table grid-table--stack">
          <thead>
            <tr><th>Name</th><th>Type</th><th>Purpose</th><th>Kept for</th></tr>
          </thead>
          <tbody>
            <tr>
              <td data-label="Name"><code>tlf_session</code></td>
              <td data-label="Type">Cookie, first-party. Strictly necessary.</td>
              <td data-label="Purpose">Keeps you signed in so you can manage price alerts. Set only when you log in. It holds a random token; we store only its hash. HttpOnly, Secure and SameSite=Lax, so scripts and other sites cannot read it.</td>
              <td data-label="Kept for">30 days, or until you log out</td>
            </tr>
            <tr>
              <td data-label="Name"><code>tlf-compare</code></td>
              <td data-label="Type">localStorage, first-party. Functional.</td>
              <td data-label="Purpose">Remembers the models you added to compare. It never leaves your browser.</td>
              <td data-label="Kept for">Until you clear it or your browser data</td>
            </tr>
            <tr>
              <td data-label="Name"><code>tlf-consent</code></td>
              <td data-label="Type">localStorage, first-party. Strictly necessary.</td>
              <td data-label="Purpose">Remembers your cookie settings so we don&apos;t ask again.</td>
              <td data-label="Kept for">Until you clear it or your browser data</td>
            </tr>
            <tr>
              <td data-label="Name">Vercel Web Analytics</td>
              <td data-label="Type">No cookies, no storage</td>
              <td data-label="Purpose">Counts page views, referrers, country and device type. Visitors are not tracked across days or sites. We strip email addresses, codes and tokens from page addresses before anything is sent.</td>
              <td data-label="Kept for">Nothing stored on your device</td>
            </tr>
            <tr>
              <td data-label="Name">Vercel Speed Insights</td>
              <td data-label="Type">No cookies, no storage</td>
              <td data-label="Purpose">Measures real page load speed (Core Web Vitals) so we can keep the site fast. Same address scrubbing as above.</td>
              <td data-label="Kept for">Nothing stored on your device</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Your choice</h2>
      <p>
        On your first visit we show a short notice. Strictly necessary storage is always on. Analytics is on unless you
        choose &quot;Necessary only&quot;; it sets no cookies either way. You can change your choice any time:
      </p>
      <p><CookieSettingsButton /></p>
      <h2>Advertising</h2>
      {adsOn ? (
        <p>
          Guides may show one display ad served by Google AdSense after the article. Google and its partners may set cookies to serve and measure ads.
          Visitors in the EEA, UK and Switzerland are asked for consent through Google&apos;s certified consent message
          before any personalised ads or ad cookies are used. You can change your choice at any time from the
          &quot;Privacy and cookie settings&quot; link that message adds to the page.
        </p>
      ) : (
        <p>
          Ads are not switched on yet. If we add Google AdSense, Google and its partners may set advertising cookies. Before
          that happens this page will list them, and visitors in the EEA, UK and Switzerland will be asked for consent
          through Google&apos;s certified consent message first.
        </p>
      )}
      <p>
        You can opt out of personalised Google ads at{" "}
        <a href="https://adssettings.google.com" rel="noopener" target="_blank">Google Ads Settings</a>.
      </p>

      <h2>Marketplace links</h2>
      <p>When you click through to a marketplace such as eBay, that site sets its own cookies under its own policy.</p>

      <h2>Controlling cookies</h2>
      <p>
        You can block or delete cookies in your browser settings. Blocking <code>tlf_session</code> means you cannot sign
        in; everything else on the site works without it.
      </p>
      <p>
        Questions: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. See also our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>
    </div>
  );
}
