import { db } from "./firebase";
import { 
  doc, 
  runTransaction, 
  serverTimestamp, 
  setDoc,
  deleteDoc,
  updateDoc,
  collection,
  getDoc
} from "firebase/firestore";

/**
 * Creates or Joins a Study Room for a specific painting.
 * This acts as the "Live Layer" on top of the static painting data.
 */
export const joinOrCreateRoom = async (
  uid: string, 
  paintingId: string, 
  userData: any,
  sessionGoal: number // Goal in minutes set by the creator
) => {
  const roomRef = doc(db, "rooms", paintingId); // Using paintingId as roomId for the demo

  return await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    
    // 1. FETCH MASTER PAINTING DATA (To populate the room)
    const paintingRef = doc(db, "paintings", paintingId);
    const paintingSnap = await transaction.get(paintingRef);
    
    if (!paintingSnap.exists()) throw new Error("Painting does not exist");
    const pData = paintingSnap.data();

    // 2. CREATE ROOM IF IT DOESN'T EXIST
    if (!roomSnap.exists()) {
      transaction.set(roomRef, {
        paintingId: paintingId,
        hostId: uid,
        isActive: true,
        numOfAvatars: 1,
        sessionGoal: sessionGoal,      // The goal for THIS session
        totalMinutes: pData.totalMinutes || 60, // Original master goal
        revealedBlocks: pData.revealedBlocks || 0,
        totalNumberOfBlocks: pData.totalNumberOfBlocks || 180,
        shuffledIndices: pData.shuffledIndices || [],
        status: "idle",
        accumulatedMs: 0,
        lastStartTime: null,
        createdAt: serverTimestamp(),
      });
      return "created";
    }

    // 3. JOIN EXISTING ROOM
    const roomData = roomSnap.data();
    const currentAvatars = roomData.numOfAvatars || 0;
    
    transaction.update(roomRef, {
      numOfAvatars: currentAvatars + 1,
      isActive: true
    });
    
    return "joined";
  });
};

/**
 * Updates the user's cursor position and metadata in the room.
 */
export const updatePresence = async (
  uid: string, 
  roomId: string, 
  data: { x: number; y: number; username: string; avatar: string }
) => {
  const presenceRef = doc(db, `rooms/${roomId}/presence`, uid);
  
  await setDoc(presenceRef, {
    ...data,
    lastSeen: serverTimestamp()
  }, { merge: true });
};

/**
 * Handles block reveals. 
 * This updates the ROOM progress so everyone sees it live,
 * and should also update the master PAINTING.
 */
export const syncBlockReveal = async (roomId: string, paintingId: string, newRevealedCount: number) => {
  const roomRef = doc(db, "rooms", roomId);
  const paintingRef = doc(db, "paintings", paintingId);

  // Update both so the room is live, but the painting is permanent
  await updateDoc(roomRef, { revealedBlocks: newRevealedCount });
  await updateDoc(paintingRef, { revealedBlocks: newRevealedCount });
};

/**
 * Cleanup when a user leaves the room.
 */
export const leaveRoom = async (uid: string, roomId: string) => {
  const roomRef = doc(db, "rooms", roomId);
  const presenceRef = doc(db, `rooms/${roomId}/presence`, uid);

  // 1. Remove the avatar from the presence sub-collection
  await deleteDoc(presenceRef);

  // 2. Decrement room count
  return await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) return;
    
    const roomData = roomSnap.data();
    const newCount = Math.max(0, (roomData.numOfAvatars || 1) - 1);
    
    transaction.update(roomRef, {
      numOfAvatars: newCount,
      isActive: newCount > 0
    });
  });
};