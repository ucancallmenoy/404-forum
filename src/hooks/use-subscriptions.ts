import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export interface Subscription {
  id: string;
  user_id: string;
  topic_id: string | null;
  category_id: string | null;
  created_at: string;
}

export function useSubscriptions(userId: string) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchSubscriptions = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) setSubscriptions(data);
      setLoading(false);
    };
    fetchSubscriptions();
  }, [userId]);

  return { subscriptions, loading, setSubscriptions };
}