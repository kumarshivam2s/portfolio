import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const settingsDoc = await db.collection("settings").findOne({ _id: "site_settings" });
    const logs = await db
      .collection("settings_log")
      .find()
      .sort({ updatedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ settings: settingsDoc || null, logs }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error in GET /api/admin/diagnostics:", error);
    return NextResponse.json({ error: "Diagnostics fetch failed" }, { status: 500 });
  }
}
