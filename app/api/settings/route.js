import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/models/Setting";

export async function GET(request) {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
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
    const body = await request.json();
    // Expect an object with keys to update
    const updated = await updateSettings(body);
    if (!updated)
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PUT /api/settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
