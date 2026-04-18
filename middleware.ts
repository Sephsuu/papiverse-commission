import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  console.log("MIDDLEWARE HIT:", host, pathname);

  if (
    (host === "authenticity.krispypapi.com" ||
      host.startsWith("authenticity.krispypapi.com:")) &&
    pathname === "/"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/kp-product";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};