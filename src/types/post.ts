export interface Post {
  id: string;
  topic_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ForumCommentsProps {
  topicId: string;
  currentUserId: string;
}

export interface UserPostsProps {
  userId: string;
}