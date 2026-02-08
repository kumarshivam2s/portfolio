import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await request.json();
    const { name, quote, active } = body;

    const client = await clientPromise;
    const db = client.db("portfolio");

    const update = { updatedAt: new Date() };
    if (typeof active !== "undefined") update["active"] = !!active;
    if (name) update["name"] = name;
    if (quote) update["quote"] = quote;

    await db.collection("testimonials").updateOne({ _id: new ObjectId(id) }, { $set: update });
    const updated = await db.collection("testimonials").findOne({ _id: new ObjectId(id) });

    return NextResponse.json({ testimonial: updated });
  } catch (error) {
    console.error("Error in PUT /api/testimonials/[id]:", error);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("portfolio");

    await db.collection("testimonials").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in DELETE /api/testimonials/[id]:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}