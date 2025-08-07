"use client";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ForumHeader from "@/components/dashboard/header";
import ForumNavigation from "@/components/dashboard/navigation";
import ForumSidebar from "@/components/dashboard/sidebar";
import CategoryGrid from "@/components/dashboard/category";
import TopicList from "@/components/dashboard/recent-topic";
import { useCategories } from "@/hooks/use-categories";
import { useTopics } from "@/hooks/use-topics";
import { useCreateTopic } from "@/hooks/use-create-topic";
import ForumCreateTopicModal from "@/components/dashboard/create-topic";

export default function ForumDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { categories, loading: loadingCategories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const { topics, loading: loadingTopics } = useTopics(selectedCategoryId);
  const { createTopic } = useCreateTopic();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('All Topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [reloadTopics, setReloadTopics] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || loadingCategories || loadingTopics) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  if (!user) return null;

  const handleCreateTopic = () => setShowModal(true);

  const handleSubmitTopic = async (form: {
    title: string;
    content: string;
    category_id: string;
    is_hot?: boolean;
    is_question?: boolean;
  }) => {
    const ok = await createTopic({
      ...form,
      author_id: user.id,
    });
    if (ok) {
      setShowModal(false);
    }
  };

  const handleSubscribe = () => {
    alert("Subscribed!");
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleAuthorClick = (authorId: string) => {
  router.push(`/profile?id=${authorId}`);
};

  const handleRefresh = () => {
  setReloadTopics(r => !r);
};

  const handleViewAllTopics = () => {
    setSelectedCategoryId(undefined);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <ForumHeader 
          onCreateTopic={handleCreateTopic}
          onSubscribe={handleSubscribe}
        />
        <ForumNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <div className="flex">
          <ForumSidebar 
            categories={categories}
            onCategoryClick={handleCategoryClick}
          />
          <main className="flex-1 px-4 py-6">
            <CategoryGrid 
              categories={categories}
              onCategoryClick={handleCategoryClick}
            />
            <TopicList
              topics={topics}
              onAuthorClick={handleAuthorClick}
              onRefresh={handleRefresh}
              onViewAllTopics={handleViewAllTopics}
            />
          </main>
        </div>
      </div>
      {showModal && (
        <ForumCreateTopicModal
          categories={categories}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitTopic}
        />
      )}
    </>
  );
}