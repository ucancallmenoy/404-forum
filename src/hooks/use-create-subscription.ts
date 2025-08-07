import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function useCreateSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubscription = async ({
    user_id,
    topic_id,
    category_id,
  }: {
    user_id: string;
    topic_id?: string;
    category_id?: string;
  }) => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("subscriptions").insert([
      { user_id, topic_id: topic_id ?? null, category_id: category_id ?? null },
    ]);
    setLoading(false);
    if (error) setError(error.message);
    return !error;
  };

  return { createSubscription, loading, error };
}