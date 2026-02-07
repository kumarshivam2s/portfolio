import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    // Get stats from database
    const posts = await db
      .collection("posts")
      .countDocuments({ published: true });
    const comments = await db
      .collection("comments")
      .countDocuments({ approved: true });

    // Calculate total views
    const postsData = await db.collection("posts").find({}).toArray();
    const totalViews = postsData.reduce(
      (sum, post) => sum + (post.views || 0),
      0,
    );

    // For visitors, we would need a separate collection to track this
    // For now, returning a placeholder
    const totalVisitors = Math.floor(Math.random() * 10000) + 1000;

    return NextResponse.json({
      totalPosts: posts,
      totalComments: comments,
      totalViews: totalViews,
      totalVisitors: totalVisitors,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      {
        totalPosts: 0,
        totalComments: 0,
        totalViews: 0,
        totalVisitors: 0,
      },
      { status: 200 },
    );
  }
}
