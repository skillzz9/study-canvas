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
    
    // CASE A: The document doesn't exist at all
    if (!roomSnap.exists()) {
      const indices = generateShuffledIndices(gridSize, totalLayers);
      transaction.set(roomRef, {
        gridSize,
        totalLayers,
        status: "idle",
        numOfAvatars: 1,
        revealedBlocks: 0,
        totalNumberOfBlocks: totalBlocks,
        totalMinutes, 
        shuffledIndices: indices,
        accumulatedMs: 0,
        lastStartTime: null,
        createdBy: uid
      });
      return "created";
    }

    const roomData = roomSnap.data();
    
    // CASE B: Doc exists (from Modal) but hasn't been turned into a "Room" yet
    if (!roomData.status || roomData.numOfAvatars === undefined) {
      const indices = roomData.shuffledIndices || generateShuffledIndices(gridSize, totalLayers);
      transaction.update(roomRef, {
        status: "idle",
        numOfAvatars: 1,
        revealedBlocks: roomData.revealedBlocks || 0,
        shuffledIndices: indices,
        accumulatedMs: 0,
        lastStartTime: null,
        // Ensure gridSize/layers are set if modal missed them
        gridSize: roomData.gridSize || gridSize,
        totalLayers: roomData.totalLayers || totalLayers
      });
      return "initialized";
    }

    // CASE C: Room is already active/idle with people in it
    const currentAvatars = isNaN(roomData.numOfAvatars) ? 0 : roomData.numOfAvatars;
    const updateData: any = {
      numOfAvatars: currentAvatars + 1,
    };

    if (roomData.status === "active" && roomData.lastStartTime) {
      const now = Date.now();
      const lastStart = roomData.lastStartTime.toDate().getTime();
      const TIMELAPSE_MULTIPLIER = 3;
      const collectiveMs = (now - lastStart) * TIMELAPSE_MULTIPLIER * Math.max(1, currentAvatars);
      
      updateData.accumulatedMs = (roomData.accumulatedMs || 0) + collectiveMs;
      updateData.lastStartTime = serverTimestamp();
    }

    transaction.update(roomRef, updateData);
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