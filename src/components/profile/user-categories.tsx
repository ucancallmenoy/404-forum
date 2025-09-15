import { useRouter } from "next/navigation";
import { Category } from "@/types/category";
import { FolderOpen } from "lucide-react";

interface UserCategoriesProps {
  categories: Category[];
}

export default function UserCategories({ categories }: UserCategoriesProps) {
  const router = useRouter();

  if (categories.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
        <p>When this user creates categories, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-4">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => router.push(`/category?id=${category.id}`)}
            className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left group cursor-pointer"
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold text-white shadow-sm"
              style={{ backgroundColor: category.color }}
            >
              {category.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {category.description}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Created {new Date(category.created_at).toLocaleDateString()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}