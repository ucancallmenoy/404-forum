import { useState, useEffect } from "react";
import { Camera, Edit3, User, Mail, Phone, FileText } from "lucide-react";
import Image from "next/image";
import { UserProfileCardProps } from "@/types/users";

export default function UserProfileCard({ 
  profile, 
  onEdit, 
  onProfilePictureChange,
  isEditable = true 
}: UserProfileCardProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setImagePreview(profile?.profile_picture || null);
  }, [profile?.profile_picture]);

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
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
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center mb-6">
        <div 
          className="relative inline-block mb-4"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 mx-auto">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt={`${profile.first_name} ${profile.last_name}`}
                className="w-full h-full object-cover"
                width={80}
                height={80}
                style={{ objectFit: "cover" }}
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-700 font-bold text-xl">
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
                <Camera className="h-5 w-5 text-white" />
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

        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {profile.first_name} {profile.last_name}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          u/{profile.first_name?.toLowerCase()}{profile.last_name?.toLowerCase()}
        </p>

        {isEditable && onEdit && (
          <button
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700">Email</p>
            <p className="text-sm text-gray-900 truncate">{profile.email}</p>
          </div>
        </div>

        {profile.phone && (
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">Phone</p>
              <p className="text-sm text-gray-900">{profile.phone}</p>
            </div>
          </div>
        )}

        {profile.bio && (
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">Bio</p>
              <p className="text-sm text-gray-900 leading-relaxed">{profile.bio}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}