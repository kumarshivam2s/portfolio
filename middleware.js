import { NextResponse } from "next/server";

export function middleware(request) {
  // Check if it's an admin API route
  if (
    request.nextUrl.pathname.startsWith("/api/admin") ||
    request.nextUrl.pathname.startsWith("/api/posts") ||
    request.nextUrl.pathname.startsWith("/api/comments")
  ) {
    // Allow login endpoint without token
    if (request.nextUrl.pathname === "/api/admin/login") {
      return NextResponse.next();
    }

    // Check for admin token
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
