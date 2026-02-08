import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");
    const docs = await db
      .collection("testimonials")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      { testimonials: docs },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Error in GET /api/testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function POST(request) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, quote } = body;
    if (!name || !quote) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("portfolio");

    const now = new Date();
    // default to active: true
    const res = await db
      .collection("testimonials")
      .insertOne({ name, quote, active: true, createdAt: now, updatedAt: now });
    const created = await db
      .collection("testimonials")
      .findOne({ _id: res.insertedId });

    return NextResponse.json({ testimonial: created }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/testimonials:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 },
    );
  }
}
