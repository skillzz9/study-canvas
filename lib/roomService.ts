import { db } from "./firebase";
import { 
  doc, 
  runTransaction, 
  serverTimestamp, 
  increment,
  setDoc,
  deleteDoc
} from "firebase/firestore";

/**
 * Creates or joins the global room.
 * Banks the current stopwatch progress before changing the avatar count
 * to ensure millisecond accuracy across different speeds.
 */
export const joinOrCreateGlobalRoom = async (uid: string, totalBlocks: number) => {
  const roomRef = doc(db, "rooms", "global-room");

  return await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    
    if (!roomSnap.exists()) {
      // ONLY create from scratch if the document is totally missing
      transaction.set(roomRef, {
        status: "active",
        numOfAvatars: 1,
        revealedCount: 0,
        totalNumberOfBlocks: totalBlocks,
        accumulatedMs: 0,
        lastStartTime: serverTimestamp(),
        createdBy: uid
      });
      return "created";
    } else {
      const roomData = roomSnap.data();
      const wasIdle = roomData.status === "idle";

      const updateData: any = {
        status: "active",
        numOfAvatars: increment(1),
        lastStartTime: serverTimestamp(),
      };

      // Only bank time if the room was already running
      if (!wasIdle) {
        const now = Date.now();
        const lastStart = roomData.lastStartTime.toDate().getTime();
        const msSinceLastChange = now - lastStart;
        updateData.accumulatedMs = (roomData.accumulatedMs || 0) + msSinceLastChange;
      }

      transaction.update(roomRef, updateData);
      return "joined";
    }
  });
};

/**
 * Handles a user leaving. 
 * Banks the time and sets room to idle if it's the last person.
 */
export const leaveGlobalRoom = async (uid: string) => {
  const roomRef = doc(db, "rooms", "global-room");
  const presenceRef = doc(db, "rooms", "global-room", "presence", uid);

  // Remove individual presence immediately
  await deleteDoc(presenceRef);

  await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) return;
    const roomData = roomSnap.data();

    // Bank work done before the speed drops or timer freezes
    const now = Date.now();
    const lastStart = roomData.lastStartTime.toDate().getTime();
    const msSinceLastChange = now - lastStart;

    const newCount = Math.max(0, roomData.numOfAvatars - 1);

    transaction.update(roomRef, {
      accumulatedMs: (roomData.accumulatedMs || 0) + msSinceLastChange,
      lastStartTime: serverTimestamp(),
      numOfAvatars: newCount,
      // If 0 avatars are left, the room is idle and time is frozen
      status: newCount === 0 ? "idle" : "active"
    });
  });
};

/**
 * Updates the user's presence so others can see their avatar.
 */
export const updatePresence = async (user: any, userData: any) => {
  const presenceRef = doc(db, "rooms", "global-room", "presence", user.uid);
  await setDoc(presenceRef, {
    username: userData?.username || "Guest",
    avatar: userData?.avatar || "/avatars/avatar1.webp",
    lastSeen: serverTimestamp(),
  });
};