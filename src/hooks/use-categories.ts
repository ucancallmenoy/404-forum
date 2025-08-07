import { useEffect, useState } from "react";
import { Category } from "../types/category";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/category");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  return { categories, loading, setCategories };
}