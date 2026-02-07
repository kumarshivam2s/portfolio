"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiCalendar, FiClock, FiEye, FiUser } from "react-icons/fi";
import CommentSection from "@/components/CommentSection";

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const postId = params?.slug; // This is actually the _id, not a slug

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s+/).length || 0;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return readTime;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 lg:p-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen p-8 lg:p-16">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            The post you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-5xl">
        {/* Post Header */}
        <header className="mb-12">
          {post.image && (
            <div className="w-full h-80 mb-8 rounded overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-3xl lg:text-4xl font-bold mb-6">{post.title}</h1>

          <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-500 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
            {post.author && (
              <div className="flex items-center gap-1.5">
                <FiUser size={14} />
                <span>{post.author}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <FiCalendar size={14} />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiClock size={14} />
              <span>{calculateReadTime(post.content)} min read</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiEye size={14} />
              <span>{post.views || 0} views</span>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Post Content */}
        <article className="mb-12">
          <div
            className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Comments Section */}
        <CommentSection postId={post._id} />
      </div>
    </div>
  );
}
