import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";

// --- INTERFACE ---
export interface GalleryItem {
  id?: string;
  userId: string;
  itemSrc: string;
  type: "static" | "dynamic";
  position: { x: number; y: number };
  createdAt: any;
}

// --- CORE FUNCTIONS ---

/**
 * Spawns a new item onto the gallery wall.
 * Automatically determines if an item is dynamic or static based on its source path.
 */
export async function spawnItem(userId: string, itemSrc: string, startX: number, startY: number) {
  try {
    // Determine type based on the source path
    const isDynamic = itemSrc.includes('candle') || itemSrc.includes('clock');
    
    const newItem: Omit<GalleryItem, 'id'> = {
      userId,
      itemSrc,
      type: isDynamic ? "dynamic" : "static",
      position: { x: startX, y: startY },
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "galleryItems"), newItem);
    return docRef.id;
  } catch (error) {
    console.error("Error spawning item:", error);
    throw error;
  }
}

/**
 * Updates the X/Y coordinates of an item when the user finishes dragging it.
 */
export async function updateItemPosition(itemId: string, x: number, y: number) {
  try {
    const itemRef = doc(db, "galleryItems", itemId);
    await updateDoc(itemRef, {
      "position.x": x,
      "position.y": y
    });
  } catch (error) {
    console.error("Error updating item position:", error);
    throw error;
  }
}

/**
 * Permanently removes an item from the database.
 */
export async function deleteItem(itemId: string) {
  try {
    const itemRef = doc(db, "galleryItems", itemId);
    await deleteDoc(itemRef);
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
}