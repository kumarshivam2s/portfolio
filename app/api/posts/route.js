import { NextResponse } from "next/server";
import { getAllPosts, createPost } from "@/models/Post";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const cookieToken = request.cookies.get("admin_token")?.value;
    const headerToken = request.headers.get("x-admin-token");
    const token = headerToken || cookieToken;

    let isAdmin = false;
    if (token) {
      const { isValidAdminToken } = await import("@/lib/adminSessions");
      isAdmin = await isValidAdminToken(token);
    }

    // If admin is logged in (via header token), return all posts (including unpublished)
    if (isAdmin) {
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
    // Accept token from header (per-tab sessions) or cookie
    const cookieToken = request.cookies.get("admin_token")?.value;
    const headerToken = request.headers.get("x-admin-token");
    const token = headerToken || cookieToken;

    const { isValidAdminToken } = await import("@/lib/adminSessions");
    const ok = await isValidAdminToken(token);
    if (!ok) {
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
