import { useEffect, useState } from "react";
import { Topic } from "../types/topic";

export function useTopics(categoryId?: string) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      let url = "/api/topic";
      if (categoryId) url += `?categoryId=${categoryId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      }
      setLoading(false);
    };
    fetchTopics();
  }, [categoryId]);

  return { topics, loading, setTopics };
}