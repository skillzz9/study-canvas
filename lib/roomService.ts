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
export const joinOrCreateGlobalRoom = async (uid: string, paintingId: string, totalBlocks: number, totalMinutes: number, gridSize: number, totalLayers: number) => {
  const roomRef = doc(db, "paintings", paintingId);

  return await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    
    // 1. COMPLETELY NEW
    if (!roomSnap.exists()) {
      const indices = generateShuffledIndices(gridSize, totalLayers);
      transaction.set(roomRef, {
        gridSize, totalLayers, status: "idle", numOfAvatars: 1,
        revealedBlocks: 0, totalNumberOfBlocks: totalBlocks,
        totalMinutes, shuffledIndices: indices, accumulatedMs: 0,
        lastStartTime: null, createdBy: uid
      });
      return "created";
    }

    const roomData = roomSnap.data();
    
    // 2. INITIALIZE (Fixes the "0 avatars" bug for modal-created paintings)
    if (!roomData.status || roomData.numOfAvatars === undefined) {
      const indices = roomData.shuffledIndices || generateShuffledIndices(gridSize, totalLayers);
      transaction.update(roomRef, {
        status: "idle", numOfAvatars: 1,
        revealedBlocks: roomData.revealedBlocks || 0,
        shuffledIndices: indices, accumulatedMs: roomData.accumulatedMs || 0,
        lastStartTime: null, gridSize: roomData.gridSize || gridSize,
        totalLayers: roomData.totalLayers || totalLayers
      });
      return "initialized";
    }

    // 3. STANDARD JOIN
    const currentAvatars = isNaN(roomData.numOfAvatars) ? 0 : roomData.numOfAvatars;
    transaction.update(roomRef, {
      numOfAvatars: currentAvatars + 1,
      totalMinutes: totalMinutes // Updates the goal to your current input
    });
    return "joined";
  });
};

// HELPER: Add this if it was lost in the reset
function generateShuffledIndices(gridSize: number, totalLayers: number) {
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
  return indices;
}

export const startGlobalRoom = async (paintingId: string, currentAccumulatedMs: number) => {
  const roomRef = doc(db, "paintings", paintingId);
  const now = serverTimestamp();
  await updateDoc(roomRef, {
    status: "active",
    lastStartTime: now,
    sessionStartedAt: now,
    // THE FIX: Save the work already done as the "Baseline" for this session
    sessionBaseMs: currentAccumulatedMs 
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