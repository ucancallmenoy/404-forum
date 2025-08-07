"use client";
import TopicItem from '@/components/topic/topic-item';
import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { TopicListProps } from '@/types/topic';

export default function TopicList({ 
  topics, 
  onTopicClick, 
  onAuthorClick, 
  onRefresh, 
  title = "Recent Topics",
  currentUserId 
}: TopicListProps) {
  const [localTopics, setLocalTopics] = useState(topics);

  useEffect(() => {
    setLocalTopics(topics);
  }, [topics]);

  const handleDeleted = (topicId: string) => {
    setLocalTopics(localTopics.filter(t => t.id !== topicId));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
            onClick={onRefresh}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {localTopics.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No topics found. Be the first to start a discussion!
          </div>
        ) : (
          localTopics.map(topic => (
            <TopicItem
              key={topic.id}
              topic={topic}
              onTopicClick={onTopicClick}
              onAuthorClick={onAuthorClick}
              currentUserId={currentUserId}
              onDeleted={handleDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}