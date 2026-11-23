import { NextResponse, type NextRequest } from "next/server";
import { isMalformedPath } from "./lib/paths";

export function proxy(req: NextRequest) {
  if (isMalformedPath(req.nextUrl.pathname)) {
    return new NextResponse("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
  }
  return NextResponse.next();
}

export const config = {
  // Skip build assets and metadata files; everything else is checked (it is a cheap string test).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|ads.txt).*)"],
};
