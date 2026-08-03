import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionJwtEdge, AUTH_COOKIE_NAME } from "@/lib/auth";

// Routes that unauthenticated users can access
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Skip middleware for API routes, static files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySessionJwtEdge(token) : null;
  const isAuthenticated = !!session;

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isPublicPath) {
    const redirectParam = searchParams.get("redirect");
    const targetUrl = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/dashboard";
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && !isPublicPath && pathname !== "/") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
