export interface UserProfile {
  username: string;
  email: string | null;
  avatar: string;
  createdAt: any; // Firebase uses its own Timestamp object here
}

/**
 * Represents the shared state of the study session.
 */
export interface GlobalRoom {
  status: "active" | "idle";
  numOfAvatars: number;         // Controls the speed of the timer
  revealedCount: number;        // How many blocks are currently visible
  totalNumberOfBlocks: number;  // The goal for the session
  accumulatedMs: number;        // The "Banked" time from previous segments
  lastStartTime: any;           // Firebase Timestamp of the last speed change
  createdBy: string;            // UID of the person who started the room
}

/**
 * Represents an individual user inside the 'presence' sub-collection.
 */
export interface RoomParticipant {
  uid: string;
  username: string;
  avatar: string;
  lastSeen: any; // Firebase Timestamp
}