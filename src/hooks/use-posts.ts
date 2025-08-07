import { useEffect, useState } from "react";
import { Post } from "../types/post";

export function usePosts(topicId: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topicId) return;
    const fetchPosts = async () => {
      const res = await fetch(`/api/post?topicId=${topicId}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [topicId]);

  return { posts, loading, setPosts };
}