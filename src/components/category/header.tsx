import { CategoryHeaderProps } from "@/types/category";
import { useCreateTopic } from "@/hooks/use-create-topic";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import ForumCreateTopicModal from "@/components/dashboard/create-topic";

export default function CategoryHeader({ category, onTopicCreated }: CategoryHeaderProps & { onTopicCreated?: () => void }) {
  const { createTopic, loading } = useCreateTopic();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleCreateTopic = () => {
    if (!user) {
      setError("You must be logged in to create a topic.");
      return;
    }
    setShowModal(true);
  };

  const handleSubmit = async ({
    title,
    content,
    category_id,
    is_hot,
    is_question,
  }: {
    title: string;
    content: string;
    category_id: string;
    is_hot?: boolean;
    is_question?: boolean;
  }) => {
    setError(null);
    setSuccess(false);
    if (!user) {
      setError("You must be logged in to create a topic.");
      return;
    }
    const ok = await createTopic({
      title,
      content,
      category_id,
      author_id: user.id,
      is_hot,
      is_question,
    });
    if (ok) {
      setSuccess(true);
      setShowModal(false);
      if (onTopicCreated) onTopicCreated();
    } else {
      setError("Failed to create topic.");
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <span
        className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl font-bold shadow-sm border"
        style={{
          background: category.color?.startsWith("#") ? category.color : undefined,
          color: category.color?.startsWith("#") ? "#fff" : undefined,
          borderColor: category.color?.startsWith("#") ? category.color : "#e5e7eb",
        }}
      >
        {category.icon}
      </span>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
        <p className="text-gray-600">{category.description}</p>
        <button
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          onClick={handleCreateTopic}
          disabled={loading}
        >
          + Create Topic
        </button>
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
        {success && <div className="text-green-500 text-xs mt-1">Topic created!</div>}
      </div>
      {showModal && (
        <ForumCreateTopicModal
          categories={[{ id: category.id, name: category.name }]}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}