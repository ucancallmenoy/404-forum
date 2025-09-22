"use client";
import { useAuth } from "@/contexts/auth-context";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ForumNavigation from "@/components/dashboard/navigation";
import CategoryGrid from "@/components/dashboard/category";
import TopicList from "@/components/dashboard/recent-topic";
import { useCategories } from "@/hooks/use-categories";
import { useTopics } from "@/hooks/use-topics";
import { useCreateTopic } from "@/hooks/use-create-topic";
import ForumCreateTopicModal from "@/components/dashboard/create-topic";
import ForYouList from "@/components/dashboard/for-you";
import { useUserPosts } from "@/hooks/use-user-posts";
import Following from "@/components/dashboard/following";
import Saved from "@/components/dashboard/saved";

export default function ForumDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { categories, loading: loadingCategories, setCategories, refreshCategories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('All Topics');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    topics,
    loading: loadingTopics,
    loadingMore,
    loadMore,
    hasNextPage,
    refresh: refreshTopics,
  } = useTopics(selectedCategoryId);

  const { createTopic } = useCreateTopic();

  const { posts: userTopics } = useUserPosts(user?.id);

  const filteredTopics = useMemo(() =>
    topics.filter((topic: { title: string; content: string }) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [topics, searchQuery]
  );

  const filteredUserTopics = useMemo(() =>
    userTopics.filter((topic: { title: string; content: string }) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [userTopics, searchQuery]
  );

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
      refreshTopics();
    }
  };

  const handleAuthorClick = (authorId: string) => {
    router.push(`/profile?id=${authorId}`);
  };

  const handleTopicClick = (topicId: string) => {
    router.push(`/topic?id=${topicId}`);
  };

  const handleRefresh = () => {
    refreshTopics();
  };

  const handleCategoryCreated = async () => {
    try {
      const res = await fetch("/api/category");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        window.dispatchEvent(new CustomEvent('categories-updated', { detail: data }));
        refreshCategories();
      }
    } catch (error) {
      console.error("Failed to refresh categories:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Categories':
        return (
          <CategoryGrid 
            categories={categories}
            onCategoryCreated={handleCategoryCreated}
          />
        );
      case 'Following':
        return <Following />;
      case 'My Topics':
        return (
          <TopicList
            topics={filteredUserTopics}
            onAuthorClick={handleAuthorClick}
            onRefresh={() => {}} // Refresh logic can be added if needed
            onViewAllTopics={handleViewAllTopics}
            currentUserId={user?.id}
            title="My Topics"
            maxItems={Infinity} // Show all user topics
          />
        );
      case 'Saved':
        return (
          <Saved
            onTopicClick={handleTopicClick}
            onAuthorClick={handleAuthorClick}
            onRefresh={handleRefresh}
            currentUserId={user?.id}
          />
        );
      default: // 'All Topics'
        return (
          <>
            <CategoryGrid 
              categories={categories}
              limit={6}
              onCategoryCreated={handleCategoryCreated}
            />
            <TopicList
              topics={filteredTopics}
              onAuthorClick={handleAuthorClick}
              onRefresh={handleRefresh}
              onViewAllTopics={handleViewAllTopics}
              currentUserId={user?.id}
              loadingMore={loadingMore}
              hasMore={hasNextPage}
              onLoadMore={loadMore}
            />
            <ForYouList
              onAuthorClick={handleAuthorClick}
              onRefresh={handleRefresh}
              currentUserId={user?.id}
            />
          </>
        );
    }
  };

  const handleViewAllTopics = () => {
    setSelectedCategoryId(undefined);
  };

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
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

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
            {loadingTopics && topics.length === 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              renderContent()
            )}
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