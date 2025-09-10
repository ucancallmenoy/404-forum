import { useEffect, useState, useMemo } from "react";
import { CategoryTopicListProps } from "@/types/category";
import TopicItem from "@/components/topic/topic-item";
import { useUserCache } from "@/contexts/user-cache-context";

export default function CategoryTopicList({ topics, currentUserId }: CategoryTopicListProps) {
  const safeTopics = useMemo(() => Array.isArray(topics) ? topics : [], [topics]);
  const { fetchAndCacheUser } = useUserCache();
  const [authorsLoaded, setAuthorsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const uniqueAuthorIds = [...new Set(safeTopics.map(t => t.author_id))];
    Promise.all(uniqueAuthorIds.map(id => fetchAndCacheUser(id))).then(() => {
      if (isMounted) setAuthorsLoaded(true);
    });
    return () => { isMounted = false; };
  }, [safeTopics, fetchAndCacheUser]);

  if (!authorsLoaded && safeTopics.length > 0) {
    return (
      <div className="bg-white rounded border border-gray-300 p-8 text-center">
        <div className="text-gray-500 text-lg mb-2">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {safeTopics.length === 0 ? (
        <div className="bg-white rounded border border-gray-300 p-8 text-center">
          <div className="text-gray-500 text-lg mb-2">No posts yet</div>
          <div className="text-gray-400 text-sm">Be the first to start a discussion!</div>
        </div>
      ) : (
        safeTopics.map(topic => (
          <TopicItem
            key={topic.id}
            topic={topic}
            currentUserId={currentUserId}
          />
        ))
      )}
    </div>
  );
}