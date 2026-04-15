import { db } from "./firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  orderBy,
  Timestamp
} from "firebase/firestore";

// --- INTERFACE ---
export interface PaintingData {
  id?: string;
  userId: string;
  title: string;
  subject: string;
  targetHours: number;
  totalBlocks: number;
  revealedBlocks: number;
  shuffledIndices: number[]; 
  imageUrl: string | null;
  // UPDATED: Added 'idle' and 'active' to match the merged room logic
  status: "idle" | "active" | "in-progress" | "completed"; 
  // NEW: Added the stopwatch variables required by the Study Room
  accumulatedMs?: number;
  lastStartTime?: Timestamp | null;
  sessionStartedAt?: Timestamp | null;
  createdAt: Timestamp | any; 
  position: { x: number; y: number };
  collaborators: string[]; 
}

// --- HELPERS ---

function generateShuffledIndices(gridSize: number, totalLayers: number): number[] {
  const BLOCKS_PER_LAYER = gridSize * gridSize;
  const indices: number[] = [];

  for (let i = 0; i < totalLayers; i++) {
    const start = i * BLOCKS_PER_LAYER;
    const layerIndices = Array.from({ length: BLOCKS_PER_LAYER }, (_, j) => start + j);

    for (let k = layerIndices.length - 1; k > 0; k--) {
      const r = Math.floor(Math.random() * (k + 1));
      [layerIndices[k], layerIndices[r]] = [layerIndices[r], layerIndices[k]];
    }
    indices.push(...layerIndices);
  }
  return indices;
}

// --- CORE FUNCTIONS ---

/**
 * Creates a new painting document in Firestore.
 */
export async function createPainting(
  userId: string, 
  title: string, 
  subject: string, 
  targetHours: number,
  imageUrl: string | null = null,
  isShared: boolean = false
) {
  try {
    const gridSize = 6; 
    const totalLayers = 5;
    const totalBlocks = (gridSize * gridSize) * totalLayers;

    const shuffledIndices = generateShuffledIndices(gridSize, totalLayers);

    const newPainting: Omit<PaintingData, 'id'> = {
      userId,
      title,
      subject,
      targetHours,
      totalBlocks,
      shuffledIndices, 
      revealedBlocks: 0,
      imageUrl,
      // UPDATED: Set to idle initially so the Start button works!
      status: "idle", 
      // NEW: Added the baseline stopwatch variables
      accumulatedMs: 0,
      lastStartTime: null,
      sessionStartedAt: null,
      createdAt: serverTimestamp(),
      position: { x: 0, y: 0 },
      collaborators: [userId] 
    };

    const docRef = await addDoc(collection(db, "paintings"), newPainting);
    return docRef.id;
  } catch (error) {
    console.error("Error creating painting:", error);
    throw error;
  }
}

/**
 * Fetches all paintings for a specific user.
 */
export async function getUserPaintings(userId: string): Promise<PaintingData[]> {
  try {
    const q = query(
      collection(db, "paintings"), 
      where("collaborators", "array-contains", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const paintings: PaintingData[] = [];
    
    querySnapshot.forEach((doc) => {
      paintings.push({ id: doc.id, ...doc.data() } as PaintingData);
    });
    
    return paintings;
  } catch (error) {
    console.error("Error fetching paintings:", error);
    throw error;
  }
}

/**
 * Updates the X/Y coordinates of a frame on the gallery wall.
 */
export async function updatePaintingPosition(paintingId: string, x: number, y: number) {
  try {
    const paintingRef = doc(db, "paintings", paintingId);
    await updateDoc(paintingRef, {
      "position.x": x,
      "position.y": y
    });
  } catch (error) {
    console.error("Error updating painting position:", error);
    throw error;
  }
}

/**
 * Updates progress and checks if the painting is finished.
 */
export async function updatePaintingProgress(paintingId: string, newRevealedCount: number, totalBlocks: number) {
  try {
    const paintingRef = doc(db, "paintings", paintingId);
    const isFinished = newRevealedCount >= totalBlocks;
    
    await updateDoc(paintingRef, {
      revealedBlocks: newRevealedCount,
      status: isFinished ? "completed" : "in-progress" // This will correctly flip to completed at the end!
    });
  } catch (error) {
    console.error("Error updating painting progress:", error);
    throw error;
  }
}