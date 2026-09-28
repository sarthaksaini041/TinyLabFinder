"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Save/unsave a model to the signed-in user's watchlist. */
export function SaveButton({ slug }: { slug: string }) {
  const [state, setState] = useState<"loading" | "anon" | "saved" | "unsaved" | "error">("loading");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch("/api/saved").then((r) => r.json()).then((j: { signedIn: boolean; saved: string[] }) => {
      setState(!j.signedIn ? "anon" : j.saved.includes(slug) ? "saved" : "unsaved");
    }).catch(() => setState("error"));
  }, [slug]);

  if (state === "error") return null;
  if (state === "loading") return <span className="btn" aria-hidden="true" style={{ visibility: "hidden" }}>☆ Save model</span>;
  if (state === "anon") return <Link className="btn" href={`/login?next=/models/${slug}`}>☆ Log in to save</Link>;
  const saved = state === "saved";
  return (
    <button
      type="button" className="btn" aria-pressed={saved} disabled={busy}
      onClick={async () => {
        setBusy(true);
        const r = await fetch("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, saved: !saved }) }).catch(() => null);
        if (r?.ok) setState(saved ? "unsaved" : "saved");
        setBusy(false);
      }}
    >
      {saved ? "★ Saved" : "☆ Save model"}
    </button>
  );
}
