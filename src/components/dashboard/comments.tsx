"use client";
import { memo, } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ForumCommentsProps } from "@/types/post";
import { useComments } from "@/hooks/use-comments";

const AuthorBlock = memo(function AuthorBlock({ userId, createdAt }: { userId: string; createdAt: string }) {
  const { profile } = useUserProfile(userId);
  const router = useRouter();

  const handleProfileClick = () => {
    router.push(`/profile?id=${userId}`);
  };

  const initials = profile?.first_name && profile?.last_name 
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : '';

  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : '';

  return (
    <div className="flex items-start gap-3 mb-2 w-full">
      <button
        type="button"
        className="focus:outline-none cursor-pointer"
        onClick={handleProfileClick}
        title={displayName ? `View profile of ${displayName}` : ''}
      >
        {profile?.profile_picture ? (
          <Image
            src={profile.profile_picture}
            alt={displayName}
            width={48}
            height={48}
            className="rounded-full object-cover border"
          />
        ) : (
          <span className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 border">
            {initials}
          </span>
        )}
      </button>
      <div className="flex flex-col">
        <button
          type="button"
          className="text-base font-semibold text-gray-900 text-left hover:underline focus:outline-none cursor-pointer"
          onClick={handleProfileClick}
        >
          {displayName}
        </button>
        <span className="text-xs text-gray-400 mt-1">{new Date(createdAt).toLocaleString()}</span>
      </div>
    </div>
  );
});

const ForumComments = memo(function ForumComments({ topicId, currentUserId }: ForumCommentsProps) {
  const { comments, loading, deleteComment, deleting } = useComments(topicId);

  const handleDelete = async (postId: string) => {
    try {
      await deleteComment(postId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-4 text-lg">Comments</h3>
      {loading ? (
        <div>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-500">No comments yet.</div>
      ) : (
        <ul className="space-y-6">
          {comments.map(post => (
            <li key={post.id} className="border border-gray-200 rounded-lg p-4 flex flex-col items-start relative">
              {post.author_id === currentUserId && (
                <button
                  className="absolute top-3 right-3 text-xs text-red-500 hover:underline"
                  onClick={() => handleDelete(post.id)}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
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