import { useState } from "react";
import { SearchResult, PaginationState } from "@/types/search";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [topics, setTopics] = useState<SearchResult[]>([]);
  const [users, setUsers] = useState<SearchResult[]>([]);
  const [categories, setCategories] = useState<SearchResult[]>([]);
  const [topicsPagination, setTopicsPagination] = useState<PaginationState>({ page: 1, total: 0, hasMore: false });
  const [usersPagination, setUsersPagination] = useState<PaginationState>({ page: 1, total: 0, hasMore: false });
  const [categoriesPagination, setCategoriesPagination] = useState<PaginationState>({ page: 1, total: 0, hasMore: false });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResults = async (searchQuery: string, type: string, page: number) => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${type}&page=${page}&limit=10`);
    if (res.ok) {
      const data = await res.json();
      return { results: data.results, pagination: data.pagination };
    }
    return { results: [], pagination: { page: 1, total: 0, hasMore: false } };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const [topicsData, usersData, categoriesData] = await Promise.all([
        fetchResults(query.trim(), "topics", 1),
        fetchResults(query.trim(), "users", 1),
        fetchResults(query.trim(), "categories", 1),
      ]);

      setTopics(topicsData.results);
      setTopicsPagination(topicsData.pagination);
      setUsers(usersData.results);
      setUsersPagination(usersData.pagination);
      setCategories(categoriesData.results);
      setCategoriesPagination(categoriesData.pagination);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (type: string, newPage: number) => {
    const { results, pagination } = await fetchResults(query, type, newPage);
    if (type === "topics") {
      setTopics(results);
      setTopicsPagination(pagination);
    } else if (type === "users") {
      setUsers(results);
      setUsersPagination(pagination);
    } else if (type === "categories") {
      setCategories(results);
      setCategoriesPagination(pagination);
    }
  };

  const handleClear = () => {
    setQuery("");
    setTopics([]);
    setUsers([]);
    setCategories([]);
    setTopicsPagination({ page: 1, total: 0, hasMore: false });
    setUsersPagination({ page: 1, total: 0, hasMore: false });
    setCategoriesPagination({ page: 1, total: 0, hasMore: false });
    setHasSearched(false);
  };

  const hasResults = hasSearched && (topics.length > 0 || users.length > 0 || categories.length > 0);
  const hasNoResults = hasSearched && !loading && topics.length === 0 && users.length === 0 && categories.length === 0;

  return {
    query,
    setQuery,
    topics,
    users,
    categories,
    topicsPagination,
    usersPagination,
    categoriesPagination,
    loading,
    hasSearched,
    handleSearch,
    handlePageChange,
    handleClear,
    hasResults,
    hasNoResults,
  };
}