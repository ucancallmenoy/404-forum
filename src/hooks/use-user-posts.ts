import { useEffect, useState } from "react";
import { Topic } from "../types/topic";

export function useUserPosts(userId?: string) {
  const [posts, setPosts] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setPostsCount(0);
      return;
    }

    const fetchUserPosts = async () => {
      setLoading(true);
      try {
        // Fetch all posts by setting a high limit or using a different approach
        const res = await fetch(`/api/topic?authorId=${userId}&limit=1000&page=1`);
        if (res.ok) {
          const data = await res.json();
          // Handle both response formats
          const topics = Array.isArray(data) ? data : data.topics ?? [];
          setPosts(topics);
          setPostsCount(topics.length);
        }
      } catch (error) {
        console.error("Failed to fetch user posts:", error);
        setPostsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  return { posts, loading, postsCount };
}