import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function getCommentsByPostId(postId) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const comments = await db
      .collection("comments")
      .find({ postId, status: "approved" })
      .sort({ createdAt: -1 })
      .toArray();

    return JSON.parse(JSON.stringify(comments));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

export async function getAllComments() {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const comments = await db
      .collection("comments")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return JSON.parse(JSON.stringify(comments));
  } catch (error) {
    console.error("Error fetching all comments:", error);
    return [];
  }
}

export async function createComment(commentData) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const comment = {
      ...commentData,
      createdAt: new Date(),
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
      status: commentData.status || "approved",
    };

    const result = await db.collection("comments").insertOne(comment);
    return { ...comment, _id: result.insertedId };
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
}

export async function likeComment(commentId, userId) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const comment = await db
      .collection("comments")
      .findOne({ _id: new ObjectId(commentId) });

    if (!comment) throw new Error("Comment not found");

    const likedBy = comment.likedBy || [];
    const dislikedBy = comment.dislikedBy || [];

    let update = {};

    if (likedBy.includes(userId)) {
      // Unlike
      update = {
        $inc: { likes: -1 },
        $pull: { likedBy: userId },
      };
    } else {
      // Like (and remove dislike if exists)
      if (dislikedBy.includes(userId)) {
        update = {
          $inc: { likes: 1, dislikes: -1 },
          $addToSet: { likedBy: userId },
          $pull: { dislikedBy: userId },
        };
      } else {
        update = {
          $inc: { likes: 1 },
          $addToSet: { likedBy: userId },
        };
      }
    }

    await db
      .collection("comments")
      .updateOne({ _id: new ObjectId(commentId) }, update);

    return true;
  } catch (error) {
    console.error("Error liking comment:", error);
    throw error;
  }
}

export async function dislikeComment(commentId, userId) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const comment = await db
      .collection("comments")
      .findOne({ _id: new ObjectId(commentId) });

    if (!comment) throw new Error("Comment not found");

    const likedBy = comment.likedBy || [];
    const dislikedBy = comment.dislikedBy || [];

    let update = {};

    if (dislikedBy.includes(userId)) {
      // Remove dislike
      update = {
        $inc: { dislikes: -1 },
        $pull: { dislikedBy: userId },
      };
    } else {
      // Dislike (and remove like if exists)
      if (likedBy.includes(userId)) {
        update = {
          $inc: { dislikes: 1, likes: -1 },
          $addToSet: { dislikedBy: userId },
          $pull: { likedBy: userId },
        };
      } else {
        update = {
          $inc: { dislikes: 1 },
          $addToSet: { dislikedBy: userId },
        };
      }
    }

    await db
      .collection("comments")
      .updateOne({ _id: new ObjectId(commentId) }, update);

    return true;
  } catch (error) {
    console.error("Error disliking comment:", error);
    throw error;
  }
}

export async function deleteComment(commentId) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    await db.collection("comments").deleteOne({ _id: new ObjectId(commentId) });
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}

export async function replyToComment(parentId, commentData) {
  try {
    const comment = await createComment({
      ...commentData,
      parentId,
    });
    return comment;
  } catch (error) {
    console.error("Error replying to comment:", error);
    throw error;
  }
}
export async function updateCommentStatus(commentId, status) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    await db.collection("comments").updateOne(
      { _id: new ObjectId(commentId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    );

    return true;
  } catch (error) {
    console.error("Error updating comment status:", error);
    throw error;
  }
}

export async function bulkUpdateCommentStatus(commentIds, status) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const oids = commentIds.map((id) => new ObjectId(id));

    await db.collection("comments").updateMany(
      { _id: { $in: oids } },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    );

    return true;
  } catch (error) {
    console.error("Error bulk updating comment status:", error);
    throw error;
  }
}

export async function bulkDeleteComments(commentIds) {
  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    const oids = commentIds.map((id) => new ObjectId(id));

    await db.collection("comments").deleteMany({ _id: { $in: oids } });

    return true;
  } catch (error) {
    console.error("Error bulk deleting comments:", error);
    throw error;
  }
}
