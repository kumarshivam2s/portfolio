import { NextResponse } from "next/server";
import {
  likeComment,
  dislikeComment,
  deleteComment,
  updateCommentStatus,
} from "@/models/Comment";

async function isAdmin(request) {
  const adminToken = request.cookies.get("admin_token")?.value;
  return adminToken === "authenticated";
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check for admin token
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteComment(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    await updateCommentStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating comment status:", error);
    return NextResponse.json(
      { error: "Failed to update comment status" },
      { status: 500 },
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { action, userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    if (action === "like") {
      await likeComment(id, userId);
    } else if (action === "dislike") {
      await dislikeComment(id, userId);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in comment action:", error);
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 },
    );
  }
}
