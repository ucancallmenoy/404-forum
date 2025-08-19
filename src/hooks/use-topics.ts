import { useInfiniteQuery } from '@tanstack/react-query';
import { Topic } from "../types/topic";
import { useUserCache } from "@/contexts/user-cache-context";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
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