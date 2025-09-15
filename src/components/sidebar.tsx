"use client";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { ForumSidebarProps } from "@/types/forum";

export default function ForumSidebar({ categories }: ForumSidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const safeCategories = Array.isArray(categories) ? categories : [];
  const userCategories = user
    ? safeCategories.filter(category => category.owner_id === user.id)
    : [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6 min-h-screen">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Your Categories</h3>
        <div className="space-y-3">
          {userCategories.length === 0 ? (
            <div className="text-gray-400 italic">No categories found.</div>
          ) : (
            userCategories.map(category => (
              <button
                key={category.id}
                type="button"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition group w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                onClick={() => {
                  router.push(`/category?id=${category.id}`);
                }}
                aria-label={`View category ${category.name}`}
              >
                <span
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl font-bold shadow-sm border transition"
                  style={{
                    background: category.color?.startsWith("#") ? category.color : undefined,
                    color: category.color?.startsWith("#") ? "#fff" : undefined,
                    borderColor: category.color?.startsWith("#") ? category.color : "#e5e7eb",
                  }}
                >
                  {category.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-base text-gray-900 group-hover:text-blue-700 transition">
                    {category.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{category.description}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}