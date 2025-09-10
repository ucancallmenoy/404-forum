import { useState, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { useUserCache } from "@/contexts/user-cache-context";
import Image from 'next/image';
import { TopicItemProps } from "@/types/topic";
import { MessageSquare, Share, BookmarkPlus, Heart } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/utils/supabase/client";

const TopicItem = memo(function TopicItem({ topic, onAuthorClick, currentUserId, onDeleted }: TopicItemProps) {
  const [deleting, setDeleting] = useState(false);
  const [likes, setLikes] = useState(topic.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const router = useRouter();
  const { getUserFromCache } = useUserCache();
  const { user } = useAuth();
  const authorProfile = getUserFromCache(topic.author_id);

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
      setIsLiked(!!data);
    };
    fetchLikeStatus();
  }, [topic?.id, user?.id]);

  const handleLike = async () => {
    if (!user?.id) {
      // Redirect to login if user is not authenticated
      router.push("/auth/login");
      return;
    }
    
    if (likeLoading) return;
    
    setLikeLoading(true);
    try {
      const response = await fetch("/api/topic", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_like",
          topicId: topic.id,
          userId: user.id,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikes(data.likesCount);
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComments = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    router.push(`/topic?id=${topic.id}#comments`);
  };

  const handleShare = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const url = `${window.location.origin}/topic?id=${topic.id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      alert("Failed to copy link. Please copy manually: " + url);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;
    setDeleting(true);
    const res = await fetch("/api/topic", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId: topic.id }),
    });
    setDeleting(false);
    if (res.ok && onDeleted) {
      onDeleted(topic.id);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo`;
    return `${Math.floor(diffInMonths / 12)}y`;
  };

  return (
    <div className="bg-white border border-gray-300 rounded hover:border-gray-400 transition-colors">
      <div className="flex">
        {/* Like Section */}
        <div className="flex flex-col items-center p-3 w-14 bg-gray-50 rounded-l">
          <button
            onClick={handleLike}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
            }`}
            disabled={likeLoading}
          >
            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <span className={`text-sm font-bold py-1 ${
            isLiked ? 'text-red-500' : 'text-gray-700'
          }`}>
            {likes}
          </span>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-2">
              {authorProfile?.profile_picture ? (
                <Image
                  src={authorProfile.profile_picture}
                  alt={`${authorProfile.first_name} ${authorProfile.last_name}`}
                  width={20}
                  height={20}
                  className="object-cover rounded-full"
                  priority={false}
                  loading="lazy"
                />
              ) : (
                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm text-gray-600">
                    {authorProfile?.first_name?.[0] || authorProfile?.last_name?.[0] || "?"}
                  </span>
                </div>
              )}
              <span 
                className="font-medium hover:underline cursor-pointer"
                onClick={() => onAuthorClick?.(topic.author_id)}
              >
                {authorProfile?.first_name && authorProfile?.last_name
                  ? `${authorProfile.first_name} ${authorProfile.last_name}`
                  : 'Loading...'}
              </span>
            </div>
            <span>•</span>
            <span>{formatTimeAgo(topic.created_at)}</span>
            {topic.is_hot && (
              <>
                <span>•</span>
                <span className="px-2 py-1 bg-red-500 text-white text-sm rounded font-bold">HOT</span>
              </>
            )}
          </div>

          {/* Title and Content */}
          <div className="mb-3">
            <h3 
              className="text-xl font-medium text-gray-900 hover:text-blue-600 cursor-pointer mb-2 leading-tight"
              onClick={() => router.push(`/topic?id=${topic.id}`)}
            >
              {topic.title}
            </h3>
            {topic.content && (
              <p className="text-base text-gray-700 line-clamp-3">
                {topic.content.slice(0, 200)}
                {topic.content.length > 200 && "..."}
              </p>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <button 
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors"
              onClick={handleComments}
            >
              <MessageSquare size={18} />
              <span>Comments</span>
            </button>
            <button 
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors"
              onClick={handleShare}
            >
              <Share size={18} />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition-colors">
              <BookmarkPlus size={18} />
              <span>Save</span>
            </button>

            {currentUserId === topic.author_id && (
              <div className="flex items-center gap-3 ml-auto">
                <button
                  className="text-red-500 px-3 py-2 rounded hover:bg-red-50 transition-colors"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default TopicItem;