import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/use-user-profile";
import Image from 'next/image';
import { TopicItemProps } from "@/types/topic";
import { ChevronUp, MessageSquare, Share, BookmarkPlus, MoreHorizontal, Heart } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/utils/supabase/client";

export default function TopicItem({ topic, onAuthorClick, currentUserId, onDeleted }: TopicItemProps) {
  const [deleting, setDeleting] = useState(false);
  const [likes, setLikes] = useState(topic.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const router = useRouter();
  const { profile: authorProfile } = useUserProfile(topic.author_id);
  const { user } = useAuth();

  useEffect(() => {
    // Determine if the authenticated user liked this topic (like #file:index.tsx)
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
    if (!user?.id || likeLoading) return;
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
        <div className="flex flex-col items-center p-2 w-12 bg-gray-50 rounded-l">
          <button
            onClick={handleLike}
            className={`p-1 rounded hover:bg-gray-200 transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
            }`}
            disabled={likeLoading}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <span className={`text-xs font-bold py-1 ${
            isLiked ? 'text-red-500' : 'text-gray-700'
          }`}>
            {likes}
          </span>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-2">
          {/* Header */}
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
            <div className="flex items-center gap-1">
              {authorProfile?.profile_picture ? (
                <Image
                  src={authorProfile.profile_picture}
                  alt={`${authorProfile.first_name} ${authorProfile.last_name}`}
                  width={16}
                  height={16}
                  className="object-cover rounded-full"
                />
              ) : (
                <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    {authorProfile
                      ? `${authorProfile.first_name?.[0] || ""}${authorProfile.last_name?.[0] || ""}`.toUpperCase()
                      : topic.author_id?.slice(0, 1).toUpperCase()}
                  </span>
                </div>
              )}
              <span 
                className="font-medium hover:underline cursor-pointer"
                onClick={() => onAuthorClick?.(topic.author_id)}
              >
                {authorProfile
                  ? `${authorProfile.first_name}${authorProfile.last_name}`.toLowerCase()
                  : topic.author_id}
              </span>
            </div>
            <span>•</span>
            <span>{formatTimeAgo(topic.created_at)}</span>
            {topic.is_hot && (
              <>
                <span>•</span>
                <span className="px-1 py-0.5 bg-red-500 text-white text-xs rounded font-bold">HOT</span>
              </>
            )}
          </div>

          {/* Title and Content */}
          <div className="mb-2">
            <h3 
              className="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer mb-1 leading-tight"
              onClick={() => router.push(`/topic?id=${topic.id}`)}
            >
              {topic.title}
            </h3>
            {topic.content && (
              <p className="text-sm text-gray-700 line-clamp-3">
                {topic.content.slice(0, 200)}
                {topic.content.length > 200 && "..."}
              </p>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
              <MessageSquare size={16} />
              <span>Comments</span>
            </button>
            <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
              <Share size={16} />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
              <BookmarkPlus size={16} />
              <span>Save</span>
            </button>
            
            {currentUserId === topic.author_id && (
              <div className="flex items-center gap-2 ml-auto">
                <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                  <MoreHorizontal size={16} />
                </button>
                <button
                  className="text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
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
}