export interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  profile_picture?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EditProfileProps {
  profile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: Partial<UserProfile>) => Promise<void>;
  isSaving?: boolean;
}

export interface UserProfileCardProps {
  profile: UserProfile | null;
  onEdit?: () => void;
  onProfilePictureChange?: (file: File) => void;
  isEditable?: boolean;
}