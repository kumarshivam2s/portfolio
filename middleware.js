import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Let OPTIONS through immediately (preflight requests)
  if (method === "OPTIONS") {
    return NextResponse.next();
  }

  // Always allow public GET requests to /api/posts, /api/comments and /api/settings
  if (
    (pathname.startsWith("/api/posts") && method === "GET") ||
    (pathname.startsWith("/api/comments") &&
      (method === "GET" || method === "POST")) ||
    (pathname.startsWith("/api/settings") && method === "GET")
  ) {
    return NextResponse.next();
  }

  // Allow login endpoint without token
  if (pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  // For all other /api/admin, /api/posts, /api/comments requests, require admin token
  if (
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/posts") ||
    pathname.startsWith("/api/comments")
  ) {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Admin token required" },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
