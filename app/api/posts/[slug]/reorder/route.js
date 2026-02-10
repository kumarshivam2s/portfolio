import { NextResponse } from "next/server";
import { swapPostPosition } from "@/models/Post";

export async function POST(request, { params }) {
  try {
    const { slug } = params;
    const cookieToken = request.cookies.get("admin_token")?.value;
    const headerToken = request.headers.get("x-admin-token");
    const token = headerToken || cookieToken;

    const { isValidAdminToken } = await import("@/lib/adminSessions");
    const ok = await isValidAdminToken(token);
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const direction = body?.direction;
    if (!direction || (direction !== "up" && direction !== "down")) {
      return NextResponse.json({ error: "Invalid direction" }, { status: 400 });
    }

    const result = await swapPostPosition(slug, direction);
    if (!result) {
      return NextResponse.json({ error: "Cannot move" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering post:", error);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
