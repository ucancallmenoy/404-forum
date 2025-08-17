"use client";
import TopicItem from '@/components/topic/topic-item';
import { useEffect, useState, useRef, useCallback } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import { TopicListProps, Topic } from '@/types/topic';

interface ExtendedTopicListProps extends Omit<TopicListProps, 'topics'> {
  topics: Topic[];
  currentUserId?: string;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const PAGE_LIMIT = 10;

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ForYouList({ 
  topics: initialTopics, 
  onTopicClick, 
  onAuthorClick, 
  onRefresh, 
  title = "Topics For You",
  currentUserId,
}: ExtendedTopicListProps) {
  const [localTopics, setLocalTopics] = useState<Topic[]>(() => shuffleArray(initialTopics));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Reset when initial topics change (e.g. new search/filter)
  useEffect(() => {
    setLocalTopics(shuffleArray(initialTopics));
    setPage(1);
    setHasMore(true);
  }, [initialTopics]);

  const handleDeleted = useCallback((topicId: string) => {
    setLocalTopics(prev => prev.filter(t => t.id !== topicId));
  }, []);

  // Infinite scroll: observe the loadMoreRef
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);
    observerRef.current = observer;

    return () => {
      if (currentRef && observerRef.current) observerRef.current.unobserve(currentRef);
    };
    // eslint-disable-next-line
  }, [hasMore, loadingMore, localTopics]);

  // Load next page of topics
  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    // You can add filters/search params as needed
    const res = await fetch(`/api/topic?page=${nextPage}&limit=${PAGE_LIMIT}`);
    if (res.ok) {
      const data = await res.json();
      const newTopics: Topic[] = Array.isArray(data) ? data : data.topics || [];
      if (newTopics.length > 0) {
        // Avoid duplicates
        const allTopics = [...localTopics, ...newTopics.filter(t => !localTopics.some(lt => lt.id === t.id))];
        setLocalTopics(shuffleArray(allTopics));
        setPage(nextPage);
        setHasMore(data.pagination?.hasMore ?? newTopics.length === PAGE_LIMIT);
      } else {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 mt-6">
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
                key={`${topic.id}-foryou-${index}`}
                topic={topic}
                onTopicClick={onTopicClick}
                onAuthorClick={onAuthorClick}
                currentUserId={currentUserId}
                onDeleted={handleDeleted}
              />
            ))}
            {/* Infinite scroll trigger */}
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
                  <span className="text-sm text-gray-500">Scroll down to load more...</span>
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