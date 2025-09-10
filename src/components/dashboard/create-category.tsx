"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { CreateCategoryModalProps } from "@/types/category";
import { useCategories } from "@/hooks/use-categories";

export default function CreateCategoryModal({ onCreated, onClose }: CreateCategoryModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [description, setDescription] = useState("");
  const { user } = useAuth();
  const { createCategory, creating, createError } = useCategories();

  // Automatically generate icon from first letter of name
  const icon = name.charAt(0).toUpperCase();

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await createCategory({
        name,
        icon,
        color,
        description,
        owner_id: user.id,
      });
      if (onCreated) onCreated();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Category</h2>
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter category name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {/* Icon Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon Preview
            </label>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold border-2 shadow-sm"
                style={{
                  backgroundColor: color,
                  color: "#fff",
                  borderColor: color,
                }}
              >
                {icon || "?"}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  {icon ? `Icon will be "${icon}"` : "Enter a category name to see the icon"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex items-center gap-4">
              <input
                className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                title="Pick a color"
              />
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">{color}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Describe what this category is about"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {createError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{createError}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={creating || !name.trim()}
            >
              {creating ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}