import { db } from "./firebase";
import { 
  doc, 
  runTransaction, 
  serverTimestamp, 
  deleteDoc,
  updateDoc,
  setDoc
} from "firebase/firestore";

export const joinOrCreateGlobalRoom = async (
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
    
    // CASE A: NEW ROOM
    if (!roomSnap.exists()) {
      const indices = generateShuffledIndices(gridSize, totalLayers);
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
        allowedUsers: [uid] 
      });
      return "created";
    }

    const roomData = roomSnap.data();
    
    // CASE B: INITIALIZE OLD DATA
    if (!roomData.status || roomData.numOfAvatars === undefined || !roomData.shuffledIndices) {
      const indices = roomData.shuffledIndices || generateShuffledIndices(gridSize, totalLayers);
      transaction.update(roomRef, {
        status: "idle", 
        numOfAvatars: 1,
        revealedBlocks: roomData.revealedBlocks || 0,
        shuffledIndices: indices, 
        accumulatedMs: roomData.accumulatedMs || 0,
        lastStartTime: null, 
        gridSize: roomData.gridSize || gridSize,
        totalLayers: roomData.totalLayers || totalLayers,
        allowedUsers: roomData.allowedUsers || [uid]
      });
      return "initialized";
    } 
    
    // CASE C: STANDARD JOIN
    else {
      const currentAvatars = isNaN(roomData.numOfAvatars) ? 0 : roomData.numOfAvatars;
      transaction.update(roomRef, {
        numOfAvatars: currentAvatars + 1,
        totalMinutes: totalMinutes || roomData.totalMinutes || 60
      });
      return "joined";
    }
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