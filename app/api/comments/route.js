import { NextResponse } from "next/server";
import {
  getCommentsByPostId,
  getAllComments,
  createComment,
  likeComment,
  dislikeComment,
} from "@/models/Comment";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    // If postId is provided, get comments for that post (public)
    // If no postId, require admin auth to get all comments
    if (postId) {
      const comments = await getCommentsByPostId(postId);
      return NextResponse.json(comments);
    } else {
      // Admin endpoint - get all comments
      const cookieToken = request.cookies.get("admin_token")?.value;
      const headerToken = request.headers.get("x-admin-token");
      const token = headerToken || cookieToken;
      const { isValidAdminToken } = await import("@/lib/adminSessions");
      const ok = await isValidAdminToken(token);
      if (!ok) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const comments = await getAllComments();
      return NextResponse.json(comments);
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.postId || !body.name || !body.email || !body.content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const comment = await createComment({
      postId: body.postId,
      name: body.name,
      email: body.email,
      content: body.content,
      parentId: body.parentId || null,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}
