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
  shuffledIndices: number[]; // The master reveal sequence
  imageUrl: string | null;
  status: "in-progress" | "completed";
  createdAt: Timestamp | any; 
  position: { x: number; y: number };
  collaborators: string[]; // For shared paintings logic
}

// --- HELPERS ---

/**
 * Generates indices layer-by-layer to ensure the background fills 
 * before the foreground, but keeps each layer's reveal random.
 */
function generateShuffledIndices(gridSize: number, totalLayers: number): number[] {
  const BLOCKS_PER_LAYER = gridSize * gridSize;
  const indices: number[] = [];

  for (let i = 0; i < totalLayers; i++) {
    const start = i * BLOCKS_PER_LAYER;
    const layerIndices = Array.from({ length: BLOCKS_PER_LAYER }, (_, j) => start + j);

    // Fisher-Yates shuffle ONLY the current layer
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
      status: "in-progress",
      createdAt: serverTimestamp(),
      position: { x: 0, y: 0 },
      collaborators: [userId] // Creator is the first collaborator
    };

    const docRef = await addDoc(collection(db, "paintings"), newPainting);
    return docRef.id;
  } catch (error) {
    console.error("Error creating painting:", error);
    throw error;
  }
}

/**
 * Fetches all paintings for a specific user (as owner or collaborator).
 */
export async function getUserPaintings(userId: string): Promise<PaintingData[]> {
  try {
    // This query finds paintings where the user is in the collaborators list
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
      status: isFinished ? "completed" : "in-progress"
    });
  } catch (error) {
    console.error("Error updating painting progress:", error);
    throw error;
  }
}