import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Accept token either from header or cookie
    const headerToken = request.headers.get("x-admin-token");
    const cookieToken = request.cookies.get("admin_token")?.value;
    const token = headerToken || cookieToken;

    if (token) {
      const { deleteAdminSession } = await import("@/lib/adminSessions");
      try {
        await deleteAdminSession(token);
      } catch (e) {}
    }

    const response = NextResponse.json({ success: true });

    // also clear cookie for compatibility
    response.cookies.set("admin_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
