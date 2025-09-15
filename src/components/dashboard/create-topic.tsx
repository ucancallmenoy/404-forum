"use client";
import { useEffect, useState, useRef } from "react";
import { CreateTopicModalProps } from "@/types/topic";
import { useCategories } from "@/hooks/use-categories";
import { ChevronDown, Loader2 } from "lucide-react";
import { Category } from "@/types/category";

export default function ForumCreateTopicModal({
  categories: initialCategories,
  onClose,
  onSubmit,
}: CreateTopicModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id || "");
  const [isHot, setIsHot] = useState(false);
  const [isQuestion, setIsQuestion] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Fetch all categories (no pagination)
  const { categories, loading: categoriesLoading } = useCategories();
  
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCategory = categories.find((cat: Category) => cat.id === categoryId);
  const isReady = categories.length > 0;

  const handleCategorySelect = (id: string) => {
    setCategoryId(id);
    setIsDropdownOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Topic</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isReady) return;
            onSubmit({ title, content, category_id: categoryId, is_hot: isHot, is_question: isQuestion });
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter topic title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={!isReady}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Write your topic content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
              disabled={!isReady}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            {/* Custom Dropdown Trigger */}
            <div className="relative">
              <div
                ref={triggerRef}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white cursor-pointer flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setIsDropdownOpen(!isDropdownOpen);
                  }
                }}
              >
                {selectedCategory ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold border"
                      style={{
                        backgroundColor: selectedCategory.color,
                        color: "#fff",
                        borderColor: selectedCategory.color,
                      }}
                    >
                      {selectedCategory.icon}
                    </div>
                    <span className="text-gray-900">{selectedCategory.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">Select a category</span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </div>
              {/* Dropdown List */}
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  role="listbox"
                >
                  {categoriesLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Loading categories...
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No categories available</div>
                  ) : (
                    categories.map((category: Category) => (
                      <div
                        key={category.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => handleCategorySelect(category.id)}
                        role="option"
                        aria-selected={categoryId === category.id}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleCategorySelect(category.id);
                          }
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold border"
                          style={{
                            backgroundColor: category.color,
                            color: "#fff",
                            borderColor: category.color,
                          }}
                        >
                          {category.icon}
                        </div>
                        <span className="text-gray-900 text-sm">{category.name}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isHot}
                onChange={(e) => setIsHot(e.target.checked)}
                disabled={!isReady}
              />
              Hot Topic
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isQuestion}
                onChange={(e) => setIsQuestion(e.target.checked)}
                disabled={!isReady}
              />
              Question
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={!isReady}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}