"use client";
import { usePosts } from "@/hooks/use-posts";
import { useState, useRef, memo, useEffect } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ForumCommentsProps } from "@/types/post";

const AuthorBlock = memo(function AuthorBlock({ userId, createdAt }: { userId: string; createdAt: string }) {
  const { profile } = useUserProfile(userId);
  const router = useRouter();

  const handleProfileClick = () => {
    router.push(`/profile?id=${userId}`);
  };

  return (
    <div className="flex items-start gap-3 mb-2 w-full">
      <button
        type="button"
        className="focus:outline-none"
        onClick={handleProfileClick}
        title={`View profile of ${profile?.first_name || ""} ${profile?.last_name || ""}`}
      >
        {profile?.profile_picture ? (
          <Image
            src={profile.profile_picture}
            alt={`${profile.first_name} ${profile.last_name}`}
            width={48}
            height={48}
            className="rounded-full object-cover border"
          />
        ) : (
          <span className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 border">
            {profile?.first_name?.[0] || ""}{profile?.last_name?.[0] || ""}
          </span>
        )}
      </button>
      <div className="flex flex-col">
        <button
          type="button"
          className="text-base font-semibold text-gray-900 text-left hover:underline focus:outline-none"
          onClick={handleProfileClick}
        >
          {profile?.first_name || ""} {profile?.last_name || ""}
        </button>
        <span className="text-xs text-gray-400 mt-1">{new Date(createdAt).toLocaleString()}</span>
      </div>
    </div>
  );
});

const ForumComments = memo(function ForumComments({ topicId, currentUserId }: ForumCommentsProps) {
  const postsState = usePosts(topicId);
  const [deleting, setDeleting] = useState<string | null>(null);

  const posts = postsState.posts;
  const loading = postsState.loading;
  const setPostsRef = useRef(postsState.setPosts);

  const refreshPosts = async () => {
    const res = await fetch(`/api/post?topicId=${topicId}`);
    if (res.ok) {
      const data = await res.json();
      setPostsRef.current(data);
    }
  };

  useEffect(() => {
    const handler = () => refreshPosts();
    window.addEventListener("refresh-comments", handler);
    return () => window.removeEventListener("refresh-comments", handler);
  }, []);

  const handleDelete = async (postId: string) => {
    setDeleting(postId);
    const res = await fetch("/api/post", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    if (res.ok) {
      setPostsRef.current(posts.filter(p => p.id !== postId));
    }
    setDeleting(null);
  };

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-4 text-lg">Comments</h3>
      {loading ? (
        <div>Loading comments...</div>
      ) : posts.length === 0 ? (
        <div className="text-gray-500">No comments yet.</div>
      ) : (
        <ul className="space-y-6">
          {posts.map(post => (
            <li key={post.id} className="border border-gray-200 rounded-lg p-4 flex flex-col items-start relative">
              {post.author_id === currentUserId && (
                <button
                  className="absolute top-3 right-3 text-xs text-red-500 hover:underline"
                  onClick={() => handleDelete(post.id)}
                  disabled={deleting === post.id}
                >
                  {deleting === post.id ? "Deleting..." : "Delete"}
                </button>
              )}
              <AuthorBlock userId={post.author_id} createdAt={post.created_at} />
              <div className="w-full mt-2">
                <div className="text-base text-gray-800 mb-2">{post.content}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default ForumComments;