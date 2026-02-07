"use client";

import { useState, useEffect } from "react";
import { FiThumbsUp, FiThumbsDown, FiCornerDownRight } from "react-icons/fi";

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState({
    name: "",
    email: "",
    content: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${String(postId)}`);
      const data = await response.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setNewComment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.name || !newComment.email || !newComment.content) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: String(postId),
          name: newComment.name,
          email: newComment.email,
          content: newComment.content,
          parentId: replyingTo,
        }),
      });

      if (response.ok) {
        setNewComment({ name: "", email: "", content: "" });
        setReplyingTo(null);
        await fetchComments();
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await fetch(`/api/comments/${commentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "like",
          userId: "anonymous",
        }),
      });
      await fetchComments();
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDislikeComment = async (commentId) => {
    try {
      await fetch(`/api/comments/${commentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "dislike",
          userId: "anonymous",
        }),
      });
      await fetchComments();
    } catch (error) {
      console.error("Error disliking comment:", error);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700">
      <h3 className="text-2xl font-bold mb-8">Comments</h3>

      <div className="mb-8 p-6 border border-gray-300 dark:border-gray-700 rounded-lg">
        <h4 className="font-bold mb-4">Leave a Comment</h4>
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={newComment.name}
              onChange={handleCommentChange}
              required
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={newComment.email}
              onChange={handleCommentChange}
              required
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <textarea
            name="content"
            placeholder="Your comment..."
            value={newComment.content}
            onChange={handleCommentChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold text-sm"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
            {replyingTo && (
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel Reply
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : comments && comments.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-6">
          {Array.isArray(comments) &&
            comments.map((comment) => {
              try {
                if (!comment || typeof comment !== "object" || !comment._id) {
                  return null;
                }
                return (
                  <div
                    key={String(comment._id)}
                    className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    <div className="mb-2">
                      <p className="font-bold text-gray-900 dark:text-gray-100">
                        {String(comment.name || "Anonymous")}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : "Just now"}
                      </p>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {String(comment.content || "")}
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleLikeComment(String(comment._id))}
                        className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <FiThumbsUp className="w-4 h-4" />
                        {comment.likes || 0}
                      </button>
                      <button
                        onClick={() =>
                          handleDislikeComment(String(comment._id))
                        }
                        className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <FiThumbsDown className="w-4 h-4" />
                        {comment.dislikes || 0}
                      </button>
                      <button
                        onClick={() => setReplyingTo(String(comment._id))}
                        className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <FiCornerDownRight className="w-4 h-4" />
                        Reply
                      </button>
                    </div>
                  </div>
                );
              } catch (err) {
                console.error("Error rendering comment:", err, comment);
                return null;
              }
            })}
        </div>
      )}
    </div>
  );
}
