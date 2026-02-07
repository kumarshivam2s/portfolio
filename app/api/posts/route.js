import { NextResponse } from "next/server";
import { getAllPosts, createPost } from "@/models/Post";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const adminToken = request.cookies.get("admin_token")?.value;

    // If admin is logged in, return all posts (including unpublished)
    if (adminToken) {
      const client = await clientPromise;
      const db = client.db("portfolio");
      const posts = await db
        .collection("posts")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      return NextResponse.json(posts);
    }

    // Otherwise return only published posts for public
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    // Check for admin token in cookies
    const adminToken = request.cookies.get("admin_token")?.value;

    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const post = await createPost(body);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}
