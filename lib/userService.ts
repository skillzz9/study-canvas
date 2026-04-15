// lib/userService.ts

import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile } from "@/types";

/**
 * Creates a brand new user profile document in Firestore
 */
export const createUserDocument = async (uid: string, email: string | null, username: string) => {
  const userRef = doc(db, "users", uid);
  
  // We use our TypeScript interface to ensure we don't accidentally miss any fields!
  const newUserData: UserProfile = {
    username: username,
    email: email,
    avatar: "/avatars/avatar1.webp", 
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, newUserData);
};

/**
 * Fetches an existing user profile from Firestore
 */
export const getUserDocument = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  
  return null;
};

/**
 * Updates the user's preferred gallery background color.
 */
export const updateGalleryColor = async (uid: string, color: string | null) => {
  try {
    const userRef = doc(db, "users", uid);
    // merge: true ensures we only update the color and don't overwrite their username or avatar
    await setDoc(userRef, { galleryColor: color }, { merge: true });
  } catch (error) {
    console.error("Error updating gallery color:", error);
    throw error;
  }
};