"use client";
import React, { useState, useEffect, useMemo, Suspense, useRef } from "react";
import confetti from 'canvas-confetti';
import { useRouter, useSearchParams } from "next/navigation";
// ADDED 'increment' to imports
import { doc, onSnapshot, collection, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Level from "@/components/Level";
import GridRevealMask from "@/components/GridRevealMask";
import Avatar from "@/components/Avatar";
import Stopwatch from "@/components/Stopwatch";
import Desk from "@/components/Desk";
import { useAuth } from "@/context/AuthContext";
import { getUserDocument } from "@/lib/userService";
import { UserProfile } from "@/types";
import { updatePresence, leaveGlobalRoom, joinOrCreateGlobalRoom } from "@/lib/roomService";
import { useTheme } from "next-themes"; 

function StudyRoomContent() {
  const { theme, setTheme } = useTheme(); 
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const hasInitialized = useRef(false); 
  
  const paintingId = searchParams.get("paintingId");
  const goalMinutes = searchParams.get("goal");

  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [dbShuffledIndices, setDbShuffledIndices] = useState<number[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [studyImage, setStudyImage] = useState<string | null>(null);
  const [totalMinutes, setTotalMinutes] = useState<number>(Number(goalMinutes) || 60); 
  const [targetHours, setTargetHours] = useState<number>(10);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [bankedMs, setBankedMs] = useState(0);
  const [globalStartTime, setGlobalStartTime] = useState<number | null>(null);
  const [stableSessionStart, setStableSessionStart] = useState<number | null>(null);
  const [roomStatus, setRoomStatus] = useState("idle"); 
  const [gridSize, setGridSize] = useState(6); 
  const [totalLayers, setTotalLayers] = useState(5); 
  const [sessionBaseMs, setSessionBaseMs] = useState(0);
  const [sessionBaseBlocks, setSessionBaseBlocks] = useState(0);

  const blocksPerLayer = gridSize * gridSize;
  const totalSessionBlocks = blocksPerLayer * totalLayers;

  const sortedWorkers = useMemo(() => {
    return [...collaborators].sort((a, b) => a.id.localeCompare(b.id));
  }, [collaborators]);

  const isSessionComplete = totalSessionBlocks > 0 && revealedCount >= totalSessionBlocks;

  useEffect(() => {
    if (authLoading || !user || !paintingId || hasInitialized.current) return;

    let isMounted = true;
    let unsubscribePresence: (() => void) | null = null;

    const initializeRoom = async () => {
      hasInitialized.current = true;
      try {
        const profile = await getUserDocument(user.uid);
        if (!isMounted) return;
        setUserData(profile);

        // Ensure defaults are passed to avoid 'undefined' database errors
        await joinOrCreateGlobalRoom(
          user.uid,
          paintingId,
          totalSessionBlocks || 180,
          totalMinutes || 60,
          gridSize || 6,
          totalLayers || 5
        );

        await updatePresence(user, profile, paintingId, true);

        const presenceRef = collection(db, "paintings", paintingId, "presence");
        unsubscribePresence = onSnapshot(presenceRef, (snapshot) => {
          const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (isMounted) setCollaborators(players);
        });

      } catch (error) {
        console.error("Initialization Error:", error);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    };

    initializeRoom();

    return () => {
      isMounted = false;
      hasInitialized.current = false;
      leaveGlobalRoom(user.uid, paintingId);
      if (unsubscribePresence) unsubscribePresence();
    };
  }, [user, authLoading, paintingId, totalSessionBlocks, totalMinutes, gridSize, totalLayers]);

  useEffect(() => {
    if (!paintingId) return;
    const unsubscribe = onSnapshot(doc(db, "paintings", paintingId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setRevealedCount(data.revealedBlocks || 0); 
        setDbShuffledIndices(data.shuffledIndices || []);
        setStudyImage(data.imageUrl || "/test.png");
        setTargetHours(data.targetHours || 10);
        setBankedMs(data.accumulatedMs || 0); 
        setSessionBaseMs(data.sessionBaseMs || 0);
        setSessionBaseBlocks(data.sessionBaseBlocks ?? (data.revealedBlocks || 0));
        if (data.status) setRoomStatus(data.status); 
        if (data.lastStartTime) setGlobalStartTime(data.lastStartTime.toDate().getTime());
        const sessionAnchor = data.sessionStartedAt || data.lastStartTime;
        if (sessionAnchor) setStableSessionStart(sessionAnchor.toDate().getTime());
      }
    });
    return () => unsubscribe();
  }, [paintingId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (globalStartTime && (roomStatus === "active" || roomStatus === "in-progress") && !isSessionComplete) {
      interval = setInterval(() => {
        const msSinceCheckpoint = Date.now() - globalStartTime;
        const collectiveMs = (msSinceCheckpoint * 3) * Math.max(1, sortedWorkers.length);
        setSecondsElapsed((bankedMs + collectiveMs) / 1000);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [globalStartTime, bankedMs, sortedWorkers.length, roomStatus, isSessionComplete]);

  // FIX: USE ATOMIC INCREMENT
  const handleBlockComplete = async () => {
    if (!paintingId) return;
    try {
        await updateDoc(doc(db, "paintings", paintingId), {
          revealedBlocks: increment(1)
        });
    } catch (e) {
        console.error("Block sync failed:", e);
    }
  };

  const currentLayerIndex = Math.min(Math.floor(revealedCount / blocksPerLayer), totalLayers - 1);
  const baseLevel = isSessionComplete ? 6 : (currentLayerIndex + 1);
  const topLevel = (currentLayerIndex + 2);

  if (authLoading || dataLoading || !studyImage || dbShuffledIndices.length === 0) {
    return (
      <main className="min-h-screen bg-app-bg flex items-center justify-center font-space">
        <div className="font-bold text-xl uppercase tracking-widest animate-pulse">Entering Studio...</div>
      </main>
    );
  }

  // FIX: CALCULATE SPEED BASED ON SESSION GOAL (totalMinutes)
  const sessionTotalSeconds = totalMinutes * 60;
  const secondsPerBlock = sessionTotalSeconds / Math.max(1, totalSessionBlocks);
  
  const sessionSeconds = roomStatus === "idle" ? 0 : Math.max(0, secondsElapsed - (sessionBaseMs / 1000));
  
  // Avatar target follows the current session progress
  const targetBlocksCount = Math.min(
    (roomStatus === "idle" ? revealedCount : sessionBaseBlocks) + Math.floor(sessionSeconds / secondsPerBlock), 
    totalSessionBlocks
  );

  return (
    <main className="min-h-screen bg-app-bg flex flex-col items-center justify-center transition-colors duration-300">
      <div className="absolute top-6 left-6 z-50 flex gap-4">
        <button onClick={() => router.push("/")} className="p-3 bg-app-card border-4 border-app-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-app-text">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </button>
      </div>

      <div className="relative flex flex-col items-center pb-40">
        <div className="w-[400px] h-[400px] relative shadow-2xl bg-white rounded-2xl border-4 border-neutral-800 overflow-hidden">
          <div className="absolute inset-0 bg-[#F5F5F5]">
            <Level imageSrc={studyImage} level={baseLevel as any} />
          </div>
          <div className="absolute inset-0 z-10">
            <GridRevealMask 
                revealedCount={revealedCount} 
                fullShuffledIndices={dbShuffledIndices}
                gridSize={gridSize}
                currentLayerIndex={currentLayerIndex}
            >
                <Level imageSrc={studyImage} level={topLevel as any} />
            </GridRevealMask>
          </div>
        </div>

        <Stopwatch 
          secondsElapsed={sessionSeconds}
          totalMinutes={totalMinutes}
          workerCount={sortedWorkers.length}
          isSessionComplete={isSessionComplete}
          onFinish={() => router.push("/")}
          onStart={async () => {
             await updateDoc(doc(db, "paintings", paintingId!), {
               status: "active",
               lastStartTime: serverTimestamp(),
               sessionStartedAt: serverTimestamp(),
               sessionBaseMs: bankedMs,
               sessionBaseBlocks: revealedCount 
             });
          }} 
          roomStatus={roomStatus}
          revealedCount={revealedCount}
          totalSessionBlocks={totalSessionBlocks}
        />

        {sortedWorkers.map((player, index) => (
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
        ))}
        <Desk topPosition={600} />
      </div>
    </main>
  );
}

export default function StudyRoom() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app-bg flex items-center justify-center font-space font-bold uppercase">Loading...</div>}>
      <StudyRoomContent />
    </Suspense>
  );
}