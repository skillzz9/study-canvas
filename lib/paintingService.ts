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
  orderBy
} from "firebase/firestore";

// PAINTING OBJECT //
export interface PaintingData {
  id?: string; // Firebase doc ID
  userId: string; // who is the user 
  title: string; // the title that the user is naming this painting 
  subject: string; // topic or subject (eg biology or exam)
  targetHours: number; // how many hours they want to collectively study on this painting to draw it 
  totalBlocks: number; // how many blocks are needed to complete it (will be calcualted automatically)
  revealedBlocks: number; // how much has been completed
  imageUrl: string | null; // images will be stored locally for now
  status: "in-progress" | "completed"; 
  createdAt: any; // date and time it was created 
  position: { x: number; y: number }; // where it is on the gallery
}

// CREATES PAINTING 
export async function createPainting(
  userId: string, 
  title: string, 
  subject: string, 
  targetHours: number,
  imageUrl: string | null = null
) {
  try {
    // We set a default grid size for new paintings (e.g., 6x6 grid * 5 layers = 180 blocks)
    // You can make this dynamic later if you want users to pick the canvas size.

    // HARD CODED VALUE
    const defaultTotalBlocks = 180; 

    const newPainting: Omit<PaintingData, 'id'> = {
      userId,
      title,
      subject,
      targetHours,
      totalBlocks: defaultTotalBlocks,
      revealedBlocks: 0, // Starts blank
      imageUrl,
      status: "in-progress",
      createdAt: serverTimestamp(),
      // Spawns in the center of the gallery wall
      position: { x: 0, y: 0 } 
    };

    const docRef = await addDoc(collection(db, "paintings"), newPainting);
    return docRef.id;
  } catch (error) {
    console.error("Error creating painting:", error);
    throw error;
  }
}

// 3. Fetch all paintings for the gallery wall
export async function getUserPaintings(userId: string): Promise<PaintingData[]> {
  try {
    const q = query(
      collection(db, "paintings"), 
      where("userId", "==", userId),
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

// 4. Save the XY coordinates when a user drags a frame around the gallery
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

// 5. Update progress after they leave the study room
export async function updatePaintingProgress(paintingId: string, newRevealedCount: number) {
  try {
    const paintingRef = doc(db, "paintings", paintingId);
    await updateDoc(paintingRef, {
      revealedBlocks: newRevealedCount
    });
  } catch (error) {
    console.error("Error updating painting progress:", error);
    throw error;
  }
}