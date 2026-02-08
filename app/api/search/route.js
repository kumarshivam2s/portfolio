import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    const client = await clientPromise;
    const db = client.db("portfolio");

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const posts = await db
      .collection("posts")
      .find({ $or: [{ title: regex }, { excerpt: regex }] })
      .limit(10)
      .toArray();

    const projects = await db
      .collection("projects")
      .find({ $or: [{ title: regex }, { description: regex }] })
      .limit(10)
      .toArray();

    return NextResponse.json(
      { posts, projects },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Error in GET /api/search:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
