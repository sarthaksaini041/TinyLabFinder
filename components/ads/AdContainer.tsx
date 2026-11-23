import type { ReactNode } from "react";

export function AdContainer({ children }: { children: ReactNode }) {
  return (
    <aside className="ad" aria-label="Advertisement">
      <span className="ad__label" aria-hidden="true">Advertisement</span>
      <div className="ad__body">{children}</div>
    </aside>
  );
}
