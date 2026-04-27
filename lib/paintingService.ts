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

// GENERATES A RANDOM CODE FOR JOINING OTHER PAINTINGS TO GALLERY
const generateShareCode = () => Math.random().toString(36).substring(2, 7).toUpperCase();

export const createPainting = async (
  userId: string,
  title: string,
  subject: string,
  hours: number,
  imageUrl: string,
  // can be joined by another user
  isShared: boolean
) => {
  const shareCode = isShared ? generateShareCode() : null;
  
  // initializing a painting
  const paintingData = {
    userId,
    allowedUsers: [userId], // when somoene joins with the code, it adds them to the allowed list. 
    title,
    subject,
    totalMinutes: hours * 60,
    imageUrl,
    revealedBlocks: 0,
    totalNumberOfBlocks: 180,
    isShared,
    shareCode,
    position: { x: 0, y: 0 },
    createdAt: serverTimestamp(),
  };

  return await addDoc(collection(db, "paintings"), paintingData);
};

// When a user moves a painting and lets go it updates its x and y coordinates 
export const updatePaintingPosition = async (id: string, x: number, y: number) => {
  await updateDoc(doc(db, "paintings", id), { position: { x, y } });
};


// Adds a painting that is joined by a code
export const joinPaintingByCode = async (userId: string, code: string) => {
  const q = query(collection(db, "paintings"), where("shareCode", "==", code.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("Invalid Code");
  const paintingRef = snap.docs[0].ref;
  // adds allowed users
  await updateDoc(paintingRef, { allowedUsers: arrayUnion(userId) });
  return snap.docs[0].id;
};