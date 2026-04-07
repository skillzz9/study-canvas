"use client";
import React, { useState, useEffect, useMemo } from "react";
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
// For security, gathers who is logged in from the auth
  const { user, loading: authLoading } = useAuth();
  // Gets the actual user data in the firestore. 
  const [userData, setUserData] = useState<UserProfile | null>(null);

  // the global database shuffled indicies 
  const [dbShuffledIndices, setDbShuffledIndices] = useState<number[]>([]);
    // gives me loading state when things are loading 
  const [dataLoading, setDataLoading] = useState(true);

  // Holds the string of the photo that is uploaded.
  const [studyImage, setStudyImage] = useState<string | null>(null);

  // Holds the value of the time set in the beggining. 
  const [totalMinutes, setTotalMinutes] = useState<number>(30); // Default, will sync from DB
  
  // finds out how much seconds has elapsed
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const minutes = secondsElapsed / 60;

  // shows how many blocks have been revealed.
  const [revealedCount, setRevealedCount] = useState(0);

// FOR MULTIPLAYER TO WORK 
// --------------------------------------------------------------------- //
// the array of profile objects (with username and avatar) in the room
  const [collaborators, setCollaborators] = useState<any[]>([]);
  // number of avatars
  // how much seconds have passed SINCE the last time it was set to active. 
  const [bankedMs, setBankedMs] = useState(0);
  // counts the millsecond the room was most recently became active
  const [globalStartTime, setGlobalStartTime] = useState<number | null>(null);
  // syncs if the room is active or idle
  const [roomStatus, setRoomStatus] = useState("idle");
// --------------------------------------------------------------------- //

  // SYNCED GRID SETTINGS (Replaces hardcoded constants)
  // --------------------------------------------------------------- //
  const [gridSize, setGridSize] = useState(2); 
  const [totalLayers, setTotalLayers] = useState(6);

  // Derived settings based on synced database values
  const blocksPerLayer = gridSize * gridSize;
  const totalSessionBlocks = blocksPerLayer * totalLayers;
  // --------------------------------------------------------------- //

  // getting the same order of workers for everyone (sorting them)
const sortedWorkers = useMemo(() => {
    return [...collaborators].sort((a, b) => a.id.localeCompare(b.id));
  }, [collaborators]);


// CONSOLIDATED SYNCING LOGIC
// --------------------------------------------------------------- //
useEffect(() => {
  const roomRef = doc(db, "rooms", "global-room");
  const unsubscribe = onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      
      // SYNC ALL SETTINGS FROM DB
      setRevealedCount(data.revealedCount || 0); 
      
      // FIX: Capture and set elapsed time immediately from banked data
      // This ensures that idle rooms show the correct time upon entering
      const currentBankedMs = data.accumulatedMs || 0;
      setBankedMs(currentBankedMs); 
      setSecondsElapsed(currentBankedMs / 1000);

      setTotalMinutes(data.totalMinutes || 30);
      setDbShuffledIndices(data.shuffledIndices || []);
      setRoomStatus(data.status || "idle"); // SYNC STATUS
      
      // SYNC DYNAMIC GRID SETTINGS
      if (data.gridSize) setGridSize(data.gridSize);
      if (data.totalLayers) setTotalLayers(data.totalLayers);
      
      if (data.lastStartTime) {
        setGlobalStartTime(data.lastStartTime.toDate().getTime());
      }
    }
  });
  return () => unsubscribe();
}, []);
// --------------------------------------------------------------- //
  
// GETTING ALL THE AVATAR PROFILES STORED LOCALLY 
// --------------------------------------------------------------- //
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
// --------------------------------------------------------------- //

// ADDED ROOMSTATUS CHECK TO INTERVAL
useEffect(() => {
    let interval: NodeJS.Timeout;
    // Only tick the seconds if the room is active and not finished
    if (globalStartTime && roomStatus === "active" && minutes < totalMinutes) {
      interval = setInterval(() => {
        const now = Date.now();
        const msSinceCheckpoint = now - globalStartTime;
        
        // Multiplier: Every 1 real second = (1 * workers) collective seconds
        const workerMultiplier = Math.max(1, sortedWorkers.length);
        const collectiveMs = msSinceCheckpoint * workerMultiplier;
        
        const totalMs = bankedMs + collectiveMs;
        setSecondsElapsed(totalMs / 1000);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [globalStartTime, bankedMs, sortedWorkers.length, roomStatus, minutes, totalMinutes]);

// ADDS THE AMOUNT OF BLOCKS REVEALED TO SERVER
// --------------------------------------------------------------- //
const handleBlockComplete = async () => {
  const roomRef = doc(db, "rooms", "global-room");
  await updateDoc(roomRef, {
    revealedCount: revealedCount + 1
  });
};
// --------------------------------------------------------------- //

// LOADING IMAGE 
// ------------------------------------------------------------------- //
useEffect(() => {
    const savedImage = "test.png"
    const savedTime = localStorage.getItem("studyTime"); 

    if (!savedImage) {
      router.push("/"); 
    } else {
      // convert image to blob URL, makes it load faster.
      fetch(savedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const fastUrl = URL.createObjectURL(blob);
          setStudyImage(fastUrl);
        });

      if (savedTime) setTotalMinutes(Number(savedTime));
    }
    
    // Clean up the Blob URL when the user leaves the room to free up memory
    return () => {
      if (studyImage && studyImage.startsWith("blob:")) {
        URL.revokeObjectURL(studyImage);
      }
    };
  }, [router]);
// ------------------------------------------------------------------- //

// GETTING USER DATA FOR AVATAR
// ------------------------------------------------------------------ //
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
// ------------------------------------------------------------------ //

  // Math for progress based on dynamic database settings
  const currentLayerIndex = Math.min(Math.floor(revealedCount / blocksPerLayer), totalLayers - 1);

// If any of these are loading, then we just dispplay entering room
  if (authLoading || dataLoading || !studyImage) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center font-space">
        <div className="font-bold text-xl uppercase tracking-widest animate-pulse">Entering Room...</div>
      </main>
    );
  }

  // Figures out how many blocks the avatar should have drawn at a certain given time. 
let targetBlocksCount = Math.floor((minutes / totalMinutes) * totalSessionBlocks);

  // Starts the avatar right when the timer starts. 
  if (secondsElapsed > 0) {
  targetBlocksCount = Math.min(targetBlocksCount + 1, totalSessionBlocks);
}
  
// THIS CHANGES THE LEVELS DEPENDING ON THE TIME
// --------------------------------------------------------------- //
// checks end state 
  const isSessionComplete = minutes >= totalMinutes;
  // deletes room after finished
  const handleFinishSession = async () => {
  try {
    // This removes the document from Firestore
    // Because Home.tsx looks for snapshot.exists(), this resets the app for everyone
    await deleteDoc(doc(db, "rooms", "global-room"));
    router.push("/"); 
  } catch (error) {
    console.error("Failed to delete room:", error);
    alert("Error ending session. Please try again.");
  }
};

  // the level underneath thats getting drawn ontop of
  const baseLevel = isSessionComplete ? 7 : (currentLayerIndex + 1) as any;
  // the level above thats getting drawn
  const topLevel = (currentLayerIndex + 2) as any;

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center">
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
  workerCount={sortedWorkers.length}
  isSessionComplete={isSessionComplete}
  onFinish={handleFinishSession}
  roomStatus={roomStatus}
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