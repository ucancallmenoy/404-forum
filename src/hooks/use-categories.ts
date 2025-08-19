import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Category } from "../types/category";

export function useCategories() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch("/api/category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      return Array.isArray(data) ? data : data.categories || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const setCategories = (newCategories: Category[]) => {
    queryClient.setQueryData(['categories'], newCategories);
  };

  const refreshCategories = () => {
    refetch();
  };

  return {
    categories: data ?? [],
    loading: isLoading,
    setCategories,
    refreshCategories,
  };
}