import { db } from "./firebase";
import { 
  doc, 
  runTransaction, 
  serverTimestamp, 
  increment,
  setDoc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";

/**
 * Creates or joins the global room.
 * Banks the current stopwatch progress multiplied by the current number of workers
 * before changing the avatar count to ensure "Collective Study" accuracy.
 */
export const joinOrCreateGlobalRoom = async (uid: string, totalBlocks: number, totalMinutes: number, gridSize: number, 
  totalLayers: number) => {
  const roomRef = doc(db, "rooms", "global-room");

  return await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    
    // 1. If the room doesn't exist, create it from scratch
    if (!roomSnap.exists()) {
      const BLOCKS_PER_LAYER = gridSize * gridSize;
      const indices = [];

      for (let i = 0; i < totalLayers; i++) {
        const start = i * BLOCKS_PER_LAYER;
        const layerJobIds = Array.from({ length: BLOCKS_PER_LAYER }, (_, j) => start + j);

        for (let k = layerJobIds.length - 1; k > 0; k--) {
          const r = Math.floor(Math.random() * (k + 1));
          [layerJobIds[k], layerJobIds[r]] = [layerJobIds[r], layerJobIds[k]];
        }
        indices.push(...layerJobIds);
      }

      transaction.set(roomRef, {
        gridSize: gridSize,
        totalLayers: totalLayers,
        status: "idle", // Start as idle so the first user must click Start
        numOfAvatars: 1,
        revealedCount: 0,
        totalNumberOfBlocks: totalBlocks,
        totalMinutes: totalMinutes, 
        shuffledIndices: indices,
        accumulatedMs: 0,
        lastStartTime: null, // No start time until Start is clicked
        createdBy: uid
      });
      return "created";

    // 2. If the room exists, join it
    } else {
      const roomData = roomSnap.data();
      const isActive = roomData.status === "active";

      const updateData: any = {
        numOfAvatars: increment(1),
      };

      // Only bank time and update lastStartTime if the room is ALREADY active
      if (isActive && roomData.lastStartTime) {
        const now = Date.now();
        const lastStart = roomData.lastStartTime.toDate().getTime();
        const msSinceLastChange = now - lastStart;

        const collectiveMs = msSinceLastChange * (roomData.numOfAvatars || 1);
        updateData.accumulatedMs = (roomData.accumulatedMs || 0) + collectiveMs;
        updateData.lastStartTime = serverTimestamp();
      }

      transaction.update(roomRef, updateData);
      return "joined";
    }
  });
};

export const startGlobalRoom = async () => {
  const roomRef = doc(db, "rooms", "global-room");
  await updateDoc(roomRef, {
    status: "active",
    lastStartTime: serverTimestamp()
  });
};

/**
 * Handles a user leaving. 
 * Banks the multiplied "Collective Time" before the avatar count drops.
 */
export const leaveGlobalRoom = async (uid: string) => {
  const roomRef = doc(db, "rooms", "global-room");
  const presenceRef = doc(db, "rooms", "global-room", "presence", uid);

  await deleteDoc(presenceRef);

  await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) return;
    const roomData = roomSnap.data();

    const isActive = roomData.status === "active";
    const now = Date.now();
    const lastStart = roomData.lastStartTime?.toDate().getTime() || now;
    
    // Only calculate elapsed time if the room was active
    const msSinceLastChange = isActive ? (now - lastStart) : 0;
    const collectiveMs = msSinceLastChange * (roomData.numOfAvatars || 1);
    
    const newCount = Math.max(0, roomData.numOfAvatars - 1);

    transaction.update(roomRef, {
      accumulatedMs: (roomData.accumulatedMs || 0) + collectiveMs,
      numOfAvatars: newCount,
      // If 0 avatars are left, the room resets to idle. Otherwise keeps current status.
      status: newCount === 0 ? "idle" : roomData.status,
      lastStartTime: newCount === 0 ? null : (isActive ? serverTimestamp() : null)
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