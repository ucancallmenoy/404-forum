"use client";
import TopicItem from '@/components/topic/topic-item';
import { RotateCcw } from 'lucide-react';
import { useSavedTopics } from '@/hooks/use-topics';
import { useAuth } from '@/contexts/auth-context';
import { Topic } from '@/types/topic'; 

export default function Saved({
  onTopicClick,
  onAuthorClick,
  onRefresh,
  title = "Saved Topics",
  currentUserId,
}: {
  onTopicClick?: (topicId: string) => void;
  onAuthorClick?: (authorId: string) => void;
  onRefresh?: () => void;
  title?: string;
  currentUserId?: string;
}) {
  const { user } = useAuth();
  const { savedTopics, loading, refresh } = useSavedTopics(user?.id);

  const handleDeleted = (_topicId: string) => { 
    void _topicId;
    refresh();
  };

  const handleRefresh = () => {
    refresh();
    if (onRefresh) onRefresh();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 mt-6">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {loading && savedTopics.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Loading saved topics...</div>
        ) : savedTopics.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No saved topics yet. Save some topics to see them here!
          </div>
        ) : (
          <>
            {savedTopics.map((topic: Topic) => (  
              <TopicItem
                key={topic.id}
                topic={topic}
                onTopicClick={onTopicClick}
                onAuthorClick={onAuthorClick}
                currentUserId={currentUserId}
                onDeleted={handleDeleted}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}