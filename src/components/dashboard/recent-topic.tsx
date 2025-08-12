"use client";
import TopicItem from '@/components/topic/topic-item';
import { useEffect, useState, useRef, useCallback } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import { TopicListProps, Topic } from '@/types/topic';

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
  hasMore = false,
  onLoadMore
}: ExtendedTopicListProps) {
  const [localTopics, setLocalTopics] = useState(topics);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setLocalTopics(topics);
  }, [topics]);

  const handleDeleted = useCallback((topicId: string) => {
    setLocalTopics(prev => prev.filter(t => t.id !== topicId));
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || !onLoadMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          onLoadMore();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    observerRef.current = observer;

    return () => {
      if (currentRef && observerRef.current) {
        observerRef.current.unobserve(currentRef);
      }
    };
  }, [hasMore, onLoadMore, loadingMore]);

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
            {localTopics.map((topic, index) => (
              <TopicItem
                key={`${topic.id}-${index}`}
                topic={topic}
                onTopicClick={onTopicClick}
                onAuthorClick={onAuthorClick}
                currentUserId={currentUserId}
                onDeleted={handleDeleted}
              />
            ))}
            
            {/* Load more trigger element */}
            {hasMore && (
              <div 
                ref={loadMoreRef}
                className="p-4 flex items-center justify-center"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading more topics...</span>
                  </div>
                ) : (
                  <button
                    onClick={onLoadMore}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Load more topics
                  </button>
                )}
              </div>
            )}
            
            {!hasMore && localTopics.length > 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                You have reached the end of the topics.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}