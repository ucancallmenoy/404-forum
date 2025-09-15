"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, MessageSquare, Share, Bookmark, Loader2 } from "lucide-react";
import { useCreatePost } from "@/hooks/use-create-post";
import ForumComments from "@/components/dashboard/comments";
import { useCategories } from "@/hooks/use-categories";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types/category";
import { useTopic } from "@/hooks/use-topics";
import { useQueryClient } from '@tanstack/react-query';

export default function PostPage() {
  const router = useRouter();
  const params = useSearchParams();
  const topicId = params.get("id") || undefined;
  const { user } = useAuth();
  
  const { topic, loading: topicLoading, error: topicError, deleteTopic, deleting, toggleLike, liking } = useTopic(topicId);
  const { categories, loading: categoriesLoading } = useCategories();
  const category = categories.find((c: Category) => c.id === topic?.category_id);
  const { createPost, loading: posting } = useCreatePost();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [saved, setSaved] = useState(false);
  const { profile: authorProfile } = useUserProfile(topic?.author_id);
  const { profile: userProfile } = useUserProfile(user?.id);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(topic?.likes ?? 0);
  const queryClient = useQueryClient();

  // Fetch like status
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!topic?.id || !user?.id) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("topic_likes")
        .select("id")
        .eq("topic_id", topic.id)
        .eq("user_id", user.id)
        .single();
      setLiked(!!data);
    };
    fetchLikeStatus();
  }, [topic?.id, user?.id]);

  useEffect(() => {
    setLikesCount(topic?.likes ?? 0);
  }, [topic?.likes]);

  useEffect(() => {
    if (window.location.hash === '#comments' && user) {
      setShowCommentBox(true);
    }
  }, [user]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!comment.trim()) return;

    const ok = await createPost({
      topic_id: topicId!,
      author_id: user.id,
      content: comment,
    });
    if (ok) {
      setComment("");
      setShowCommentBox(false);
      // Invalidate comments query to refresh immediately
      queryClient.invalidateQueries({ queryKey: ['comments', topicId] });
    } else {
      setError("Failed to post comment.");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/topic?id=${topicId}`;
    const title = topic?.title || "Topic";
    const text = `Check out this topic: ${title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!"); 
      } catch (error) {
        console.error("Failed to copy link:", error);
        alert("Failed to copy link. Please copy manually: " + url);
      }
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteTopic(topicId!);
      router.replace("/dashboard");
    } catch (error) {
      console.error("Failed to delete topic:", error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleLikeToggle = async () => {
    if (!user?.id) {
      router.push("/auth/login");
      return;
    }

    if (!topic?.id || !user?.id || liking) return;

    try {
      const data = await toggleLike({ topicId: topic.id, userId: user.id });
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Loading state
  if (topicLoading || categoriesLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading topic...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (topicError || !topic) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{topicError || "Topic not found"}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer"
      >
        ← Back
      </button>
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 relative">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {category?.icon}
          </div>
          <span className="text-orange-600 font-medium">{category?.name}</span>
          {user && user.id === topic.author_id && (
            <button
              onClick={handleDeletePost}
              className="absolute top-4 right-6 flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition-colors px-2 py-1 rounded hover:bg-red-50"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            {/* Heart Like Section */}
            <div className="flex flex-col items-center p-2 w-12 rounded-l">
              <button
                onClick={handleLikeToggle}
                className={`p-1 rounded hover:bg-gray-200 transition-colors cursor-pointer ${
                  liked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                }`}
                disabled={liking}
              >
                <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
              </button>
              <span className={`text-xs font-bold py-1 ${
                liked ? 'text-red-500' : 'text-gray-700'
              }`}>
                {likesCount}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span>Posted by</span>
                <button
                  className="flex items-center gap-2 text-gray-700 hover:underline cursor-pointer font-medium"
                  onClick={() => router.push(`/profile?id=${topic.author_id}`)}
                  title={`View profile of ${authorProfile?.first_name || ""} ${authorProfile?.last_name || ""}`}
                >
                  {authorProfile?.profile_picture ? (
                    <Image
                      src={authorProfile.profile_picture}
                      alt={`${authorProfile.first_name} ${authorProfile.last_name}`}
                      width={24}
                      height={24}
                      className="object-cover rounded-full"
                      priority={false}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-600">
                        {authorProfile?.first_name?.[0] || authorProfile?.last_name?.[0] || "?"}
                      </span>
                    </div>
                  )}
                  <span>
                    {authorProfile?.first_name && authorProfile?.last_name
                      ? `${authorProfile.first_name} ${authorProfile.last_name}`
                      : ''}
                  </span>
                </button>
                <span>•</span>
                <span>{getTimeAgo(topic.created_at)}</span>
              </div>
              <h1 className="text-gray-900 text-xl font-semibold mb-4 leading-tight">
                {topic.title}
              </h1>
              <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                {topic.content}
              </div>
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={() => user ? setShowCommentBox(!showCommentBox) : router.push("/auth/login")}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
                >
                  <MessageSquare size={16} />
                  <span className="text-sm font-medium">Comments</span>
                </button>
                <button 
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
                  onClick={handleShare}
                >
                  <Share size={16} />
                  <span className="text-sm font-medium">Share</span>
                </button>
                <button 
                  onClick={() => setSaved(!saved)}
                  className={`flex items-center gap-2 transition-colors px-2 py-1 rounded hover:bg-gray-100 cursor-pointer ${
                    saved ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
                  <span className="text-sm font-medium">Save</span>
                </button>
              </div>
              {showCommentBox && user && (
                <div className="border border-gray-200 rounded-lg mb-6">
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <span className="text-xs text-gray-500">Comment as </span>
                    <span className="text-xs text-blue-600 font-medium">
                      {userProfile?.first_name && userProfile?.last_name
                        ? `${userProfile.first_name} ${userProfile.last_name}`
                        : ""}
                    </span>
                  </div>
                  <div className="p-3">
                    <form onSubmit={handleComment}>
                      <textarea
                        className="w-full bg-transparent text-gray-800 placeholder-gray-400 resize-none focus:outline-none text-sm"
                        placeholder="What are your thoughts?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        disabled={posting}
                      />
                      {error && (
                        <div className="text-red-500 text-xs mt-2">{error}</div>
                      )}
                      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setShowCommentBox(false)}
                          className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={posting || !comment.trim()}
                        >
                          {posting ? "Commenting..." : "Comment"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {!user && (
                <div className="border border-gray-200 rounded-lg mb-6 p-4 text-center">
                  <p className="text-gray-600 mb-3">
                    <Link href="/auth/login" className="text-blue-600 hover:underline">
                      Sign in
                    </Link>
                    {" "}to comment on this post
                  </p>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4">
                <ForumComments topicId={topicId!} currentUserId={user?.id ?? ""} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}