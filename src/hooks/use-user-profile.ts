import { useEffect, useState, useCallback } from "react";
import { UserProfile } from "../types/users";

export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users?id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to fetch profile");
        setProfile(null);
      }
    } catch {
      setError("Failed to fetch profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userId || !profile) throw new Error("No user ID or profile available");
    setError(null);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, ...updates }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        return data;
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to update profile");
        throw new Error(errData.error || "Failed to update profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      throw err;
    }
  }, [userId, profile]);

  const createProfile = useCallback(async (profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) throw new Error("No user ID available");
    setError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, ...profileData }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        return data;
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to create profile");
        throw new Error(errData.error || "Failed to create profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
      throw err;
    }
  }, [userId]);

  const refreshProfile = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    createProfile,
    refreshProfile,
  };
}