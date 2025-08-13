import { CategoryTopicListProps } from "@/types/category";
import TopicItem from "@/components/topic/topic-item";

export default function CategoryTopicList({ topics, currentUserId }: CategoryTopicListProps) {
  const safeTopics = Array.isArray(topics) ? topics : [];

  return (
    <div className="space-y-2">
      {safeTopics.length === 0 ? (
        <div className="bg-white rounded border border-gray-300 p-8 text-center">
          <div className="text-gray-500 text-lg mb-2">No posts yet</div>
          <div className="text-gray-400 text-sm">Be the first to start a discussion!</div>
        </div>
      ) : (
        safeTopics.map(topic => (
          <TopicItem
            key={topic.id}
            topic={topic}
            currentUserId={currentUserId}
          />
        ))
      )}
    </div>
  );
}