"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Level from "@/components/Level";
import GridRevealMask from "@/components/GridRevealMask";
import Avatar from "@/components/Avatar";

export default function StudyRoom() {
  const router = useRouter();
  const [studyImage, setStudyImage] = useState<string | null>(null);
  const [totalMinutes, setTotalMinutes] = useState<number>(30); // Set to 30 for testing
  
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const minutes = secondsElapsed / 60;
  
  const [revealedCount, setRevealedCount] = useState(0);

  // 1. UPDATED CONSTANTS FOR 150 BLOCKS
  const GRID_SIZE = 5;
  const BLOCKS_PER_LAYER = GRID_SIZE * GRID_SIZE; // 25
  const TOTAL_LAYERS = 6;
  const TOTAL_SESSION_BLOCKS = BLOCKS_PER_LAYER * TOTAL_LAYERS; // 150

  const shuffledIndices = useMemo(() => {
    const indices = Array.from({ length: BLOCKS_PER_LAYER }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    // We duplicate the 25 coordinates 6 times so the Avatar has a 
    // continuous path of 150 instructions to follow without crashing.
    return Array(TOTAL_LAYERS).fill(indices).flat();
  }, [BLOCKS_PER_LAYER]);

  useEffect(() => {
    const savedImage = localStorage.getItem("studyImage");
    const savedTime = localStorage.getItem("studyTime");
    if (!savedImage) router.push("/");
    else {
      setStudyImage(savedImage);
      if (savedTime) setTotalMinutes(Number(savedTime));
    }
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && minutes < totalMinutes) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, totalMinutes]);

  if (!studyImage) return null;

  // 2. THE NEW MATH LOGIC
  // Target blocks is now correctly calculated out of 150
  const targetBlocksCount = Math.floor((minutes / totalMinutes) * TOTAL_SESSION_BLOCKS);
  
  // Tie the background levels strictly to the Avatar's physical progress
  const currentLayerIndex = Math.min(Math.floor(revealedCount / BLOCKS_PER_LAYER), TOTAL_LAYERS - 1);
  const baseLevel = (currentLayerIndex + 1) as any;
  const topLevel = (currentLayerIndex + 2) as any;

  // Calculate mask progress for the current layer (resets to 0% every 25 blocks)
  const blocksRevealedInCurrentLayer = revealedCount % BLOCKS_PER_LAYER;
  const maskProgress = (blocksRevealedInCurrentLayer / BLOCKS_PER_LAYER) * 100;

  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-8">
      
      <div className="relative flex flex-col items-center space-y-12 pb-24">
        
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
        <div className="w-[400px] bg-white p-8 rounded-3xl border-4 border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-20 flex flex-col items-center gap-4">
          <div className="text-center font-bold text-neutral-800 uppercase tracking-widest font-mono text-4xl mb-2">
            {String(Math.floor(secondsElapsed / 3600)).padStart(2, '0')}:
            {String(Math.floor((secondsElapsed % 3600) / 60)).padStart(2, '0')}:
            {String(secondsElapsed % 60).padStart(2, '0')}
          </div>
          <button 
            onClick={() => setIsActive(!isActive)}
            className="w-full py-4 border-4 border-neutral-800 font-bold uppercase transition-all bg-blue-500 text-white hover:bg-blue-600"
          >
            {isActive ? "Pause" : "Start"}
          </button>
        </div>

        {/* THE AVATAR */}
        <Avatar 
          userName="Hugo"
          targetBlocksCount={targetBlocksCount}
          shuffledIndices={shuffledIndices}
          gridSize={GRID_SIZE}
          onBlockComplete={() => setRevealedCount(prev => prev + 1)}
        />

      </div>
    </main>
  );
}