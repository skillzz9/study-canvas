export interface UserProfile {
  username: string;
  email: string | null;
  avatar: string;
  createdAt: any; // Firebase uses its own Timestamp object here
}