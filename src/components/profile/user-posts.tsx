import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Topic } from "@/types/topic";
import { MessageCircle } from "lucide-react";
import { UserPostsProps } from "@/types/post";


export default function UserPosts({ userId }: UserPostsProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    const fetchTopics = async () => {
      const res = await fetch(`/api/topic?authorId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      }
      setLoading(false);
    };
    fetchTopics();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="text-gray-500">Loading posts...</span>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="text-center text-gray-400 italic py-8">
        No posts found for this user.
      </div>
    );
  }

  return (
    <section className="mt-0">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Posts</h3>
      <div className="flex flex-col gap-6">
        {topics.map(topic => (
          <div
            key={topic.id}
            className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-xl transition-shadow duration-200"
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-mono">
                  {new Date(topic.created_at).toLocaleString()}
                </span>
                {topic.updated_at && topic.updated_at !== topic.created_at && (
                  <span className="text-xs text-gray-400 italic">Edited</span>
                )}
              </div>
              <div
                className="text-xl font-bold text-gray-900 mb-1 hover:underline cursor-pointer transition"
                onClick={() => router.push(`/topic?id=${topic.id}`)}
                title="View full post"
              >
                {topic.title}
              </div>
              <div className="text-base text-gray-800 mb-2 leading-relaxed">
                {topic.content.length > 240
                  ? topic.content.slice(0, 240) + "..."
                  : topic.content}
              </div>
              <div className="flex items-center gap-6 mt-2">
                <button
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline font-semibold"
                  title="View full post"
                  onClick={() => router.push(`/topic?id=${topic.id}`)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Comments
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}