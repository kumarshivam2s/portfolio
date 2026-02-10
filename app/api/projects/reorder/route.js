import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const cookieToken = request.cookies.get("admin_token")?.value;
    const headerToken = request.headers.get("x-admin-token");
    const token = headerToken || cookieToken;

    const { isValidAdminToken } = await import("@/lib/adminSessions");
    const ok = await isValidAdminToken(token);
    if (!ok)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const order = body?.order;
    if (!Array.isArray(order) || order.length === 0) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }

    const clientPromise = (await import("@/lib/mongodb")).default;
    const client = await clientPromise;
    const db = client.db("portfolio");

    const ops = order.map((item) => ({
      updateOne: {
        filter: { _id: new ObjectId(item.id) },
        update: { $set: { position: item.position, updatedAt: new Date() } },
      },
    }));

    if (ops.length > 0) {
      await db.collection("projects").bulkWrite(ops);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/projects/reorder:", error);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
