"use client";
import { CategoryGridProps } from "@/types/category";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import CreateCategoryModal from "./create-category";
import { Plus } from "lucide-react";

export default function CategoryGrid({ 
  categories, 
  limit, 
  onCategoryCreated 
}: CategoryGridProps & { 
  limit?: number; 
  onCategoryCreated?: () => void; 
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!categories.length) {
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

  // Apply limit and randomize if specified
  const displayCategories = limit 
    ? [...categories].sort(() => 0.5 - Math.random()).slice(0, limit)
    : categories;

  const handleCategoryClick = (categoryId: string) => {
    // Always navigate to category page
    router.push(`/category?id=${categoryId}`);
  };

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
        {displayCategories.map(category => (
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