"use client";
import { useFollowing } from "@/hooks/use-following";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "lucide-react";

export default function Following() {
  const { user } = useAuth();
  const { followedUsers, loading } = useFollowing(user?.id);
  const router = useRouter();

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-500">Loading followed users...</div>
      </div>
    );
  }

  if (followedUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">You are not following anyone yet.</p>
        <p className="text-sm text-gray-400 mt-2">Start following users to see their posts here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {followedUsers.map((followedUser) => (
        <div key={followedUser.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            {followedUser.profile_picture ? (
              <Image
                src={followedUser.profile_picture}
                alt={`${followedUser.first_name} ${followedUser.last_name}`}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {followedUser.first_name} {followedUser.last_name}
              </h3>
              <p className="text-gray-500 text-sm">{followedUser.email}</p>
            </div>
            <button
              onClick={() => router.push(`/profile?id=${followedUser.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Profile
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}