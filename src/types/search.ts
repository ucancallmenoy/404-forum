export interface SearchResult {
  id: string;
  title?: string;
  content?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_picture?: string;
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  author_id?: string;
  category_id?: string;
  likes?: number;
  created_at: string;
}

export interface PaginationState {
  page: number;
  total: number;
  hasMore: boolean;
}