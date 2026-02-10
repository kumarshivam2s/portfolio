import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  // Diagnostics endpoint intentionally disabled to avoid exposing sensitive data
  console.warn("GET /api/admin/diagnostics requested — endpoint disabled");
  return NextResponse.json({ error: "Diagnostics disabled" }, { status: 410 });
}
