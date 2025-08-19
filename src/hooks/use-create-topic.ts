import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateTopic() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
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
      const res = await fetch("/api/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author_id, category_id, is_hot, is_question }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create topic");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });

  return {
    createTopic: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
    reset: mutation.reset,
  };
}