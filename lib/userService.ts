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