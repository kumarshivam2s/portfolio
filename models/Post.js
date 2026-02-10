import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function getAllPosts(limit = null) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    let query = db
      .collection("posts")
      .find({
        $or: [{ status: "published" }, { status: "Published" }],
      })
      // Prefer explicit position ordering; fall back to createdAt for stability
      .sort({ position: 1, createdAt: -1 });

    if (limit) {
      query = query.limit(limit);
    }

    const posts = await query.toArray();
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getAllPostsAdmin() {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const posts = await db
      .collection("posts")
      .find({})
      .sort({ position: 1, createdAt: -1 })
      .toArray();
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error("Error fetching all posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const post = await db
      .collection("posts")
      .findOne({ slug, status: "published" });

    if (!post) return null;

    return JSON.parse(JSON.stringify(post));
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function getPostById(id) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(id) });

    if (!post) return null;

    return JSON.parse(JSON.stringify(post));
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function createPost(postData) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    // Determine next position (append at end)
    const top = await db
      .collection("posts")
      .find({})
      .sort({ position: -1 })
      .limit(1)
      .toArray();
    const nextPos = top.length ? (top[0].position || 0) + 1 : 1;

    const post = {
      ...postData,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      comments: 0,
      status: postData.status || "draft",
      author: postData.author || "Admin",
      tags: postData.tags || [],
      scheduledPublishDate: postData.scheduledPublishDate || null,
      position: nextPos,
    };

    const result = await db.collection("posts").insertOne(post);
    return { ...post, _id: result.insertedId };
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

export async function updatePost(id, postData) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    // Remove _id from update data to avoid immutable field error
    const { _id, createdAt, ...updateData } = postData;

    const update = {
      ...updateData,
      updatedAt: new Date(),
    };

    await db
      .collection("posts")
      .updateOne({ _id: new ObjectId(id) }, { $set: update });

    return { _id: id, ...update };
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
}

export async function swapPostPosition(id, direction) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    // Ensure positions are set for ALL documents. If any are missing, normalize positions deterministically by createdAt descending
    const missingPosCount = await db
      .collection("posts")
      .countDocuments({ position: { $exists: false } });

    if (missingPosCount > 0) {
      const all = await db
        .collection("posts")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      for (let i = 0; i < all.length; i++) {
        await db
          .collection("posts")
          .updateOne({ _id: all[i]._id }, { $set: { position: i + 1 } });
      }
    }

    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(id) });

    if (!post) throw new Error("Post not found");

    const currentPos = post.position || 0;
    let neighbor;

    if (direction === "up") {
      neighbor = await db
        .collection("posts")
        .find({ position: { $lt: currentPos } })
        .sort({ position: -1 })
        .limit(1)
        .toArray();
      neighbor = neighbor[0];
    } else {
      neighbor = await db
        .collection("posts")
        .find({ position: { $gt: currentPos } })
        .sort({ position: 1 })
        .limit(1)
        .toArray();
      neighbor = neighbor[0];
    }

    if (!neighbor) return false; // cannot move

    // swap positions
    await db
      .collection("posts")
      .updateOne({ _id: post._id }, { $set: { position: neighbor.position } });
    await db
      .collection("posts")
      .updateOne({ _id: neighbor._id }, { $set: { position: currentPos } });

    return true;
  } catch (error) {
    console.error("Error swapping post position:", error);
    throw error;
  }
}

export async function deletePost(id) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    await db.collection("posts").deleteOne({ _id: new ObjectId(id) });
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

export async function incrementPostViews(slug) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    await db.collection("posts").updateOne({ slug }, { $inc: { views: 1 } });
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
}
