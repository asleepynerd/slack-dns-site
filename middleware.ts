import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get hostname (e.g. vercel.com, test.vercel.app, etc.)
  const hostname = request.headers.get("host");
  const path = request.nextUrl.pathname;

  // Handle short links on both domains
  if (/^\/[a-zA-Z0-9]{6}$/.test(path)) {
    // Rewrite to the API route regardless of domain
    return NextResponse.rewrite(new URL(`/api/l${path}`, request.url));
  }

  // Only allow /links management page on hackclubber.dev
  if (hostname !== "hackclubber.dev" && path.startsWith("/links")) {
    return NextResponse.redirect("https://hackclubber.dev/links");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except api routes, static files, etc.
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
