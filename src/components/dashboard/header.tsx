"use client";
import { Plus, FolderPlus } from 'lucide-react';
import { useState } from "react";
import CreateCategoryModal from "./create-category";
import { ForumHeaderProps } from "@/types/forum";

export default function ForumHeader({ onCreateTopic, onSubscribe }: ForumHeaderProps) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forum</h1>
          <p className="text-sm text-gray-600">Join discussions with other developers</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="px-3 py-1 text-sm text-gray-600 hover:text-blue-600"
            onClick={onSubscribe}
          >
            Subscribe
          </button>
          <button 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
            onClick={onCreateTopic}
          >
            <Plus size={16} />
            Create Topic
          </button>
          <button
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer"
            onClick={() => setShowCategoryModal(true)}
          >
            <FolderPlus size={16} />
            Create Category
          </button>
        </div>
      </div>
      {showCategoryModal && (
        <CreateCategoryModal
          onCreated={() => setShowCategoryModal(false)}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </header>
  );
}