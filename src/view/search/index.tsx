"use client";
import { useRouter } from "next/navigation";
import { Search, ArrowLeft, ChevronLeft, ChevronRight, Users, FileText, Grid3X3 } from "lucide-react";
import TopicItem from "@/components/topic/topic-item";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import { useSearch } from "@/hooks/use-search";
import { PaginationState } from "@/types/search";
import { Topic } from "@/types/topic";

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    query,
    setQuery,
    topics,
    users,
    categories,
    topicsPagination,
    usersPagination,
    categoriesPagination,
    loading,
    hasSearched,
    handleSearch,
    handlePageChange,
    handleClear,
    hasResults,
    hasNoResults,
  } = useSearch();

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const renderPagination = (pagination: PaginationState, type: string) => {
    if (pagination.total <= 10) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(type, pagination.page - 1)}
          disabled={pagination.page === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg">
          Page {pagination.page}
        </span>

        <button
          onClick={() => handlePageChange(type, pagination.page + 1)}
          disabled={!pagination.hasMore}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Search</h1>
            <p className="text-gray-600">Find topics, users, and categories</p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, users, categories..."
              className="w-full pl-10 pr-32 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* No Results */}
        {hasNoResults && (
          <div className="text-center py-12">
            <Search size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try different keywords.</p>
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <div className="space-y-8">
            {/* Categories Section */}
            {categories.length > 0 && (
              <section className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Grid3X3 size={20} className="text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                    {categories.length}
                  </span>
                </div>
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 text-left relative overflow-hidden"
                          onClick={() => router.push(`/category?id=${category.id}`)}
                          aria-label={`View category ${category.name}`}
                        >
                          <span
                            className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition"
                            style={{
                              background: category.color?.startsWith("#") ? category.color : undefined,
                            }}
                            aria-hidden="true"
                          />
                          <div className="flex items-start gap-4 relative z-10">
                            <div
                              className={`w-14 h-14 rounded-lg flex items-center justify-center text-3xl font-bold shadow-sm border`}
                              style={{
                                background: category.color?.startsWith("#") ? category.color : undefined,
                                color: category.color?.startsWith("#") ? "#fff" : undefined,
                                borderColor: category.color?.startsWith("#") ? category.color : "#e5e7eb",
                              }}
                            >
                              {category.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover: transition">
                                {category.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{category.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {renderPagination(categoriesPagination, "categories")}
                  </>
                )}
              </section>
            )}

            {/* Users Section */}
            {users.length > 0 && (
              <section className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users size={20} className="text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                    {users.length}
                  </span>
                </div>
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => router.push(`/profile?id=${user.id}`)}
                          className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          {user.profile_picture ? (
                            <Image
                              src={user.profile_picture}
                              alt={`${user.first_name} ${user.last_name}`}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              {user.first_name?.[0] || user.last_name?.[0] || "?"}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {renderPagination(usersPagination, "users")}
                  </>
                )}
              </section>
            )}

            {/* Topics Section */}
            {topics.length > 0 && (
                <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                    <FileText size={20} className="text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Topics</h2>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {topics.length}
                    </span>
                    </div>
                    {loading ? (
                    <LoadingSpinner />
                    ) : (
                    <>
                        <div className="space-y-4">
                        {topics.map((topic) => (
                            <TopicItem
                            key={topic.id}
                            topic={topic as Topic} 
                            onAuthorClick={(id) => router.push(`/profile?id=${id}`)}
                            currentUserId={user?.id}
                            />
                        ))}
                        </div>
                        {renderPagination(topicsPagination, "topics")}
                    </>
                    )}
                </section>
                )}
          </div>
        )}

        {/* Welcome Message */}
        {!hasSearched && !query && (
          <div className="text-center py-12">
            <Search size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-600">Enter a keyword to find topics, users, and categories.</p>
          </div>
        )}
      </div>
    </div>
  );
}