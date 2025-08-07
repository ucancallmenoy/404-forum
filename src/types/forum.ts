import { Category } from "@/types/category";

export interface ForumHeaderProps {
  onCreateTopic?: () => void;
  onSubscribe?: () => void;
}

export interface ForumNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  categories: Category[];
  selectedCategoryId: string | undefined;
  setSelectedCategoryId: (categoryId: string | undefined) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export interface ForumSidebarProps {
  categories: Category[];
}