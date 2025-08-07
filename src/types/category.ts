import { Topic } from "@/types/topic";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  owner_id: string;
  description: string;
  created_at: string;
}

export interface CategoryHeaderProps {
  category: Category;
}

export interface CategoryTopicListProps {
  topics: Topic[];
  currentUserId?: string;
}

export interface CategoryGridProps {
  categories: Category[];
}

export interface CreateCategoryModalProps {
  onCreated?: () => void;
  onClose?: () => void;
}

