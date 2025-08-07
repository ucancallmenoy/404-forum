"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useUserProfile } from "@/hooks/use-user-profile";
import { UserProfile } from "@/types/users";
import UserProfileCard from "@/components/profile/user-profile-card";
import EditProfile from "@/components/profile/edit-profile";
import UserPosts from "@/components/profile/user-posts";

export default function ProfilePage() {
  const params = useSearchParams();
  const userId = params.get("id") || undefined;
  const { user, loading } = useAuth();
  const viewingOwnProfile = !userId || userId === user?.id;
  const { 
    profile, 
    loading: profileLoading, 
    error: profileError,
    updateProfile, 
    uploadProfilePicture 
  } = useUserProfile(userId || user?.id);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    
    try {
      setIsSaving(true);
      await uploadProfilePicture(file);
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="max-w-xl mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="h-24 bg-gray-200"></div>
            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-200"></div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">You must be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">Error loading profile: {profileError}</p>
          <button 
            onClick={() => {
              if (typeof refreshProfile === "function") refreshProfile();
            }} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        {viewingOwnProfile ? "Your Profile" : "User Profile"}
      </h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 w-full flex-shrink-0">
          <UserProfileCard 
            profile={profile}
            onEdit={viewingOwnProfile ? handleEditProfile : undefined}
            onProfilePictureChange={viewingOwnProfile ? handleProfilePictureChange : undefined}
            isEditable={viewingOwnProfile}
          />
        </div>
        <div className="md:w-2/3 w-full">
          <div className="h-full max-h-[700px] overflow-y-auto pr-2">
            {profile?.id && <UserPosts userId={profile.id} />}
          </div>
        </div>
      </div>
      {viewingOwnProfile && (
        <EditProfile
          profile={profile}
          isOpen={isEditModalOpen}
          onClose={handleCloseEdit}
          onSave={handleSaveProfile}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}