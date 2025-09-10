import { useQuery } from '@tanstack/react-query';

export function useFollowers(userId?: string) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      if (!userId) return { count: 0 };
      const res = await fetch(`/api/following?userId=${userId}&followers=true`);
      if (!res.ok) throw new Error("Failed to fetch followers");
      return await res.json();
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    followersCount: data?.count || 0,
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}