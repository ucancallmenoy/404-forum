export interface Topic {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category_id: string;
  is_hot: boolean;
  is_question: boolean;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTopicModalProps {
  categories: { id: string; name: string }[];
  onClose: () => void;
  onSubmit: (form: { title: string; content: string; category_id: string; is_hot?: boolean; is_question?: boolean }) => void;
}

export interface TopicListProps {
  topics: Topic[];
  onTopicClick?: (topicId: string) => void;
  onAuthorClick?: (authorId: string) => void;
  onRefresh?: () => void;
  onViewAllTopics?: () => void;
  title?: string;
  currentUserId?: string;
}

export interface TopicItemProps {
  topic: Topic;
  onTopicClick?: (topicId: string) => void;
  onAuthorClick?: (authorId: string) => void;
  currentUserId?: string;
  onDeleted?: (topicId: string) => void;
}