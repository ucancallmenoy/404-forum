"use client";
import { Search } from 'lucide-react';
import { ForumNavigationProps } from '@/types/forum';

export default function ForumNavigation({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery
}: ForumNavigationProps) {
  const tabs = ['All Topics', 'Categories', 'Following', 'My Topics', 'Saved']; 


  return (
    <div className="bg-white border-b border-gray-200 px-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 cursor-pointer ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {/* Only show category filter when on "All Topics" or "My Topics" tab */}
          {/* {(activeTab === 'All Topics' || activeTab === 'My Topics') && (
            <select
              className="px-3 py-1 text-sm border border-gray-300 rounded bg-white text-gray-700"
              value={selectedCategoryId ?? ""}
              onChange={e => {
                const value = e.target.value;
                setSelectedCategoryId(value === "" ? undefined : value);
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          )} */}
          <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1 bg-white">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none outline-none text-sm w-48"
            />
          </div>
        </div>
      </div>
    </div>
  );
}