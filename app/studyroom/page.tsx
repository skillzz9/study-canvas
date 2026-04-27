"use client";
import React, { useState, useEffect, useMemo, Suspense, useRef } from "react";
import confetti from 'canvas-confetti';
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, onSnapshot, collection, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Level from "@/components/Level";
import GridRevealMask from "@/components/GridRevealMask";
import Avatar from "@/components/Avatar";
import Stopwatch from "@/components/Stopwatch";
import Desk from "@/components/Desk";
import { useAuth } from "@/context/AuthContext";
import { getUserDocument } from "@/lib/userService";
import { UserProfile } from "@/types";
import { updatePresence, leaveGlobalRoom, createRoom, joinRoom } from "@/lib/roomService";

function StudyRoomContent() {
  const router = useRouter();
  // USING SEARCH PARAMETERS FOR STUDY ROOM 
  // when the user goes to this page, it then reads the URL to see what painting its painting and for how long
  const searchParams = useSearchParams();
  // FOR GATHERING USER DATA FROM AUTH
  const { user, loading: authLoading } = useAuth();

  // tells if the avatar on the screen has to go next. 
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  
  // Uses search params to get data (need to change this to get from database instead)
  const paintingId = searchParams.get("paintingId");
  const goalMinutes = searchParams.get("goal");

  // GATHERING USER DATA FROM FIRESTORE
  const [userData, setUserData] = useState<UserProfile | null>(null);

  // THE LIST OF JOBS (or blocks to draw)
  const [dbShuffledIndices, setDbShuffledIndices] = useState<number[]>([]);
  // STUDY IMAGE ITSELF (THE PATH TO THE STUDY IMAGE)
  const [studyImage, setStudyImage] = useState<string | null>(null);


  // how many minutes for the current session
  const [totalMinutes, setTotalMinutes] = useState<number>(Number(goalMinutes) || 60); 
  // how many hours are needed for the painting to be done
  const [targetHours, setTargetHours] = useState<number>(10);
  // how many seconds have elapsed in the current session for the UI of the stopwatch 
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  // helps with if someone leaves the room  
  const [bankedMs, setBankedMs] = useState(0);

  // how many blocks have been revealed so far
  const [revealedCount, setRevealedCount] = useState(0);
  // how many avatars there are in the session
  const [collaborators, setCollaborators] = useState<any[]>([]);

  const [globalStartTime, setGlobalStartTime] = useState<number | null>(null);
  const [stableSessionStart, setStableSessionStart] = useState<number | null>(null);
  const [roomStatus, setRoomStatus] = useState("idle"); 
  const [gridSize, setGridSize] = useState(6); 
  const [totalLayers, setTotalLayers] = useState(5); 
  const [sessionBaseMs, setSessionBaseMs] = useState(0);
  const [sessionBaseBlocks, setSessionBaseBlocks] = useState(0);

  // BLOCK LOGIC
  const blocksPerLayer = gridSize * gridSize;
  const totalSessionBlocks = blocksPerLayer * totalLayers;

  // other boring variables that are self explanitory
  const [dataLoading, setDataLoading] = useState(true);
  const hasInitialized = useRef(false); 

  //  SORTS THE AVATARS CURRENTLY IN THE 
const sortedWorkers = useMemo(() => {
  return [...collaborators].sort((a, b) => a.id.localeCompare(b.id));
}, [collaborators]);

  const isSessionComplete = totalSessionBlocks > 0 && revealedCount >= totalSessionBlocks;

useEffect(() => {
    if (authLoading || !user || !paintingId || hasInitialized.current) return;

    let isMounted = true;
    let unsubscribePresence: (() => void) | null = null;

    const initializeRoom = async () => {
  if (hasInitialized.current) return;
  hasInitialized.current = true;

  try {
    const profile = await getUserDocument(user.uid);
    setUserData(profile);

    // 1. Peek at the room first (Non-transactional)
    const roomSnap = await getDoc(doc(db, "paintings", paintingId));
    const roomData = roomSnap.data();

    // 2. Decide: Create or Join?
    // If numOfAvatars is 0, null, or document doesn't exist, we start fresh.
    if (!roomSnap.exists() || !roomData?.numOfAvatars || roomData.numOfAvatars === 0) {
      await createRoom(
        user.uid,
        paintingId,
        totalMinutes,
        gridSize,
        totalLayers
      );
    } else {
      await joinRoom(user.uid, paintingId, totalMinutes);
    }

    // 3. Setup Presence
    await updatePresence(user, profile, paintingId, true);
    
    const presenceRef = collection(db, "paintings", paintingId, "presence");
    unsubscribePresence = onSnapshot(presenceRef, (snapshot) => {
      const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCollaborators(players);
    });

  } catch (error) {
    console.error("Room Handshake Failed:", error);
    // Even if it fails, let the user see the room (they might be able to spectate)
  } finally {
    setDataLoading(false); // <--- CRITICAL: This un-sticks the UI
  }
};

    initializeRoom();

    return () => {
      isMounted = false;
      hasInitialized.current = false;
      leaveGlobalRoom(user.uid, paintingId);
      if (unsubscribePresence) unsubscribePresence();
    };
  }, [user, authLoading, paintingId]);

  useEffect(() => {
    if (!paintingId) return;
    const unsubscribe = onSnapshot(doc(db, "paintings", paintingId), (snapshot) => {

      // SETTING EVERYTHING LOCALLY TO USE
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
        setCurrentTurnIndex(data.currentTurnIndex || 0);
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

  // WHEN A BLOCK HAS BEEN COMPLETED
const handleBlockComplete = async () => {
  if (!paintingId) return;
  
  const paintingRef = doc(db, "paintings", paintingId);
  
  // Calculate the next person in line
  const nextPointer = (currentTurnIndex + 1) % Math.max(1, sortedWorkers.length);

  try {
    await updateDoc(paintingRef, {
      revealedBlocks: increment(1), // Move the painting forward
      currentTurnIndex: nextPointer  // Move the "Turn" forward
    });
  } catch (e) {
    console.error("Shift failed:", e);
  }
};

  const currentLayerIndex = Math.min(Math.floor(revealedCount / blocksPerLayer), totalLayers - 1); // figuring out what layer we are at 
  const baseLevel = isSessionComplete ? 6 : (currentLayerIndex + 1); // what layer is underneath
  const topLevel = (currentLayerIndex + 2); // what layer is being drawn

  // loading logic
  if (authLoading || dataLoading || !studyImage || dbShuffledIndices.length === 0) {
    return (
      <main className="min-h-screen bg-app-bg flex items-center justify-center font-space">
        <div className="font-bold text-xl uppercase tracking-widest animate-pulse">Entering Studio...</div>
      </main>
    );
  }

  const sessionTotalSeconds = totalMinutes * 60;
  const secondsPerBlock = sessionTotalSeconds / Math.max(1, totalSessionBlocks);
  
  const sessionSeconds = roomStatus === "idle" ? 0 : Math.max(0, secondsElapsed - (sessionBaseMs / 1000));
  
  // THE CODE THAT TRIGGERS THE AVATARS
  //------------------------------------------------------------------------------------------------------------//
  const targetBlocksCount = Math.min(
    (roomStatus === "idle" ? revealedCount : sessionBaseBlocks) + Math.floor(sessionSeconds / secondsPerBlock), 
    totalSessionBlocks
  );
  //------------------------------------------------------------------------------------------------------------//

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
            targetBlocksCount={targetBlocksCount} // what triggers the avatar to move 
            shuffledIndices={dbShuffledIndices} 
            gridSize={gridSize}
            onBlockComplete={handleBlockComplete}
            lastSeen={player.lastSeen}
            roomStatus={roomStatus}
            globalStartTime={stableSessionStart}
            currentTurnIndex={currentTurnIndex}
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