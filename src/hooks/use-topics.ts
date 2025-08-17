import { useEffect, useState, useCallback } from "react";
import { Topic } from "../types/topic";
import { useUserCache } from "@/contexts/user-cache-context";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface UseTopicsReturn {
  topics: Topic[];
  loading: boolean;
  loadingMore: boolean;
  pagination: PaginationInfo | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setTopics: React.Dispatch<React.SetStateAction<Topic[]>>;
}

export function useTopics(categoryId?: string, authorId?: string): UseTopicsReturn {
  const [topics, setTopics] = useState<Topic[]>([]);  // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { getUsers } = useUserCache();

  const fetchTopics = useCallback(async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let url = `/api/topic?page=${page}&limit=5`;
      if (categoryId) url += `&categoryId=${categoryId}`;
      if (authorId) url += `&authorId=${authorId}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        // Ensure we always have an array
        const topicsArray = Array.isArray(data) ? data : (data.topics || []);
        
        // Batch fetch all author profiles
        const authorIds = [...new Set(topicsArray.map((t: Topic) => t.author_id))] as string[];
        if (authorIds.length > 0) {
          await getUsers(authorIds);
        }
        
        if (append && page > 1) {
          setTopics(prev => [...prev, ...topicsArray]);
        } else {
          setTopics(topicsArray);
        }
        
        setPagination(data.pagination || null);
        setCurrentPage(page);
      } else {
        console.error('Failed to fetch topics:', res.status);
        setTopics([]); // Set empty array on error
      }
    } catch (error) {
      console.error("Failed to fetch topics:", error);
      setTopics([]); // Set empty array on error
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categoryId, authorId, getUsers]);

  const loadMore = useCallback(async () => {
    if (pagination?.hasMore && !loadingMore && !loading) {
      await fetchTopics(currentPage + 1, true);
    }
  }, [pagination?.hasMore, loadingMore, loading, currentPage, fetchTopics]);

  const refresh = useCallback(async () => {
    setCurrentPage(1);
    await fetchTopics(1, false);
  }, [fetchTopics]);

  useEffect(() => {
    setCurrentPage(1);
    fetchTopics(1, false);
  }, [fetchTopics]);

  return { 
    topics, 
    loading, 
    loadingMore, 
    pagination, 
    loadMore, 
    refresh, 
    setTopics 
  };
}