import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserProfile } from "../types/users";

export function useUserProfile(userId?: string) {
  const queryClient = useQueryClient();
  const {
    data: profile,
    isLoading: loading,
    error,
    refetch: refreshProfile,
  } = useQuery<UserProfile | null>({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await fetch(`/api/users?id=${userId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch profile");
      }
      return await res.json();
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!userId) throw new Error("No user ID available");
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, ...updates }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update profile");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-profile", userId], data);
    },
  });

  const uploadPictureMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error("No user ID available");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const res = await fetch("/api/users/profile-picture", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to upload profile picture");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-profile", userId], (old: UserProfile | null) =>
        old ? { ...old, profile_picture: data.profile_picture } : old
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: async (profileData: Omit<UserProfile, "id" | "created_at" | "updated_at">) => {
      if (!userId) throw new Error("No user ID available");
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, ...profileData }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create profile");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-profile", userId], data);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      if (!userId) throw new Error("No user ID available");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to change password");
      }
      return await res.json();
    },
  });

  return {
    profile,
    loading,
    error: error ? (error as Error).message : null,
    updateProfile: updateMutation.mutateAsync,
    uploadProfilePicture: uploadPictureMutation.mutateAsync,
    createProfile: createMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    refreshProfile,
    updating: updateMutation.isPending,
    uploading: uploadPictureMutation.isPending,
    creating: createMutation.isPending,
    changingPassword: changePasswordMutation.isPending,
  };
}