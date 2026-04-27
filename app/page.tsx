"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserDocument } from "@/lib/userService";
import { UserProfile } from "@/types";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTheme } from "next-themes"; // Import theme hook

export default function Home() {
  const { theme, setTheme } = useTheme(); // Initialize theme logic
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [image, setImage] = useState<string | null>("/test-image.png");
  const [hours, setHours] = useState<number>(1);
  const [minutes, setMinutes] = useState<number>(0);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const [isRoomActive, setIsRoomActive] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const GRID_SIZE = 6; 
  const TOTAL_LAYERS = 5;
  const TOTAL_BLOCKS = (GRID_SIZE * GRID_SIZE) * TOTAL_LAYERS;

  useEffect(() => {
    const roomRef = doc(db, "rooms", "global-room");
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      setIsRoomActive(snapshot.exists()); 
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setMounted(true);
    localStorage.setItem("studyImage", "/test-image.png");
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



  if (!mounted) return null;

  if (authLoading || dataLoading || !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-app-bg p-6 font-space">
        <div className="font-bold text-xl text-app-accent uppercase tracking-widest animate-pulse">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-app-bg p-6 font-space transition-colors duration-300">
      
      {/* SETTINGS LINK */}
      <Link 
        href="/settings"
        className="absolute top-6 left-6 p-3 bg-app-card border-4 border-app-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-app-text"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </Link>

      {/* GALLERY LINK */}
      <Link 
        href="/gallery"
        className="absolute top-6 left-[88px] p-3 bg-app-card border-4 border-app-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-app-text"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </Link>

      {/* THEME TOGGLE BUTTON */}
      <button 
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="absolute top-6 left-[150px] p-3 bg-app-card border-4 border-app-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-app-text"
      >
        {theme === "dark" ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>

      <div className="w-full max-w-md rounded-3xl border-4 border-app-border bg-app-card p-8 transition-colors duration-300">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-app-text uppercase tracking-tight">
            {isRoomActive ? "A session is in progress!" : `Should we lock in, ${userData?.username || "Student"}?`}
          </h1>
        </header>

        <div className="flex flex-col gap-4">
          {image && (
            <>
              {!isRoomActive && (
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2 rounded-xl border-2 border-app-border bg-app-bg p-3">
                    <label className="text-xs font-bold text-app-accent uppercase">Hours</label>
                    <input 
                      type="number" min="0" max="24" value={hours}
                      onChange={(e) => setHours(Math.max(0, Number(e.target.value)))}
                      className="w-full text-xl font-bold text-app-text bg-transparent outline-none"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2 rounded-xl border-2 border-app-border bg-app-bg p-3">
                    <label className="text-xs font-bold text-app-accent uppercase">Minutes</label>
                    <input 
                      type="number" min="0" max="59" value={minutes}
                      onChange={(e) => setMinutes(Math.max(0, Number(e.target.value)))}
                      className="w-full text-xl font-bold text-app-text bg-transparent outline-none"
                    />
                  </div>
                </div>
              )}

              <button 
                disabled={buttonLoading}
                className="w-full rounded-xl bg-app-accent py-4 font-bold text-app-card border-2 border-app-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase disabled:opacity-50"
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