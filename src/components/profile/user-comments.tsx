"use client";
import { MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserComments } from "@/hooks/use-user-comments";
import { Post } from "@/types/post";

interface UserCommentsProps {
  userId: string;
}

export default function UserComments({ userId }: UserCommentsProps) {
  const { comments, topics, loading, error } = useUserComments(userId);
  const router = useRouter();

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error.message}</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No comments yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {comments.map((comment: Post) => {
          const topic = topics[comment.topic_id];
          return (
            <div key={comment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>Commented on</span>
                    <button
                      onClick={() => router.push(`/topic?id=${comment.topic_id}`)}
                      className="text-blue-600 hover:underline font-medium truncate cursor-pointer"
                    >
                      {topic?.title || "Unknown Topic"}
                    </button>
                    <span>•</span>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed">{comment.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}