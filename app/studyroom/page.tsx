"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Level from "@/components/Level";
import GridRevealMask from "@/components/GridRevealMask";
import Avatar from "@/components/Avatar";
import Stopwatch from "@/components/Stopwatch";
import Desk from "@/components/Desk";
import { useAuth } from "@/context/AuthContext";
import { getUserDocument } from "@/lib/userService";
import { UserProfile } from "@/types";

export default function StudyRoom() {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Holds the string of the photo that is uploaded.
  const [studyImage, setStudyImage] = useState<string | null>(null);

  // Holds the value of the time set in the beggining. 
  const [totalMinutes, setTotalMinutes] = useState<number>(30); // Set to 30 for testing
  
  // finds out how much seconds has elapsed
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const minutes = secondsElapsed / 60;

  // Turns on and off the stopwatch. 
  const [isActive, setIsActive] = useState(false);
  
  // shows how many blocks have been revealed.
  const [revealedCount, setRevealedCount] = useState(0);

  // GRID SETTINGS
  // --------------------------------------------------------------- //
  const GRID_SIZE = 2;
  const BLOCKS_PER_LAYER = GRID_SIZE * GRID_SIZE;
  const TOTAL_LAYERS = 6;
  const TOTAL_SESSION_BLOCKS = BLOCKS_PER_LAYER * TOTAL_LAYERS;
    // --------------------------------------------------------------- //

  
// SHUFFLING BLOCK NUMBERS - EACH NUMBER REPRESENTS A BLOCK 
// output of this function is a shuffled array of numbers that represent a block
// Shuffled array repeated 6 times so each layer has the same order
// --------------------------------------------------------------- //
  const shuffledIndices = useMemo(() => {
    const indices = Array.from({ length: BLOCKS_PER_LAYER }, (_, i) => i); // create empty container with BLOCKS_PER_LAYER slots [0,1,...,BLOCKES_PER_LAYER - 1]
    // SHUFFLING ALGO
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return Array(TOTAL_LAYERS).fill(indices).flat();
  }, [BLOCKS_PER_LAYER]);
    // --------------------------------------------------------------- //

// LOADING IMAGE 
// ------------------------------------------------------------------- //
useEffect(() => {
  // gathering image from local storage 
    const savedImage = localStorage.getItem("studyImage"); 

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

  // STOP WATCH INCREMENT AND PAUSING LOGIC
  // --------------------------------------------------------------- //
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && minutes < totalMinutes) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, totalMinutes]);

  // --------------------------------------------------------------- //

// GETTING USER DATA FOR AVATAR
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

  // MOVED THIS BELOW ALL HOOKS TO FIX THE "CHANGE IN ORDER OF HOOKS" ERROR
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
  if (isActive || secondsElapsed > 0) {
  targetBlocksCount = Math.min(targetBlocksCount + 1, TOTAL_SESSION_BLOCKS);
}
  


// THIS CHANGES THE LEVELS DEPENDING ON THE TIME
// --------------------------------------------------------------- //
// checks end state 
  const isSessionComplete = revealedCount >= TOTAL_SESSION_BLOCKS;

  // checks what layer we are currently on. example of 5x5 grid, once it reaches 25 blocks, that means the first layer is completed and we switch levels
  const currentLayerIndex = Math.min(Math.floor(revealedCount / BLOCKS_PER_LAYER), TOTAL_LAYERS - 1);

  // the level underneath thats getting drawn ontop of, if the session is complete, then show level 7 as the base.  
  const baseLevel = isSessionComplete ? 7 : (currentLayerIndex + 1) as any;
  // the level above thats getting drawn
  const topLevel = (currentLayerIndex + 2) as any;

  // Shows how many blocks have been revelaed for that layer 
  const blocksRevealedInCurrentLayer = revealedCount % BLOCKS_PER_LAYER;

  // Represents the progress in terms of a percentage.
  const maskProgress = (blocksRevealedInCurrentLayer / BLOCKS_PER_LAYER) * 100;
  // --------------------------------------------------------------- //

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center pb-40">
        
        {/* THE CANVAS */}
        <div className="w-[400px] h-[400px] relative shadow-2xl bg-white rounded-2xl border-4 border-neutral-800 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Level imageSrc={studyImage} level={baseLevel} />
          </div>
          <div className="absolute inset-0 z-10">
            <GridRevealMask 
              progress={maskProgress} 
              gridSize={GRID_SIZE}
              shuffledIndicesOverride={shuffledIndices} 
            >
              <Level imageSrc={studyImage} level={topLevel} />
            </GridRevealMask>
          </div>
        </div>

        {/* THE STOPWATCH BOX */}
        <Stopwatch 
          isActive={isActive} 
          secondsElapsed={secondsElapsed} 
          onToggle={() => setIsActive(!isActive)} 
        />


                <Avatar 
                avatarSrc={userData?.avatar || "/avatars/avatar1.webp"}
          userName={userData?.username || "Hugo"}
          targetBlocksCount={targetBlocksCount}
          shuffledIndices={shuffledIndices}
          gridSize={GRID_SIZE}
          onBlockComplete={() => setRevealedCount(prev => prev + 1)}
        />
        <Desk topPosition={600} />

      </div>
    </main>
  );
}