import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function getAllPosts(limit = null) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    let query = db
      .collection("posts")
      .find({ 
        $or: [
          { status: "published" },
          { status: "Published" }
        ]
      })
      .sort({ createdAt: -1 });

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
      .sort({ createdAt: -1 })
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
