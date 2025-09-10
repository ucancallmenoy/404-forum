import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile } from "../types/users";

type FollowParams = { followedUserId: string };  // Updated to only include followedUserId

export function useFollowing(userId?: string) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/following?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch following");
      return await res.json() as UserProfile[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const followMutation = useMutation({
    mutationFn: async ({ followedUserId }: FollowParams) => {
      const res = await fetch("/api/following", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followedUserId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to follow user");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', userId] });
      queryClient.refetchQueries({ queryKey: ['following', userId] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async ({ followedUserId }: FollowParams) => {
      const res = await fetch("/api/following", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followedUserId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to unfollow user");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', userId] });
      queryClient.refetchQueries({ queryKey: ['following', userId] });
    },
  });

  return {
    followedUsers: data ?? [],
    loading: isLoading,
    follow: followMutation.mutateAsync,
    unfollow: unfollowMutation.mutateAsync,
    following: followMutation.isPending,
    unfollowing: unfollowMutation.isPending,
    refresh: refetch,
  };
}