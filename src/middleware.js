import { NextResponse } from "next/server";

const locales = ["en", "en-US", "es", "fr", "nl-NL"];
const protectedRoutes = ["/user", "/order", "/checkout"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip internal and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  const pathnameParts = pathname.split("/");

  // Build path without locale
  const pathAfterLocale = locales.includes(pathnameParts[1])
    ? `/${pathnameParts.slice(2).join("/")}`
    : pathname;

  const isProtected = protectedRoutes.some((route) =>
    pathAfterLocale.startsWith(route)
  );

  // Skip auth check for login/register routes
  if (isProtected && !pathAfterLocale.startsWith("/auth")) {
    // Simple cookie-based auth check - userInfo cookie set by OTP login
    const userInfoCookie = request.cookies.get("userInfo");
    
    // Parse and validate the cookie
    let isAuthenticated = false;
    if (userInfoCookie?.value) {
      try {
        const userInfo = JSON.parse(userInfoCookie.value);
        // Check if userInfo has required fields (token and id/phone)
        isAuthenticated = !!(userInfo?.token && (userInfo?.id || userInfo?._id || userInfo?.phone));
      } catch {
        // Invalid JSON cookie
        isAuthenticated = false;
      }
    }
    
    if (!isAuthenticated) {
      // Redirect to OTP login
      const loginUrl = new URL(`/auth/otp-login`, request.url);
      loginUrl.searchParams.set("redirectUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on protected paths to reduce edge crashes/timeouts
  matcher: ["/user/:path*", "/order/:path*", "/checkout/:path*"],
};
