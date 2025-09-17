import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Post } from "../types/post";
import { Topic } from "../types/topic";

export function useUserComments(userId?: string) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-comments', userId],
    queryFn: async () => {
      if (!userId) return { comments: [], topics: {} };
      const res = await fetch(`/api/post?authorId=${userId}&limit=1000&page=1`);
      if (!res.ok) throw new Error("Failed to fetch user comments");
      const data = await res.json();
      const rawComments = Array.isArray(data) ? data : data.posts ?? [];
      // Filter comments by author_id to ensure only the correct user's comments are shown
      const comments = rawComments.filter((comment: Post) => comment.author_id === userId);

      // Fetch topic details
      const topicIds = [...new Set(comments.map((comment: Post) => comment.topic_id))];
      const topicPromises = topicIds.map(id => fetch(`/api/topic?id=${id}`).then(r => r.ok ? r.json() : null));
      const topicData = await Promise.all(topicPromises);
      const topics = topicData.reduce((acc, topic) => {
        if (topic) acc[topic.id] = topic;
        return acc;
      }, {} as Record<string, Topic>);

      return { comments, topics };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, 
  });

  const setComments = (newData: { comments: Post[], topics: Record<string, Topic> }) => {
    queryClient.setQueryData(['user-comments', userId], newData);
  };

  return {
    comments: data?.comments ?? [],
    topics: data?.topics ?? {},
    loading: isLoading,
    error,
    commentsCount: data?.comments ? data.comments.length : 0,
    setComments,
    refresh: refetch,
  };
}