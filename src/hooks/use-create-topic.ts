import { useState } from "react";

export function useCreateTopic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTopic = async ({
    title,
    content,
    author_id,
    category_id,
    is_hot = false,
    is_question = false,
  }: {
    title: string;
    content: string;
    author_id: string;
    category_id: string;
    is_hot?: boolean;
    is_question?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/topic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, author_id, category_id, is_hot, is_question }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create topic");
    }
    return res.ok;
  };

  return { createTopic, loading, error };
}