import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Topic } from "@/types/topic";
import { MessageCircle } from "lucide-react";
import { UserPostsProps } from "@/types/post";
import TopicItem from "@/components/topic/topic-item";
import { useAuth } from "@/contexts/auth-context";

interface ExtendedUserPostsProps extends UserPostsProps {
  onPostsCountChange?: (count: number) => void;
}

export default function UserPosts({ userId, onPostsCountChange }: ExtendedUserPostsProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/topic?authorId=${userId}&limit=1000&page=1`);
        if (res.ok) {
          const data = await res.json();
          const topicsArray = Array.isArray(data) ? data : data.topics ?? [];
          setTopics(topicsArray);
          if (onPostsCountChange) {
            onPostsCountChange(topicsArray.length);
          }
        }
      } catch (error) {
        console.error("Error fetching user topics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopics();
  }, [userId, onPostsCountChange]);

  // Call onPostsCountChange whenever topics change
  useEffect(() => {
    if (onPostsCountChange) {
      onPostsCountChange(topics.length);
    }
  }, [topics.length, onPostsCountChange]);

  const handleDeleted = (topicId: string) => {
    const newTopics = topics.filter(t => t.id !== topicId);
    setTopics(newTopics);
    // The useEffect above will handle calling onPostsCountChange
  };

  const handleAuthorClick = (authorId: string) => {
    router.push(`/profile?id=${authorId}`);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse border-b border-gray-100 pb-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
        <p className="text-gray-500">When this user creates posts, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {topics.map(topic => (
        <TopicItem
          key={topic.id}
          topic={topic}
          onAuthorClick={handleAuthorClick}
          currentUserId={user?.id}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}