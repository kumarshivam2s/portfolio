import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const headerToken = request.headers.get("x-admin-token");
    const cookieToken = request.cookies.get("admin_token")?.value;
    const token = headerToken || cookieToken;

    if (!token) return NextResponse.json({ ok: false }, { status: 401 });

    const { isValidAdminToken } = await import("@/lib/adminSessions");
    const ok = await isValidAdminToken(token);
    if (!ok) return NextResponse.json({ ok: false }, { status: 401 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin validate failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
