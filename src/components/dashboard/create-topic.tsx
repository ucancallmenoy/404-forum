"use client";
import { useEffect, useState } from "react";
import { CreateTopicModalProps } from "@/types/topic";

export default function ForumCreateTopicModal({
  categories,
  onClose,
  onSubmit,
}: CreateTopicModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [isHot, setIsHot] = useState(false);
  const [isQuestion, setIsQuestion] = useState(false);

  useEffect(() => {
    if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories]);

  const isReady = categories.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Create New Topic</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!isReady) return;
            onSubmit({ title, content, category_id: categoryId, is_hot: isHot, is_question: isQuestion });
          }}
          className="flex flex-col gap-4"
        >
          <input
            className="border rounded p-2"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            disabled={!isReady}
          />
          <textarea
            className="border rounded p-2"
            placeholder="Content"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            required
            disabled={!isReady}
          />
          <select
            className="border rounded p-2"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            required
            disabled={!isReady}
          >
            {categories.length === 0 ? (
              <option value="">Loading categories...</option>
            ) : (
              categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))
            )}
          </select>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isHot} onChange={e => setIsHot(e.target.checked)} disabled={!isReady} />
              Hot Topic
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isQuestion} onChange={e => setIsQuestion(e.target.checked)} disabled={!isReady} />
              Question
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={!isReady}>Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}