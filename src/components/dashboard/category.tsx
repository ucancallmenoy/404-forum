"use client";
import { CategoryGridProps } from "@/types/category";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import CreateCategoryModal from "./create-category";
import { Plus } from "lucide-react";

const PAGE_LIMIT = 9;

export default function CategoryGrid({
  categories: initialCategories = [],
  limit,
  onCategoryCreated,
}: CategoryGridProps & {
  limit?: number;
  onCategoryCreated?: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Pagination state for "All Categories" (no limit)
  const [categories, setCategories] = useState(initialCategories);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch paginated categories only if not limited (All Categories view)
  useEffect(() => {
    if (limit) return;
    const fetchCategories = async () => {
      setLoading(true);
      const res = await fetch(`/api/category?page=${page}&limit=${PAGE_LIMIT}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setTotal(data.pagination?.total || 0);
      }
      setLoading(false);
    };
    fetchCategories();
  }, [page, onCategoryCreated, limit]);

  // For dashboard homepage: randomize and limit to 6, no pagination
  const displayCategories = limit
    ? [...initialCategories].sort(() => 0.5 - Math.random()).slice(0, limit)
    : categories;

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/category?id=${categoryId}`);
  };

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  if (!displayCategories.length && !loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Categories</h2>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus size={16} />
              Create Category
            </button>
          )}
        </div>
        <div className="text-center text-gray-400 italic bg-white rounded-lg border border-gray-200 p-8">
          <span className="inline-flex items-center gap-2">
            <svg width="20" height="20" fill="none" className="inline-block text-gray-300">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
            </svg>
            No categories found. {user && "Create the first one!"}
          </span>
        </div>
        {showCreateModal && (
          <CreateCategoryModal
            onCreated={() => {
              setShowCreateModal(false);
              if (onCategoryCreated) onCategoryCreated();
            }}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mb-8">
      {!limit && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">All Categories</h2>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus size={16} />
              Create Category
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: limit || PAGE_LIMIT }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
            ))
          : displayCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 text-left relative overflow-hidden"
                onClick={() => handleCategoryClick(category.id)}
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

      {/* Pagination Controls (only for all categories, not limited/randomized) */}
      {!limit && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </button>
          <span className="self-center text-gray-600">
            Page {page} of {totalPages || 1}
          </span>
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Next
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateCategoryModal
          onCreated={() => {
            setShowCreateModal(false);
            if (onCategoryCreated) onCategoryCreated();
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}