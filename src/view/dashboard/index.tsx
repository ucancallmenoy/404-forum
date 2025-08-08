"use client";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ForumNavigation from "@/components/dashboard/navigation";
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

  // Loading components
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const LoadingCard = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );

  // Show initial loading screen when essential data is loading
  if (loading || loadingCategories) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex">
          <main className="flex-1 px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3, 4, 5].map(i => (
                <LoadingCard key={i} />
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <LoadingCard key={i} />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleSubmitTopic = async (form: {
    title: string;
    content: string;
    category_id: string;
    is_hot?: boolean;
    is_question?: boolean;
  }) => {
    if (!user) return;
    
    const ok = await createTopic({
      ...form,
      author_id: user.id,
    });
    if (ok) {
      setShowModal(false);
    }
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

  // Filter topics based on search query
  const filteredTopics = topics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render content based on active tab
  const renderContent = () => {
    // Show loading state for topics when switching categories or tabs
    if (loadingTopics) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <LoadingCard key={i} />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'Categories':
        return (
          <CategoryGrid 
            categories={categories}
          />
        );
      case 'Following':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Following feature coming soon!</p>
          </div>
        );
      case 'My Topics':
        const userTopics = user 
          ? filteredTopics.filter(topic => topic.author_id === user.id)
          : [];
        return (
          <TopicList
            topics={userTopics}
            onAuthorClick={handleAuthorClick}
            onRefresh={handleRefresh}
            onViewAllTopics={handleViewAllTopics}
            currentUserId={user?.id}
            title="My Topics"
          />
        );
      default: // 'All Topics'
        return (
          <>
            <CategoryGrid 
              categories={categories}
              limit={5}
            />
            <TopicList
              topics={filteredTopics}
              onAuthorClick={handleAuthorClick}
              onRefresh={handleRefresh}
              onViewAllTopics={handleViewAllTopics}
              currentUserId={user?.id}
            />
          </>
        );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
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
          <main className="flex-1 px-4 py-6">
            {renderContent()}
          </main>
        </div>
      </div>
      {showModal && user && (
        <ForumCreateTopicModal
          categories={categories}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitTopic}
        />
      )}
    </>
  );
}