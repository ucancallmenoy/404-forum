"use client";
import TopicItem from '@/components/topic/topic-item';
import { useEffect, useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { TopicListProps, Topic } from '@/types/topic';
import { useUserCache } from "@/contexts/user-cache-context";

interface ExtendedTopicListProps extends Omit<TopicListProps, 'topics'> {
  topics: Topic[];
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export default function TopicList({ 
  topics, 
  onTopicClick, 
  onAuthorClick, 
  onRefresh, 
  title = "Recent Topics",
  currentUserId,
  loadingMore = false,
  // hasMore = false,
  // onLoadMore
}: ExtendedTopicListProps) {
  const [localTopics, setLocalTopics] = useState(topics);
  const { fetchAndCacheUser } = useUserCache();

  useEffect(() => {
    setLocalTopics(topics);
  }, [topics]);

  useEffect(() => {
    // Prefetch all unique authors
    const uniqueAuthorIds = [...new Set(topics.map(t => t.author_id))];
    uniqueAuthorIds.forEach(id => fetchAndCacheUser(id));
  }, [topics, fetchAndCacheUser]);

  const handleDeleted = useCallback((topicId: string) => {
    setLocalTopics(prev => prev.filter(t => t.id !== topicId));
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50"
            onClick={onRefresh}
            disabled={loadingMore}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {localTopics.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No topics found. Be the first to start a discussion!
          </div>
        ) : (
          <>
            {localTopics.slice(0, 5).map((topic, index) => (
              <TopicItem
                key={`${topic.id}-${index}`}
                topic={topic}
                onTopicClick={onTopicClick}
                onAuthorClick={onAuthorClick}
                currentUserId={currentUserId}
                onDeleted={handleDeleted}
              />
            ))}
            {/* No load more or infinite scroll */}
            <div className="p-4 text-center text-gray-500 text-sm">
              {localTopics.length > 0 && "You are all caught up"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}