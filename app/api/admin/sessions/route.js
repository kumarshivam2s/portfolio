import { NextResponse } from "next/server";
import { isValidAdminToken, createAdminSession } from "@/lib/adminSessions";

export async function POST(request) {
  try {
    const token = request.headers.get("x-admin-token");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ok = await isValidAdminToken(token);
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create a new session (acts like a per-tab session seed) — reuse adminEmail from the original session
    // For this we need to look up the original session to get adminEmail
    const clientPromise = (await import("@/lib/mongodb")).default;
    const client = await clientPromise;
    const db = client.db("portfolio");
    const original = await db.collection("admin_sessions").findOne({ token });
    const adminEmail = original?.adminEmail || null;

    const session = await createAdminSession(adminEmail);
    if (!session)
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 },
      );

    return NextResponse.json({
      success: true,
      admin_token: session.token,
      expiresAt: session.expiresAt,
    });
  } catch (err) {
    console.error("Failed to create admin session:", err);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}
