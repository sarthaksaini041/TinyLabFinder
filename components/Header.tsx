import Link from "next/link";
import { SITE } from "../lib/site";
import { NavMenu } from "./NavMenu";

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand" aria-label={`${SITE.name} home`}>
          <img src="/icon.png" width={32} height={32} alt="" className="brand__mark" />
          {SITE.name}
        </Link>
        <NavMenu />
      </div>
    </header>
  );
}
