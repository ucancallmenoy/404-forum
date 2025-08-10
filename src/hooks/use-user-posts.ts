import { useEffect, useState } from "react";
import { Post } from "../types/topic"

export function useUserPosts(userId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/topic?authorId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
          setPostsCount(data.length);
        }
      } catch (error) {
        console.error("Failed to fetch user posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  return { posts, loading, postsCount };
}