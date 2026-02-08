import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/models/Setting";

export async function GET(request) {
  try {
    const origin = request.headers.get("origin") || "*";
    const settings = await getSettings();
    return NextResponse.json(settings, {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const origin = request.headers.get("origin") || "*";
    const body = await request.json();
    console.log("PUT /api/settings body:", body);
    const adminEmail = body.adminEmail || null;
    const updates = { ...body };
    delete updates.adminEmail;

    // Expect an object with keys to update
    const updated = await updateSettings(updates, adminEmail);
    if (!updated)
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    console.log("Settings updated successfully");
    return NextResponse.json(updated, {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
      },
    });
  } catch (error) {
    console.error("Error in PUT /api/settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}

// Handle preflight requests from browsers (OPTIONS)
export function OPTIONS(request) {
  const origin = request.headers.get("origin") || "*";
  console.log("OPTIONS /api/settings from", origin);
  return NextResponse.json(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
