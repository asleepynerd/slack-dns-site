import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_PATHS = [
  "/_next",
  "/api",
  "/favicon.ico",
  "/deprecation",
  "/assets",
  "/images",
];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host");
  const path = request.nextUrl.pathname;

  if (ALLOWED_PATHS.some((allowedPath) => path.startsWith(allowedPath))) {
    return NextResponse.next();
  }

  if (
    /^\/(?:[a-zA-Z0-9\u{1F300}-\u{1F9FF}\u{3000}-\u{30FF}\u{3040}-\u{309F}\u{4E00}-\u{9FAF}]){6}$/u.test(
      path
    )
  ) {
    return NextResponse.rewrite(new URL(`/api/l${path}`, request.url));
  }

  if (
    hostname === "hackclubber.dev" &&
    path === "/" &&
    !request.url.includes("domains.sleepy.engineer")
  ) {
    return NextResponse.redirect("https://domains.sleepy.engineer");
  }

  const originalUrl = new URL(request.url);
  const deprecationUrl = new URL("/deprecation", request.url);
  deprecationUrl.searchParams.set("from", originalUrl.pathname);

  return NextResponse.redirect(deprecationUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
