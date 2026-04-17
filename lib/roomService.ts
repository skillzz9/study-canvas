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
export const joinOrCreateGlobalRoom = async (uid: string, paintingId: string, totalBlocks: number, totalMinutes: number, gridSize: number, 
  totalLayers: number) => {
  const roomRef = doc(db, "paintings", paintingId);

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
  
  // SANITIZER: If the database is currently NaN, we MUST force it back to a number
  const currentAvatars = isNaN(roomData.numOfAvatars) ? 0 : (roomData.numOfAvatars || 0);
  const currentAccumulated = isNaN(roomData.accumulatedMs) ? 0 : (roomData.accumulatedMs || 0);

  const updateData: any = {
    // We manually set the number instead of using increment() to break the NaN cycle
    numOfAvatars: currentAvatars + 1,
    totalMinutes: totalMinutes,
  };

  const isActive = roomData.status === "active";
  if (isActive && roomData.lastStartTime) {
    const now = Date.now();
    const lastStart = roomData.lastStartTime.toDate().getTime();
    const msSinceLastChange = now - lastStart;

    const TIMELAPSE_MULTIPLIER = 3;
    // We use our sanitized currentAvatars here
    const collectiveMs = (msSinceLastChange * TIMELAPSE_MULTIPLIER) * Math.max(1, currentAvatars);
    
    updateData.accumulatedMs = currentAccumulated + collectiveMs;
    updateData.lastStartTime = serverTimestamp();
  }

  transaction.update(roomRef, updateData);
  return "joined";
}
  });
};

export const startGlobalRoom = async (paintingId: string) => {
  const roomRef = doc(db, "paintings", paintingId);
  const now = serverTimestamp();
  await updateDoc(roomRef, {
    status: "active",
    lastStartTime: now,
    // ADD THIS: This is the "Anchor" for the individual stopwatches
    sessionStartedAt: now 
  });
};

/**
 * Handles a user leaving. 
 * Banks the multiplied "Collective Time" before the avatar count drops.
 */
export const leaveGlobalRoom = async (uid: string, paintingId: string) => {
  const roomRef = doc(db, "paintings", paintingId);
  const presenceRef = doc(db, "paintings", paintingId, "presence", uid);

  // Remove individual presence immediately
  await deleteDoc(presenceRef);

  return await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) return;
    const roomData = roomSnap.data();

    const isActive = roomData.status === "active";
    const now = Date.now();
    const lastStart = roomData.lastStartTime?.toDate().getTime() || now;
    
    const msSinceLastChange = isActive ? (now - lastStart) : 0;
    const TIMELAPSE_MULTIPLIER = 3;
    const collectiveMs = (msSinceLastChange * TIMELAPSE_MULTIPLIER) * (roomData.numOfAvatars || 1);
    
    const newCount = Math.max(0, roomData.numOfAvatars - 1);
    
    transaction.update(roomRef, {
      accumulatedMs: (roomData.accumulatedMs || 0) + collectiveMs,
      numOfAvatars: newCount,
      status: newCount === 0 ? "idle" : roomData.status,
      lastStartTime: newCount === 0 ? null : (isActive ? serverTimestamp() : null)
    });
  });
};

/**
 * Updates the user's presence so others can see their avatar.
 */
export const updatePresence = async (user: any, userData: any, paintingId: string, isInitialJoin: boolean = false) => {
  const presenceRef = doc(db, "paintings", paintingId, "presence", user.uid);
  
  const data: any = {
    username: userData?.username || "Guest",
    avatar: userData?.avatar || "/avatars/avatar1.webp",
    lastSeen: serverTimestamp(),
  };

  // Only record the join time if this is the first entry
  // leaveGlobalRoom deletes this doc, so it resets correctly on next join
  if (isInitialJoin) {
    data.joinedAt = serverTimestamp();
  }

  await setDoc(presenceRef, data, { merge: true });
};