import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Topic } from "../types/topic";

export function useUserPosts(userId?: string) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/topic?authorId=${userId}&limit=1000&page=1`);
      if (!res.ok) throw new Error("Failed to fetch user posts");
      const data = await res.json();
      return Array.isArray(data) ? data : data.topics ?? [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, 
  });

  const setPosts = (newPosts: Topic[]) => {
    queryClient.setQueryData(['user-posts', userId], newPosts);
  };

  return {
    posts: data ?? [],
    loading: isLoading,
    postsCount: data ? data.length : 0,
    setPosts,
    refresh: refetch,
  };
}