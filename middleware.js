import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Let OPTIONS through immediately (preflight requests)
  if (method === "OPTIONS") {
    return NextResponse.next();
  }

  // Allow static assets and common public files so pages load (CSS/JS/images)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    /\.(css|js|png|jpg|jpeg|svg|ico|json)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Always allow public GET requests to /api/posts, /api/comments and /api/settings
  if (
    (pathname.startsWith("/api/posts") && method === "GET") ||
    (pathname.startsWith("/api/comments") &&
      (method === "GET" || method === "POST")) ||
    (pathname.startsWith("/api/settings") && method === "GET")
  ) {
    // allow these through even during maintenance so admin can configure
    return NextResponse.next();
  }

  // Allow admin UI (login) pages through so admin can sign in even during maintenance
  if (
    pathname === "/admin" ||
    pathname === "/admin/" ||
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/api/admin/login")
  ) {
    return NextResponse.next();
  }

  // If request is for admin area or admin APIs, accept token from cookie OR header (per-tab tokens use header)
  const cookieToken = request.cookies.get("admin_token")?.value;
  const headerToken = request.headers.get("x-admin-token");
  const token = headerToken || cookieToken;

  // For other API paths that we treat as protected, require token presence (endpoints will validate token properly)
  if (
    pathname.startsWith("/api/posts") ||
    pathname.startsWith("/api/comments")
  ) {
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Admin token required" },
        { status: 401 },
      );
    }
  }

  // If no admin cookie, check maintenance mode from settings API (edge-safe). Avoid importing node-only modules here.
  try {
    const settingsUrl = new URL("/api/settings", request.url).toString();
    const settingsRes = await fetch(settingsUrl, {
      method: "GET",
      headers: { "x-internal-middleware": "1" },
    });
    if (settingsRes && settingsRes.ok) {
      const data = await settingsRes.json();
      const maintenanceMode = !!data.maintenanceMode;

      if (maintenanceMode) {
        // Allow admins (requests carrying a valid admin token in header or cookie) to bypass maintenance
        if (token) {
          try {
            const validateUrl = new URL(
              "/api/admin/validate",
              request.url,
            ).toString();
            const headers = headerToken
              ? { "x-admin-token": headerToken }
              : { cookie: request.headers.get("cookie") || "" };
            const val = await fetch(validateUrl, {
              method: "GET",
              headers: { ...headers, "x-internal-middleware": "1" },
            });
            if (val && val.ok) {
              return NextResponse.next();
            }
          } catch (e) {
            // validation failed -> fall through to maintenance response
            console.error("Admin validate check failed in middleware:", e);
          }
        }

        if (pathname.startsWith("/api")) {
          return NextResponse.json(
            { error: "Site is in maintenance mode" },
            { status: 503 },
          );
        } else {
          const body = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Maintenance</title>
  <style>
    :root{color-scheme:light dark}
    html,body{height:100%;margin:0;font-family:Inter,system-ui,Segoe UI,Roboto,-apple-system,Arial}
    .wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f9fafb;color:#111827}
    .card{max-width:720px;padding:28px;border-radius:12px;background:white;border:1px solid #e5e7eb;box-shadow:0 6px 18px rgba(15,23,42,0.06);text-align:center}
    .title{font-size:20px;font-weight:700;margin:0 0 8px}
    .desc{color:#6b7280;margin:0}
    @media (prefers-color-scheme:dark){.wrap{background:#0b1220;color:#e6eef8}.card{background:#0b1220;border-color:#0f1724;box-shadow:none}.desc{color:#9aa7bd}}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1 class="title">Maintenance Mode</h1>
      <p class="desc">The site is currently undergoing maintenance. Please check back soon.</p>
    </div>
  </div>
</body>
</html>`;

          return new NextResponse(body, {
            status: 503,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
      }
    }
  } catch (err) {
    console.error("Middleware settings check failed:", err);
    // allow request if settings check fails to avoid locking out site
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
