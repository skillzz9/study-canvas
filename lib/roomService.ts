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
      // Generate the master job list once so every worker sees the same blocks
    const BLOCKS_PER_LAYER = gridSize * gridSize;
    const indices = [];

    for (let i = 0; i < totalLayers; i++) {
    // 1. Generate the 4 specific IDs for this layer (e.g., 0-3, 4-7, 8-11...)
    const start = i * BLOCKS_PER_LAYER;
    const layerJobIds = Array.from({ length: BLOCKS_PER_LAYER }, (_, j) => start + j);

    // 2. Shuffle ONLY these 4 numbers (Fisher-Yates)
    for (let k = layerJobIds.length - 1; k > 0; k--) {
      const r = Math.floor(Math.random() * (k + 1));
      [layerJobIds[k], layerJobIds[r]] = [layerJobIds[r], layerJobIds[k]];
    }

  // 3. Push this completed "Layer" into our master list
  indices.push(...layerJobIds);
}

      transaction.set(roomRef, {
        gridSize: gridSize,
        totalLayers: totalLayers,
        status: "active",
        numOfAvatars: 1,
        revealedCount: 0,
        totalNumberOfBlocks: totalBlocks,
        totalMinutes: totalMinutes, 
        shuffledIndices: indices,
        accumulatedMs: 0,
        lastStartTime: serverTimestamp(),
        createdBy: uid
      });
      return "created";

    // 2. If the room exists, bank existing progress and join
    } else {
      const roomData = roomSnap.data();
      const wasIdle = roomData.status === "idle";

      const updateData: any = {
        status: "active",
        numOfAvatars: increment(1),
        lastStartTime: serverTimestamp(),
      };

      if (!wasIdle && roomData.lastStartTime) {
        const now = Date.now();
        const lastStart = roomData.lastStartTime.toDate().getTime();
        const msSinceLastChange = now - lastStart;

        // MULTIPLIER: Multiply real time by the people who were already working
        const collectiveMs = msSinceLastChange * (roomData.numOfAvatars || 1);
        updateData.accumulatedMs = (roomData.accumulatedMs || 0) + collectiveMs;
      }

      transaction.update(roomRef, updateData);
      return "joined";
    }
  });
};

/**
 * Handles a user leaving. 
 * Banks the multiplied "Collective Time" before the avatar count drops.
 */
export const leaveGlobalRoom = async (uid: string) => {
  const roomRef = doc(db, "rooms", "global-room");
  const presenceRef = doc(db, "rooms", "global-room", "presence", uid);

  // Remove individual presence immediately so they disappear from UI
  await deleteDoc(presenceRef);

  await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) return;
    const roomData = roomSnap.data();

    const now = Date.now();
    const lastStart = roomData.lastStartTime?.toDate().getTime() || now;
    const msSinceLastChange = now - lastStart;

    // MULTIPLIER: Multiply real time by current count BEFORE subtracting this user
    const collectiveMs = msSinceLastChange * (roomData.numOfAvatars || 1);
    
    const newCount = Math.max(0, roomData.numOfAvatars - 1);

    transaction.update(roomRef, {
      accumulatedMs: (roomData.accumulatedMs || 0) + collectiveMs,
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