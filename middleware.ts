import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get hostname (e.g. vercel.com, test.vercel.app, etc.)
  const hostname = request.headers.get("host");
  const path = request.nextUrl.pathname;

  // Only allow /links management page on hackclubber.dev
  if (hostname !== "hackclubber.dev" && path.startsWith("/links")) {
    return NextResponse.redirect("https://hackclubber.dev/links");
  }

  // Handle short links on both domains
  // Includes basic alphanumeric, emoji (Unicode range), and Japanese characters (Hiragana, Katakana, Kanji)
  if (
    /^\/(?:[a-zA-Z0-9\u{1F300}-\u{1F9FF}\u{3000}-\u{30FF}\u{3040}-\u{309F}\u{4E00}-\u{9FAF}]){6}$/u.test(
      path
    )
  ) {
    // Rewrite to the API route regardless of domain
    return NextResponse.rewrite(new URL(`/api/l${path}`, request.url));
  }

  // Redirect root path of hackclubber.dev to domains.sleepy.engineer
  if (hostname === "hackclubber.dev" && path === "/") {
    return NextResponse.redirect("https://domains.sleepy.engineer");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except api routes, static files, etc.
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
