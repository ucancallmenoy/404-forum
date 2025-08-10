import { useEffect, useState } from "react";
import { Category } from "../types/category";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/category");
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refreshCategories = () => {
    fetchCategories();
  };

  return { categories, loading, setCategories, refreshCategories };
}