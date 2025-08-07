import { useState } from "react";
import { Camera, Edit3, User } from "lucide-react";
import Image from "next/image";
import { UserProfileCardProps } from "@/types/users";

export default function UserProfileCard({ 
  profile, 
  onEdit, 
  onProfilePictureChange,
  isEditable = true 
}: UserProfileCardProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    profile?.profile_picture || null
  );
  const [isHovering, setIsHovering] = useState(false);

  if (!profile) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 bg-white shadow-sm">
        <div className="text-center text-gray-500">
          <User className="mx-auto h-12 w-12 mb-4 text-gray-300" />
          <p>No profile data found.</p>
        </div>
      </div>
    );
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onProfilePictureChange) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      onProfilePictureChange(file);
    }
  };

  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-gray-500 to-gray-600"></div>

      <div className="relative px-6 pb-6">
        <div className="relative -mt-12 mb-6">
          <div 
            className="relative inline-block"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-full h-full object-cover"
                  width={96}
                  height={96}
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-xl">
                  {initials || <User className="h-8 w-8" />}
                </div>
              )}
            </div>
            
            {isEditable && (
              <>
                <div 
                  className={`absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-200 cursor-pointer ${
                    isHovering ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Upload profile picture"
                />
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-gray-500 text-sm mt-1">User ID: {profile.id}</p>
            </div>
            {isEditable && onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email Address</p>
                <p className="text-gray-900 font-medium">{profile.email}</p>
              </div>
            </div>
          </div>

          {profile.phone && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-gray-900 font-medium">{profile.phone}</p>
                </div>
              </div>
            </div>
          )}

          {profile.bio && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Bio</p>
                  <p className="text-gray-900 font-medium">{profile.bio}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}