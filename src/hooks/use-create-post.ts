import { useState } from "react";

export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async ({
    topic_id,
    author_id,
    content,
  }: {
    topic_id: string;
    author_id: string;
    content: string;
  }) => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic_id, author_id, content }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create post");
    }
    return res.ok;
  };

  return { createPost, loading, error };
}