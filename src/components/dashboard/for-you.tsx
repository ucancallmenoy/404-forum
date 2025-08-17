"use client";
import TopicItem from '@/components/topic/topic-item';
import { useEffect, useState, useRef, useCallback } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import { Topic } from '@/types/topic';
import { useUserCache } from "@/contexts/user-cache-context";

const PAGE_LIMIT = 5;

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ForYouList({
  onTopicClick, 
  onAuthorClick, 
  onRefresh, 
  title = "Topics For You",
  currentUserId,
}: {
  onTopicClick?: (topicId: string) => void;
  onAuthorClick?: (authorId: string) => void;
  onRefresh?: () => void;
  title?: string;
  currentUserId?: string;
}) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { fetchAndCacheUser } = useUserCache();

  const fetchTopics = useCallback(async (pageNum: number, append = false) => {
  if (loading || loadingMore) return;
  if (pageNum === 1) setLoading(true);
  else setLoadingMore(true);

  const res = await fetch(`/api/topic?page=${pageNum}&limit=${PAGE_LIMIT}`);
  if (res.ok) {
    const data = await res.json();
    const newTopics: Topic[] = Array.isArray(data) ? data : data.topics || [];
    // Prefetch authors
    const uniqueAuthorIds = [...new Set(newTopics.map(t => t.author_id))];
    uniqueAuthorIds.forEach(id => fetchAndCacheUser(id));
    setTopics(prev =>
      append
        ? [...prev, ...shuffleArray(newTopics.filter(t => !prev.some(pt => pt.id === t.id)))]
        : shuffleArray(newTopics)
    );
    setHasMore(data.pagination?.hasMore ?? newTopics.length === PAGE_LIMIT);
    setPage(pageNum);
  } else {
    setHasMore(false);
  }
  setLoading(false);
  setLoadingMore(false);
}, [loading, loadingMore, fetchAndCacheUser]);

  // Initial fetch
  useEffect(() => {
    fetchTopics(1, false);
    // eslint-disable-next-line
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          fetchTopics(page + 1, true);
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
  }, [hasMore, loadingMore, page, fetchTopics]);

  const handleDeleted = useCallback((topicId: string) => {
    setTopics(prev => prev.filter(t => t.id !== topicId));
  }, []);

  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    setTopics([]);
    fetchTopics(1, false);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 mt-6">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50"
            onClick={handleRefresh}
            disabled={loading || loadingMore}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {loading && topics.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Loading topics...</div>
        ) : topics.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No topics found. Be the first to start a discussion!
          </div>
        ) : (
          <>
            {topics.map((topic, index) => (
              <TopicItem
                key={`${topic.id}-foryou-${index}`}
                topic={topic}
                onTopicClick={onTopicClick}
                onAuthorClick={onAuthorClick}
                currentUserId={currentUserId}
                onDeleted={handleDeleted}
              />
            ))}
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
            {!hasMore && topics.length > 0 && (
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