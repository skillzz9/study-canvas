import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  arrayUnion 
} from "firebase/firestore";

// HELPER: Generate 5-char alphanumeric code
const generateShareCode = () => Math.random().toString(36).substring(2, 7).toUpperCase();

/**
 * Creates a new painting and initializes the allowedUsers array.
 */
export const createPainting = async (
  userId: string,
  title: string,
  subject: string,
  hours: number,
  imageUrl: string,
  isShared: boolean
) => {
  const shareCode = isShared ? generateShareCode() : null;
  
  const paintingData = {
    userId, // Creator
    allowedUsers: [userId], // Initial list of people who can see it
    title,
    subject,
    totalMinutes: hours * 60,
    imageUrl,
    revealedBlocks: 0,
    totalNumberOfBlocks: 180,
    isShared,
    shareCode,
    position: { x: 0, y: 0 }, // Initial position on the wall
    createdAt: serverTimestamp(),
  };

  return await addDoc(collection(db, "paintings"), paintingData);
};

/**
 * MISSING FUNCTION: Updates the X and Y coordinates on the infinite wall.
 */
export const updatePaintingPosition = async (id: string, x: number, y: number) => {
  const paintingRef = doc(db, "paintings", id);
  return await updateDoc(paintingRef, {
    position: { x, y }
  });
};

/**
 * Allows a friend to join a painting via a 5-character code.
 */
export const joinPaintingByCode = async (userId: string, code: string) => {
  const q = query(collection(db, "paintings"), where("shareCode", "==", code.toUpperCase()));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("Invalid Share Code");
  }

  const paintingDoc = querySnapshot.docs[0];
  const paintingRef = paintingDoc.ref;

  // Add the new user to the allowedUsers array so it pops up in their gallery
  await updateDoc(paintingRef, {
    allowedUsers: arrayUnion(userId)
  });

  return paintingDoc.id;
};