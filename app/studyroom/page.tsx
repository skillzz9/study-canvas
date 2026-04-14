"use client";
import React, { useState, useEffect, useMemo } from "react";
import confetti from 'canvas-confetti';
import { useRouter } from "next/navigation";
import { doc, onSnapshot, collection, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Level from "@/components/Level";
import GridRevealMask from "@/components/GridRevealMask";
import Avatar from "@/components/Avatar";
import Stopwatch from "@/components/Stopwatch";
import Desk from "@/components/Desk";
import { useAuth } from "@/context/AuthContext";
import { getUserDocument } from "@/lib/userService";
import { UserProfile } from "@/types";
import { updatePresence, leaveGlobalRoom } from "@/lib/roomService";
import Link from "next/link"; // Added Link
import { useTheme } from "next-themes"; // Added useTheme

export default function StudyRoom() {
  const { theme, setTheme } = useTheme(); // Initialize theme logic
  const TIMELAPSE_MULTIPLIER = 3;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null);

  const [dbShuffledIndices, setDbShuffledIndices] = useState<number[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [studyImage, setStudyImage] = useState<string | null>(null);
  const [totalMinutes, setTotalMinutes] = useState<number>(30); 
  
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const minutes = secondsElapsed / 60;

  const [revealedCount, setRevealedCount] = useState(0);

  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [bankedMs, setBankedMs] = useState(0);
  
  const [globalStartTime, setGlobalStartTime] = useState<number | null>(null);
  const [stableSessionStart, setStableSessionStart] = useState<number | null>(null);
  
  const [roomStatus, setRoomStatus] = useState("idle");

  const [gridSize, setGridSize] = useState(2); 
  const [totalLayers, setTotalLayers] = useState(6);

  const blocksPerLayer = gridSize * gridSize;
  const totalSessionBlocks = blocksPerLayer * totalLayers;

  const sortedWorkers = useMemo(() => {
    return [...collaborators].sort((a, b) => a.id.localeCompare(b.id));
  }, [collaborators]);

  const isSessionComplete = totalSessionBlocks > 0 && revealedCount >= totalSessionBlocks;
 
  // Function to leave room and go home
  const handleExitRoom = async () => {
    if (user) {
      await leaveGlobalRoom(user.uid);
      router.push("/");
    }
  };

  useEffect(() => {
    const roomRef = doc(db, "rooms", "global-room");
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setRevealedCount(data.revealedCount || 0); 
        const currentBankedMs = data.accumulatedMs || 0;
        setBankedMs(currentBankedMs); 
        setSecondsElapsed(currentBankedMs / 1000);
        setTotalMinutes(data.totalMinutes || 30);
        setDbShuffledIndices(data.shuffledIndices || []);
        setRoomStatus(data.status || "idle"); 
        if (data.gridSize) setGridSize(data.gridSize);
        if (data.totalLayers) setTotalLayers(data.totalLayers);
        if (data.lastStartTime) {
          setGlobalStartTime(data.lastStartTime.toDate().getTime());
        }
        const sessionAnchor = data.sessionStartedAt || data.lastStartTime;
        if (sessionAnchor) {
          setStableSessionStart(sessionAnchor.toDate().getTime());
        }
      }
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!user || !userData) return;
    updatePresence(user, userData);
    const presenceRef = collection(db, "rooms", "global-room", "presence");
    const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
      const players = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCollaborators(players);
    });
    return () => {
      leaveGlobalRoom(user.uid);
      unsubscribe();
    };
  }, [user, userData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (globalStartTime && roomStatus === "active" && !isSessionComplete) {
      interval = setInterval(() => {
        const now = Date.now();
        const msSinceCheckpoint = now - globalStartTime;
        const workerMultiplier = Math.max(1, sortedWorkers.length);
        const collectiveMs = msSinceCheckpoint * workerMultiplier;
        const totalMs = bankedMs + collectiveMs;
        setSecondsElapsed(totalMs / 1000);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [globalStartTime, bankedMs, sortedWorkers.length, roomStatus, isSessionComplete]);

  const handleBlockComplete = async () => {
    const roomRef = doc(db, "rooms", "global-room");
    await updateDoc(roomRef, {
      revealedCount: revealedCount + 1
    });
  };

  useEffect(() => {
    const savedImage = "test.png";
    const savedTime = localStorage.getItem("studyTime"); 
    if (!savedImage) {
      router.push("/"); 
    } else {
      fetch(savedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const fastUrl = URL.createObjectURL(blob);
          setStudyImage(fastUrl);
        });
      if (savedTime) setTotalMinutes(Number(savedTime));
    }
    return () => {
      if (studyImage && studyImage.startsWith("blob:")) {
        URL.revokeObjectURL(studyImage);
      }
    };
  }, [router]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
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

  useEffect(() => {
    if (isSessionComplete) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#ef4444', '#eab308', '#3b82f6']
      });
      const interval = setInterval(() => {
        confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isSessionComplete]);

  const currentLayerIndex = Math.min(Math.floor(revealedCount / blocksPerLayer), totalLayers - 1);

  if (authLoading || dataLoading || !studyImage) {
    return (
      <main className="min-h-screen bg-app-bg flex items-center justify-center font-space">
        <div className="font-bold text-xl uppercase tracking-widest animate-pulse">Entering Room...</div>
      </main>
    );
  }

  const targetBlocksCount = Math.min(
    Math.floor((secondsElapsed / (totalMinutes * 60)) * totalSessionBlocks),
    totalSessionBlocks
  );
  
  const handleFinishSession = async () => {
    try {
      await deleteDoc(doc(db, "rooms", "global-room"));
      router.push("/"); 
    } catch (error) {
      console.error("Failed to delete room:", error);
      alert("Error ending session. Please try again.");
    }
  };

  const baseLevel = isSessionComplete ? 7 : (currentLayerIndex + 1) as any;
  const topLevel = (currentLayerIndex + 2) as any;

  return (
    <main className="min-h-screen bg-app-bg flex flex-col items-center justify-center transition-colors duration-300">
      
      {/* 1. FIXED UI BUTTONS (Aligned with Home Page) */}
      <div className="absolute top-6 left-6 z-50 flex gap-4">
        {/* EXIT/HOME BUTTON */}
        <button 
          onClick={handleExitRoom}
          className="p-3 bg-app-card border-4 border-app-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-app-text flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>

        {/* THEME TOGGLE BUTTON */}
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-3 bg-app-card border-4 border-app-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-app-text flex items-center justify-center"
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
      </div>

      <div className="relative flex flex-col items-center pb-40">
        <div className="w-[400px] h-[400px] relative shadow-2xl bg-white rounded-2xl border-4 border-neutral-800 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Level imageSrc={studyImage} level={baseLevel} />
          </div>
          <div className="absolute inset-0 z-10">
            <GridRevealMask 
                revealedCount={revealedCount} 
                fullShuffledIndices={dbShuffledIndices}
                gridSize={gridSize}
                currentLayerIndex={currentLayerIndex}
                >
                <Level imageSrc={studyImage} level={topLevel} />
            </GridRevealMask>
          </div>
        </div>

        <Stopwatch 
          secondsElapsed={secondsElapsed} 
          totalMinutes={totalMinutes}
          workerCount={sortedWorkers.length}
          isSessionComplete={isSessionComplete}
          onFinish={handleFinishSession}
          roomStatus={roomStatus}
          revealedCount={revealedCount}
          totalSessionBlocks={totalSessionBlocks}
        />

        {dbShuffledIndices.length > 0 ? (
          sortedWorkers.map((player, index) => (
            <Avatar 
              key={player.id}
              myIndex={index}
              totalWorkers={sortedWorkers.length}
              revealedCount={revealedCount}
              userName={player.username}
              avatarSrc={player.avatar}
              targetBlocksCount={targetBlocksCount}
              shuffledIndices={dbShuffledIndices} 
              gridSize={gridSize}
              onBlockComplete={handleBlockComplete}
              lastSeen={player.lastSeen}
              roomStatus={roomStatus}
              globalStartTime={stableSessionStart}
            />
          ))
        ) : (
          <div className="absolute bottom-20 text-[10px] text-neutral-400 animate-pulse uppercase tracking-widest">
            Connecting to room...
          </div>
        )}

        <Desk topPosition={600} />
      </div>
    </main>
  );
}