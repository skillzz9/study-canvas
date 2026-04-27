import { db } from "./firebase";
import { 
  doc, 
  runTransaction, 
  serverTimestamp, 
  deleteDoc,
  updateDoc,
  setDoc,
  increment,
} from "firebase/firestore";

export const createRoom = async (
  uid: string, 
  paintingId: string, 
  totalBlocks: number, 
  totalMinutes: number, 
  gridSize: number, 
  totalLayers: number
) => {
  const roomRef = doc(db, "paintings", paintingId);

  return await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    const indices = generateShuffledIndices(gridSize || 6, totalLayers || 5);

    // CASE A: Document does not exist at all
    if (!roomSnap.exists()) {
      transaction.set(roomRef, {
        gridSize: gridSize || 6,
        totalLayers: totalLayers || 5,
        status: "idle",
        numOfAvatars: 1,
        revealedBlocks: 0,
        totalNumberOfBlocks: totalBlocks || 180,
        totalMinutes: totalMinutes || 60,
        shuffledIndices: indices,
        accumulatedMs: 0,
        lastStartTime: null,
        createdBy: uid,
        allowedUsers: [uid],
        currentTurnIndex: 0,
      });
      return "created";
    }

    const roomData = roomSnap.data();

    // CASE B: Document exists but lacks room properties
    if (!roomData.status || roomData.numOfAvatars === undefined) {
      transaction.update(roomRef, {
        status: "idle",
        numOfAvatars: 1,
        revealedBlocks: roomData.revealedBlocks || 0,
        shuffledIndices: roomData.shuffledIndices || indices,
        accumulatedMs: roomData.accumulatedMs || 0,
        lastStartTime: null,
        gridSize: roomData.gridSize || gridSize,
        totalLayers: roomData.totalLayers || totalLayers,
        allowedUsers: roomData.allowedUsers || [uid]
      });
      return "initialized";
    }

    return "exists"; // Fallback if room is already active
  });
};
/**
 * Handles Case C (Standard Join).
 * Used when numOfAvatars is already >= 1.
 */
export const joinRoom = async (
  uid: string, 
  paintingId: string, 
  totalMinutes: number
) => {
  const roomRef = doc(db, "paintings", paintingId);

  return await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    
    if (!roomSnap.exists()) {
      throw new Error("Cannot join a room that hasn't been created yet.");
    }

    const roomData = roomSnap.data();

    // Standard Join logic
    transaction.update(roomRef, {
      // Atomic increment ensures accuracy in high-traffic sessions
      numOfAvatars: increment(1),
      totalMinutes: totalMinutes || roomData.totalMinutes || 60
    });

    return "joined";
  });
};

export const leaveGlobalRoom = async (uid: string, paintingId: string) => {
  const roomRef = doc(db, "paintings", paintingId);
  const presenceRef = doc(db, "paintings", paintingId, "presence", uid);

  await deleteDoc(presenceRef);

  return await runTransaction(db, async (transaction) => {
    const roomSnap = await transaction.get(roomRef);
    if (!roomSnap.exists()) return;
    
    const roomData = roomSnap.data();
    const currentStatus = roomData.status || "idle";
    const currentAvatars = roomData.numOfAvatars || 0;
    const currentAccumulated = roomData.accumulatedMs || 0;

    const isActive = currentStatus === "active";
    const now = Date.now();
    const lastStart = roomData.lastStartTime?.toDate().getTime() || now;
    
    const msSinceLastChange = isActive ? (now - lastStart) : 0;
    const TIMELAPSE_MULTIPLIER = 3;
    const collectiveMs = (msSinceLastChange * TIMELAPSE_MULTIPLIER) * Math.max(1, currentAvatars);
    
    const newCount = Math.max(0, currentAvatars - 1);
    
    transaction.update(roomRef, {
      accumulatedMs: currentAccumulated + collectiveMs,
      numOfAvatars: newCount,
      status: newCount === 0 ? "idle" : currentStatus,
      lastStartTime: newCount === 0 ? null : (isActive ? serverTimestamp() : null)
    });
  });
};

export const updatePresence = async (user: any, userData: any, paintingId: string, isInitialJoin: boolean = false) => {
  const presenceRef = doc(db, "paintings", paintingId, "presence", user.uid);
  const data: any = {
    username: userData?.username || "Guest",
    avatar: userData?.avatar || "/avatars/avatar1.webp",
    lastSeen: serverTimestamp(),
  };
  if (isInitialJoin) data.joinedAt = serverTimestamp();
  await setDoc(presenceRef, data, { merge: true });
};


// HELPER FUNCTION TO CREATE INDICIES
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