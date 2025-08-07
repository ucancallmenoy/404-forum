"use client";
import { useSearchParams } from "next/navigation";
import { useCategories } from "@/hooks/use-categories";
import { useTopics } from "@/hooks/use-topics";
import { useAuth } from "@/contexts/auth-context";
import CategoryHeader from "@/components/category/header";
import CategoryTopicList from "@/components/category/topic-list";
import { useState, useEffect } from "react";

export default function CategoryPage() {
  const params = useSearchParams();
  const categoryId = params.get("id") || "";
  const { categories, loading: loadingCategories } = useCategories();
  const { topics, loading: loadingTopics, setTopics } = useTopics(categoryId);
  const { user } = useAuth();
  const [reloadFlag, setReloadFlag] = useState(false);

  const category = categories.find(c => c.id === categoryId);

  useEffect(() => {
    if (!categoryId) return;
    const fetchTopics = async () => {
      let url = "/api/topic";
      if (categoryId) url += `?categoryId=${categoryId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      }
    };
    fetchTopics();
  }, [reloadFlag, categoryId, setTopics]);

  const handleTopicCreated = () => {
    setReloadFlag(flag => !flag);
  };

  if (loadingCategories || loadingTopics) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!category) {
    return <div className="max-w-2xl mx-auto p-8 text-center text-gray-500">Category not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <CategoryHeader category={category} onTopicCreated={handleTopicCreated} />
      <CategoryTopicList topics={topics} currentUserId={user?.id} />
    </div>
  );
}