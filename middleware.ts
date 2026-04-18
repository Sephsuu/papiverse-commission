import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  const isAuthHost =
    host.includes("authenticity.krispypapi.com")

  if (isAuthHost && pathname === "/") {
    return NextResponse.redirect(new URL("/auth/kp-product", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};