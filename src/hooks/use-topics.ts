import { useInfiniteQuery, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Topic } from "../types/topic";
import { useUserCache } from "@/contexts/user-cache-context";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface InfiniteTopicsData {
  pages: Array<{
    topics: Topic[];
    pagination: PaginationInfo;
  }>;
  pageParams: unknown[];
}

export function useTopics(categoryId?: string, authorId?: string) {
  const { getUsers } = useUserCache();

  const fetchTopics = async ({ pageParam = 1 }) => {
    let url = `/api/topic?page=${pageParam}&limit=5`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    if (authorId) url += `&authorId=${authorId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch topics');
    const data = await res.json();
    const topicsArray: Topic[] = Array.isArray(data) ? data : (data.topics || []);
    const authorIds = [...new Set(topicsArray.map((t: Topic) => t.author_id))] as string[];
    if (authorIds.length > 0) {
      await getUsers(authorIds);
    }
    return {
      topics: topicsArray,
      pagination: data.pagination as PaginationInfo,
    };
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['topics', categoryId, authorId],
    queryFn: fetchTopics,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore
        ? lastPage.pagination.page + 1
        : undefined,
    initialPageParam: 1, 
    staleTime: 1000 * 60, 
  });

  const topics = data?.pages.flatMap(page => page.topics) ?? [];

  return {
    topics,
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    pagination: data?.pages[data.pages.length - 1]?.pagination ?? null,
    loadMore: fetchNextPage,
    hasNextPage,
    refresh: refetch,
    setTopics: () => {}, 
  };
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function useForYouTopics() {
  const queryClient = useQueryClient();
  const { fetchAndCacheUser } = useUserCache();

  const fetchTopics = async ({ pageParam = 2 }) => {
    const res = await fetch(`/api/topic?page=${pageParam}&limit=5`);
    if (!res.ok) throw new Error('Failed to fetch topics');
    const data = await res.json();
    const newTopics: Topic[] = Array.isArray(data) ? data : data.topics || [];
    // Prefetch authors
    const uniqueAuthorIds = [...new Set(newTopics.map(t => t.author_id))];
    uniqueAuthorIds.forEach(id => fetchAndCacheUser(id));
    return {
      topics: shuffleArray(newTopics),
      pagination: data.pagination as PaginationInfo,
    };
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['for-you-topics'],
    queryFn: fetchTopics,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore
        ? lastPage.pagination.page + 1
        : undefined,
    initialPageParam: 2, 
    staleTime: 1000 * 60, 
  });

  const topics = data?.pages.flatMap(page => page.topics) ?? [];

  const setTopics = (newTopics: Topic[]) => {
    queryClient.setQueryData(['for-you-topics'], (old: InfiniteTopicsData | undefined) => ({
      ...old,
      pages: [{ topics: newTopics, pagination: old?.pages[0]?.pagination }],
    }));
  };

  const refresh = () => {
    refetch();
  };

  return {
    topics,
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    loadMore: fetchNextPage,
    hasMore: hasNextPage,
    setTopics,
    refresh,
  };
}

export function useTopic(topicId?: string) {
  const queryClient = useQueryClient();

  const {
    data: topic,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['topic', topicId],
    queryFn: async () => {
      if (!topicId) return null;
      const res = await fetch(`/api/topic?page=1&limit=100`);
      if (!res.ok) throw new Error('Failed to fetch topic');
      const data = await res.json();
      const topics = Array.isArray(data) ? data : data.topics ?? [];
      const foundTopic = topics.find((t: Topic) => t.id === topicId);
      if (!foundTopic) throw new Error('Topic not found');
      return foundTopic;
    },
    enabled: !!topicId,
    staleTime: 1000 * 60 * 5,
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (topicId: string) => {
      const res = await fetch("/api/topic", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete topic");
      }
      return topicId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async ({ topicId, userId }: { topicId: string; userId: string }) => {
      const res = await fetch("/api/topic", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_like",
          topicId,
          userId,
        }),
      });
      if (!res.ok) throw new Error('Failed to toggle like');
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['topic', topicId], (old: Topic | null) =>
        old ? { ...old, likes: data.likesCount } : old
      );
    },
  });

  return {
    topic,
    loading,
    error: error ? (error as Error).message : null,
    refresh: refetch,
    deleteTopic: deleteTopicMutation.mutateAsync,
    deleting: deleteTopicMutation.isPending,
    toggleLike: toggleLikeMutation.mutateAsync,
    liking: toggleLikeMutation.isPending,
  };
}