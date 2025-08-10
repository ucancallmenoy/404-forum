"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { CreateCategoryModalProps } from "@/types/category";

export default function CreateCategoryModal({ onCreated, onClose }: CreateCategoryModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Automatically generate icon from first letter of name
  const icon = name.charAt(0).toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        icon,
        color,
        description,
        owner_id: user?.id,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create category");
    } else {
      if (onCreated) onCreated();
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Category</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold border-2"
                style={{
                  backgroundColor: color,
                  color: "#fff",
                  borderColor: color,
                }}
              >
                {icon || "?"}
              </div>
              <span className="text-sm text-gray-600">
                {icon ? `Icon will be "${icon}"` : "Enter a category name to see the icon"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                title="Pick a color"
              />
              <span className="text-sm text-gray-600">{color}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what this category is about"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !name.trim()}
            >
              {loading ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}