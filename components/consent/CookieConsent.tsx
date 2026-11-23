"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { OPEN_SETTINGS_EVENT, readConsent, saveConsent } from "../../lib/consent";

/**
 * First-visit notice plus a settings dialog. Only strictly necessary storage is always
 * on; analytics (cookieless Vercel Web Analytics + Speed Insights) can be switched off.
 */
export function CookieConsent() {
  const [banner, setBanner] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const c = readConsent();
    if (c) setAnalytics(c.analytics);
    else setBanner(true);
    const open = () => {
      setAnalytics(readConsent()?.analytics ?? true);
      dialog.current?.showModal();
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  const choose = (value: boolean) => {
    saveConsent(value);
    setAnalytics(value);
    setBanner(false);
    dialog.current?.close();
  };

  return (
    <>
      {banner && (
        <section className="consent" role="region" aria-label="Cookie notice">
          <p>
            We use a login cookie if you sign in. You can turn off cookieless analytics here. Advertising on guides has
            separate privacy controls where applicable. <Link href="/cookies">Cookie policy</Link>
          </p>
          <div className="consent__actions">
            <button type="button" className="btn" onClick={() => dialog.current?.showModal()}>Settings</button>
            <button type="button" className="btn" onClick={() => choose(false)}>Necessary only</button>
            <button type="button" className="btn btn--primary" onClick={() => choose(true)}>Allow analytics</button>
          </div>
        </section>
      )}
      <dialog ref={dialog} className="consent-dialog" aria-labelledby="consent-title" onClick={(e) => e.target === dialog.current && dialog.current?.close()}>
        <form method="dialog" onSubmit={(e) => { e.preventDefault(); choose(analytics); }}>
          <h2 id="consent-title">Cookie settings</h2>
          <div className="consent-opt">
            <div>
              <strong>Strictly necessary</strong>
              <p className="small muted">Keeps you signed in (<code>tlf_session</code>), remembers your compare list and this choice. Always on.</p>
            </div>
            <input type="checkbox" checked disabled aria-label="Strictly necessary, always on" />
          </div>
          <div className="consent-opt">
            <div>
              <label htmlFor="consent-analytics" style={{ margin: 0 }}>Analytics &amp; performance</label>
              <p className="small muted">Vercel Web Analytics and Speed Insights: page views and load speed. No cookies, nothing stored on your device, emails and codes stripped from addresses.</p>
            </div>
            <input id="consent-analytics" type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
          </div>
          <div className="consent__actions">
            <button type="button" className="btn" onClick={() => choose(false)}>Necessary only</button>
            <button type="submit" className="btn btn--primary">Save choice</button>
          </div>
        </form>
      </dialog>
    </>
  );
}

export function CookieSettingsButton() {
  return (
    <button type="button" className="linklike" onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}>
      Cookie settings
    </button>
  );
}
