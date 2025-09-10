"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useCategories } from "@/hooks/use-categories";
import { useUserPosts } from "@/hooks/use-user-posts";
import { UserProfile } from "@/types/users";
import UserProfileCard from "@/components/profile/user-profile-card";
import EditProfile from "@/components/profile/edit-profile";
import UserComments from "@/components/profile/user-comments";
import UserPosts from "@/components/profile/user-posts";
import UserCategories from "@/components/profile/user-categories";
import { Calendar, Cake, Award, TrendingUp, User } from "lucide-react";
import Image from "next/image";
import { Category } from "@/types/category";
import { useUserComments } from "@/hooks/use-user-comments";
import { useFollowing } from "@/hooks/use-following"
import { useRouter } from "next/navigation";
import { useFollowers } from "@/hooks/use-followers";

export default function ProfilePage() {
  const params = useSearchParams();
  const userId = params.get("id") || undefined;
  const { user, loading } = useAuth();
  const { categories } = useCategories();
  const viewingOwnProfile = !userId || userId === user?.id;
  const { 
    profile, 
    loading: profileLoading, 
    error: profileError,
    updateProfile, 
    uploadProfilePicture,
    refreshProfile 
  } = useUserProfile(userId || user?.id);
  
  const { postsCount, loading: postsLoading } = useUserPosts(userId || user?.id);
  const { commentsCount, loading: commentsLoading } = useUserComments(userId || user?.id);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const router = useRouter();

  const { follow, unfollow, following, unfollowing, followedUsers } = useFollowing(user?.id);
  const { followersCount, loading: followersLoading } = useFollowers(profile?.id);
  const [isFollowing, setIsFollowing] = useState(false);
  useEffect(() => {
    if (profile?.id && followedUsers.length > 0) {
      setIsFollowing(followedUsers.some(followed => followed.id === profile.id));
    }
  }, [profile?.id, followedUsers]);

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>) => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      await updateProfile(updatedProfile);
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureChange = async (file: File) => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      await uploadProfilePicture(file);
      // Refresh the profile to get the updated picture URL
      await refreshProfile();
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user?.id || !profile?.id) {
      router.push("/auth/login");
      return;
    }

    try {
      if (isFollowing) {
        await unfollow({ followedUserId: profile.id });
        setIsFollowing(false);
      } else {
        await follow({ followedUserId: profile.id });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header skeleton */}
        <div className="bg-gray-200 h-32"></div>
        <div className="max-w-6xl mx-auto px-4 -mt-16">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main content skeleton */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            {/* Sidebar skeleton */}
            <div className="lg:w-80 space-y-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 mb-4">Error loading profile: {profileError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = ["Overview", "Posts", "Comments", "Categories"];
  const userCategories = categories.filter((cat: Category) => cat.owner_id === profile?.id);

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays < 30) return `${diffInDays}d`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo`;
    return `${Math.floor(diffInMonths / 12)}y`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner - neutral color instead of blue gradient */}
      <div className="bg-gray-200 h-32 lg:h-40"></div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 lg:-mt-20">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-4">
              <div className="flex items-center gap-4">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                    {profile?.profile_picture ? (
                      <Image
                        src={profile.profile_picture}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        width={96} 
                        height={96} 
                        className="w-full h-full object-cover"
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-700 font-bold text-xl sm:text-2xl">
                        {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {profile?.first_name} {profile?.last_name}
                  </h1>
                  <p className="text-gray-500 text-sm sm:text-base">
                    u/{profile?.first_name?.toLowerCase()}{profile?.last_name?.toLowerCase()}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Cake className="w-4 h-4" />
                      <span>Joined {profile?.created_at ? getTimeAgo(profile.created_at) : 'Unknown'} ago</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {!viewingOwnProfile && user && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={following || unfollowing}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isFollowing
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {following ? "Following..." : unfollowing ? "Unfollowing..." : isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  )}
                  {viewingOwnProfile && (
                    <button
                      onClick={handleEditProfile}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200 mb-4 rounded-t-lg">
              <div className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab}
                    {tab === "Categories" && userCategories.length > 0 && (
                      <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                        {userCategories.length}
                      </span>
                    )}
                    {tab === "Posts" && postsCount > 0 && (
                      <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                        {postsCount}
                      </span>
                    )}
                    {tab === "Comments" && commentsCount > 0 && (
                      <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                        {commentsCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-lg shadow-sm border border-t-0">
              {activeTab === "Overview" && (
                <div className="p-6">
                  {profile?.bio ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                      <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No bio available.</p>
                    </div>
                  )}
                  
                  {userCategories.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories Created</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {userCategories.slice(0, 4).map((category: Category) => (
                          <div key={category.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                              style={{
                                backgroundColor: category.color,
                                color: "#fff"
                              }}
                            >
                              {category.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{category.name}</p>
                              <p className="text-sm text-gray-500 truncate">{category.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {userCategories.length > 4 && (
                        <button
                          onClick={() => setActiveTab("Categories")}
                          className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View all {userCategories.length} categories →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "Posts" && profile?.id && (
                <UserPosts userId={profile.id} />
              )}
              
              {activeTab === "Comments" && profile?.id && (
                <UserComments userId={profile.id} />
              )}
              
              {activeTab === "Categories" && (
                <UserCategories categories={userCategories} />
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-80 space-y-4">
            {/* Profile Card */}
            <UserProfileCard 
              profile={profile ?? null}
              onEdit={viewingOwnProfile ? handleEditProfile : undefined}
              onProfilePictureChange={viewingOwnProfile ? handleProfilePictureChange : undefined}
              isEditable={viewingOwnProfile}
            />

            {/* Activity Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Activity Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Followers</span>
                  <span className="font-semibold text-gray-900">
                    {followersLoading ? (
                      <div className="w-6 h-4 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      followersCount
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Categories Created</span>
                  <span className="font-semibold text-gray-900">{userCategories.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Posts</span>
                  <span className="font-semibold text-gray-900">
                    {postsLoading ? (
                      <div className="w-6 h-4 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      postsCount
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Comments</span>
                  <span className="font-semibold text-gray-900">
                    {commentsLoading ? (
                      <div className="w-6 h-4 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      commentsCount
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Info Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Cake className="w-4 h-4" />
                  <span>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</span>
                </div>
                {profile?.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Email verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Achievements Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Achievements
              </h3>
              <div className="space-y-2">
                {userCategories.length > 0 && (
                  <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Category Creator</p>
                      <p className="text-xs text-gray-500">Created your first category</p>
                    </div>
                  </div>
                )}
                {postsCount > 0 && (
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">First Post</p>
                      <p className="text-xs text-gray-500">Created your first topic</p>
                    </div>
                  </div>
                )}
                {userCategories.length === 0 && postsCount === 0 && (
                  <p className="text-sm text-gray-500 italic">No achievements yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {viewingOwnProfile && (
        <EditProfile
          profile={profile ?? null}
          isOpen={isEditModalOpen}
          onClose={handleCloseEdit}
          onSave={handleSaveProfile}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}