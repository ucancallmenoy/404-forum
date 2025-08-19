import { useMutation } from '@tanstack/react-query';

export function useCreatePost() {
  const mutation = useMutation({
    mutationFn: async ({
      topic_id,
      author_id,
      content,
    }: {
      topic_id: string;
      author_id: string;
      content: string;
    }) => {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic_id, author_id, content }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post");
      }
      return true;
    },
  });

  return {
    createPost: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
    reset: mutation.reset,
  };
}