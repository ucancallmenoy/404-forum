import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Post } from "../types/post";

export function usePosts(topicId: string) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['posts', topicId],
    queryFn: async () => {
      if (!topicId) return [];
      const res = await fetch(`/api/post?topicId=${topicId}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return await res.json() as Post[];
    },
    enabled: !!topicId,
    staleTime: 1000 * 60 * 2,
  });

  const setPosts = (newPosts: Post[]) => {
    queryClient.setQueryData(['posts', topicId], newPosts);
  };

  return {
    posts: data ?? [],
    loading: isLoading,
    setPosts,
    refresh: refetch,
  };
}