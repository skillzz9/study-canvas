"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserDocument } from "@/lib/userService";
import { UserProfile } from "@/types";
import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { joinOrCreateGlobalRoom } from "@/lib/roomService";

export default function Home() {
  const router = useRouter();
  
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const [image, setImage] = useState<string | null>(null);
  const [hours, setHours] = useState<number>(1);
  const [minutes, setMinutes] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const [isRoomActive, setIsRoomActive] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  // 1. LISTEN FOR GLOBAL ROOM STATUS
useEffect(() => {
  const roomRef = doc(db, "rooms", "global-room");
  const unsubscribe = onSnapshot(roomRef, (snapshot) => {
    // If the document exists in Firestore, we treat it as an existing room
    setIsRoomActive(snapshot.exists()); 
  });
  return () => unsubscribe();
}, []);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("studyImage");
    if (saved) setImage(saved);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/signin");
      } else {
        const fetchUserData = async () => {
          try {
            const profile = await getUserDocument(user.uid);
            setUserData(profile);
          } catch (error) {
            console.error("Failed to load profile:", error);
          } finally {
            setDataLoading(false);
          }
        };
        fetchUserData();
      }
    }
  }, [user, authLoading, router]);

  const handleImageSave = (base64String: string) => {
    setImage(base64String);
    try {
      localStorage.setItem("studyImage", base64String);
    } catch (error) {
      alert("This image file is too large to save! Please try a smaller file.");
      setImage(null);
    }
  };

  const clearImage = () => {
    setImage(null);
    localStorage.removeItem("studyImage");
  };

  const handleEnterStudyRoom = async () => {
    if (image && user) {
      setButtonLoading(true);
      try {
        // Constant for your current grid setup (2x2 grid * 6 layers)
        const TOTAL_BLOCKS = 24; 
        
        localStorage.setItem("studyImage", image);
        localStorage.setItem("studyTime", ((hours * 60) + minutes).toString());

        await joinOrCreateGlobalRoom(user.uid, TOTAL_BLOCKS);
        router.push("/studyroom");
      } catch (error) {
        console.error("Error entering room:", error);
        alert("Failed to join the room. Please try again.");
      } finally {
        setButtonLoading(false);
      }
    }
  };

  if (!mounted) return null;

  if (authLoading || dataLoading || !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-100 p-6 font-space">
        <div className="font-bold text-xl text-neutral-800 uppercase tracking-widest animate-pulse">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper p-6 font-space">
      <Link 
        href="/settings"
        className="absolute top-6 left-6 p-3 bg-white border-4 border-neutral-800 rounded-xl shadow-[4px_4px_0px_0px_rgba(61,61,61,1)] hover:shadow-[2px_2px_0px_0px_rgba(61,61,61,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-neutral-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </Link>

      <div className="w-full max-w-md rounded-3xl border-4 border-neutral-800 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(61,61,61,1)]">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-neutral-800 uppercase tracking-tight">
            {isRoomActive ? "A session is in progress!" : `What should we draw today, ${userData?.username || "Student"}?`}
          </h1>
        </header>

        <ImageUploader image={image} onUpload={handleImageSave} onClear={clearImage} />

        <div className="flex flex-col gap-4">
          {image && (
            <>
              {/* Only show time inputs if we are creating a new room */}
              {!isRoomActive && (
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2 rounded-xl border-2 border-neutral-800 bg-white p-3">
                    <label className="text-xs font-bold text-neutral-500 uppercase">Hours</label>
                    <input 
                      type="number" min="0" max="24" value={hours}
                      onChange={(e) => setHours(Math.max(0, Number(e.target.value)))}
                      className="w-full text-xl font-bold text-neutral-800 bg-transparent outline-none"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2 rounded-xl border-2 border-neutral-800 bg-white p-3">
                    <label className="text-xs font-bold text-neutral-500 uppercase">Minutes</label>
                    <input 
                      type="number" min="0" max="59" value={minutes}
                      onChange={(e) => setMinutes(Math.max(0, Number(e.target.value)))}
                      className="w-full text-xl font-bold text-neutral-800 bg-transparent outline-none"
                    />
                  </div>
                </div>
              )}

              <button 
                onClick={handleEnterStudyRoom}
                disabled={buttonLoading}
                className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white border-2 border-neutral-800 shadow-[4px_4px_0px_0px_rgba(61,61,61,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all uppercase disabled:opacity-50"
              >
                {buttonLoading ? "Loading..." : isRoomActive ? "Join Study Room" : "Create Study Room"}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}