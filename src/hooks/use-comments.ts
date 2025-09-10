import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Post } from "../types/post";

export function useComments(topicId: string) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['comments', topicId],
    queryFn: async () => {
      if (!topicId) return [];
      const res = await fetch(`/api/post?topicId=${topicId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return await res.json() as Post[];
    },
    enabled: !!topicId,
    staleTime: 1000 * 60 * 2,
  });

  const setComments = (newComments: Post[]) => {
    queryClient.setQueryData(['comments', topicId], newComments);
  };

  const deleteCommentMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch("/api/post", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete comment");
      }
      return postId;
    },
    onSuccess: (postId) => {
      queryClient.setQueryData(['comments', topicId], (old: Post[] | undefined) =>
        old ? old.filter(p => p.id !== postId) : []
      );
    },
  });

  return {
    comments: data ?? [],
    loading: isLoading,
    setComments,
    refresh: refetch,
    deleteComment: deleteCommentMutation.mutateAsync,
    deleting: deleteCommentMutation.isPending,
  };
}