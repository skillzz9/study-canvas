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

export default function StudyRoom() {
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
  
  // globalStartTime is for the collective multiplier logic (shifting)
  const [globalStartTime, setGlobalStartTime] = useState<number | null>(null);
  // stableSessionStart is for the individual avatar stopwatches (fixed)
  const [stableSessionStart, setStableSessionStart] = useState<number | null>(null);
  
  const [roomStatus, setRoomStatus] = useState("idle");

  const [gridSize, setGridSize] = useState(2); 
  const [totalLayers, setTotalLayers] = useState(6);

  const blocksPerLayer = gridSize * gridSize;
  const totalSessionBlocks = blocksPerLayer * totalLayers;

  const sortedWorkers = useMemo(() => {
    return [...collaborators].sort((a, b) => a.id.localeCompare(b.id));
  }, [collaborators]);

  // CONSOLIDATED SYNCING LOGIC
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
        
        // Update the shifting checkpoint for collective time
        if (data.lastStartTime) {
          setGlobalStartTime(data.lastStartTime.toDate().getTime());
        }

        // Update the stable anchor for individual avatar timers
        // We fall back to lastStartTime if the specific session anchor hasn't been set yet
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
    if (globalStartTime && roomStatus === "active" && minutes < totalMinutes) {
      interval = setInterval(() => {
        const now = Date.now();
        // Collective time uses globalStartTime (lastStartTime) to track the current worker set
        const msSinceCheckpoint = now - globalStartTime;
        
        const workerMultiplier = Math.max(1, sortedWorkers.length);
        const collectiveMs = msSinceCheckpoint * workerMultiplier;
        
        const totalMs = bankedMs + collectiveMs;
        setSecondsElapsed(totalMs / 1000);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [globalStartTime, bankedMs, sortedWorkers.length, roomStatus, minutes, totalMinutes]);

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

  const isSessionComplete = minutes >= totalMinutes;

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
      <main className="min-h-screen bg-paper flex items-center justify-center font-space">
        <div className="font-bold text-xl uppercase tracking-widest animate-pulse">Entering Room...</div>
      </main>
    );
  }

  const targetBlocksCount = Math.floor((minutes / totalMinutes) * totalSessionBlocks);


  
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
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center">
      
      <div className="relative flex flex-col items-center pb-40">
                <div className="absolute -top-4 -right-4 z-40 bg-paper border-4 border-neutral-800 px-3 py-1 rounded-xl ">
    <span className="text-sm font-black uppercase text-neutral-800 tabular-nums">
      {totalSessionBlocks > 0 ? Math.round((revealedCount / totalSessionBlocks) * 100) : 0}%
    </span>
  </div>
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
  totalMinutes={totalMinutes} // Make sure to pass this!
  workerCount={sortedWorkers.length}
  isSessionComplete={isSessionComplete}
  onFinish={handleFinishSession}
  roomStatus={roomStatus}
  revealedCount={revealedCount}
  totalSessionBlocks={totalSessionBlocks}
/>
        {/* RENDERING AVATARS */}
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
              // FIXED: Passing stableSessionStart ensures individual timers don't reset
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