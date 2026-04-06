"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, collection, updateDoc } from "firebase/firestore";
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
  const [totalMinutes, setTotalMinutes] = useState<number>(30); // Set to 30 for testing
  
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
// --------------------------------------------------------------------- //
  // GRID SETTINGS
  // --------------------------------------------------------------- //
  const GRID_SIZE = 2;
  const BLOCKS_PER_LAYER = GRID_SIZE * GRID_SIZE;
  const TOTAL_LAYERS = 6;
  const TOTAL_SESSION_BLOCKS = BLOCKS_PER_LAYER * TOTAL_LAYERS;
    // --------------------------------------------------------------- //

  // getting the same order of workers for everyone (sorting them)
const sortedWorkers = useMemo(() => {
    return [...collaborators].sort((a, b) => a.id.localeCompare(b.id));
  }, [collaborators]);


// SYNCING LOGIC FOR WHEN JOINING 
// --------------------------------------------------------------- //
useEffect(() => {
  const roomRef = doc(db, "rooms", "global-room");
  const unsubscribe = onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      setRevealedCount(data.revealedCount || 0); // syncs how many squares have been revealed
      setBankedMs(data.accumulatedMs || 0); // syncs the stopwatch
      setTotalMinutes(data.totalMinutes);
      
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

useEffect(() => {
    let interval: NodeJS.Timeout;
    if (globalStartTime) {
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
  }, [globalStartTime, bankedMs, sortedWorkers.length]);

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
  // gathering image from local storage 
    // const savedImage = localStorage.getItem("studyImage"); 
    const savedImage = "test.png"

    // gathering time from local storage 
    const savedTime = localStorage.getItem("studyTime"); 

    // error handling 
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

useEffect(() => {
    const roomRef = doc(db, "rooms", "global-room");
    const unsubscribe = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setDbShuffledIndices(data.shuffledIndices || []);
        setRevealedCount(data.revealedCount || 0);
        setBankedMs(data.accumulatedMs || 0);
        if (data.lastStartTime) {
            setGlobalStartTime(data.lastStartTime.toDate().getTime());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // checks what layer we are currently on. example of 5x5 grid, once it reaches 25 blocks, that means the first layer is completed and we switch levels
  const currentLayerIndex = Math.min(Math.floor(revealedCount / BLOCKS_PER_LAYER), TOTAL_LAYERS - 1);

// If any of these are loading, then we just dispplay entering room
  if (authLoading || dataLoading || !studyImage) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center font-space">
        <div className="font-bold text-xl uppercase tracking-widest animate-pulse">Entering Room...</div>
      </main>
    );
  }


  // Figures out how many blocks the avatar should have drawn at a certain given time. 
let targetBlocksCount = Math.floor((minutes / totalMinutes) * TOTAL_SESSION_BLOCKS);

  // Starts the avatar right when the timer starts. 
  if (secondsElapsed > 0) {
  targetBlocksCount = Math.min(targetBlocksCount + 1, TOTAL_SESSION_BLOCKS);
}
  


// THIS CHANGES THE LEVELS DEPENDING ON THE TIME
// --------------------------------------------------------------- //
// checks end state 
  const isSessionComplete = revealedCount >= TOTAL_SESSION_BLOCKS;

  // the level underneath thats getting drawn ontop of, if the session is complete, then show level 7 as the base.  
  const baseLevel = isSessionComplete ? 7 : (currentLayerIndex + 1) as any;
  // the level above thats getting drawn
  const topLevel = (currentLayerIndex + 2) as any;

  // Shows how many blocks have been revelaed for that layer 
  const blocksRevealedInCurrentLayer = revealedCount % BLOCKS_PER_LAYER;

  // Represents the progress in terms of a percentage.
  const maskProgress = (blocksRevealedInCurrentLayer / BLOCKS_PER_LAYER) * 100;
  // --------------------------------------------------------------- //

  console.log(dbShuffledIndices)

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
                gridSize={GRID_SIZE}
                currentLayerIndex={currentLayerIndex}
                >
                <Level imageSrc={studyImage} level={topLevel} />
            </GridRevealMask>
          </div>
        </div>

        <Stopwatch 
  secondsElapsed={secondsElapsed} 
  workerCount={sortedWorkers.length} 
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
      shuffledIndices={dbShuffledIndices} // Now guaranteed to have data
      gridSize={GRID_SIZE}
      onBlockComplete={handleBlockComplete}
    />
  ))
) : (
  // Optional: show a small loading indicator where the avatars will be
  <div className="absolute bottom-20 text-[10px] text-neutral-400 animate-pulse uppercase tracking-widest">
    Connecting to room...
  </div>
)}

        <Desk topPosition={600} />
      </div>
    </main>
  );
}