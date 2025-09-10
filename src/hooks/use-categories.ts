import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Category } from "../types/category";

interface PaginatedCategoriesData {
  categories: Category[];
  pagination: {
    total: number;
    hasMore: boolean;
  };
}

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

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: {
      name: string;
      icon: string;
      color: string;
      description: string;
      owner_id: string;
    }) => {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create category");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    categories: data ?? [],
    loading: isLoading,
    setCategories,
    refreshCategories,
    createCategory: createCategoryMutation.mutateAsync,
    creating: createCategoryMutation.isPending,
    createError: createCategoryMutation.error ? (createCategoryMutation.error as Error).message : null,
  };
}

export function usePaginatedCategories(page: number, limit: number) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['categories-paginated', page, limit],
    queryFn: async (): Promise<PaginatedCategoriesData> => {
      const res = await fetch(`/api/category?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      return {
        categories: Array.isArray(data) ? data : data.categories || [],
        pagination: data.pagination || { total: 0, hasMore: false },
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const setCategories = (newCategories: Category[]) => {
    queryClient.setQueryData(['categories-paginated', page, limit], (old: PaginatedCategoriesData | undefined) => ({
      ...old,
      categories: newCategories,
    }));
  };

  const refreshCategories = () => {
    refetch();
  };

  return {
    categories: data?.categories ?? [],
    pagination: data?.pagination ?? { total: 0, hasMore: false },
    loading: isLoading,
    setCategories,
    refreshCategories,
  };
}