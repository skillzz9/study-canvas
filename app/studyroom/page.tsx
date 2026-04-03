"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Level from "@/components/Level";
import GridRevealMask from "@/components/GridRevealMask";

export default function StudyRoomTest() {
  const router = useRouter();
  
  const [studyImage, setStudyImage] = useState<string | null>(null);
  // 1. Create a state to hold the total target time (defaults to 360 fallback)
  const [totalMinutes, setTotalMinutes] = useState<number>(360);
  
  // This is your current simulated progress
  const [minutes, setMinutes] = useState(0);

  const GRID_SIZE = 20; 

  // 2. Load the uploaded image AND the target time on mount
  useEffect(() => {
    const savedImage = localStorage.getItem("studyImage");
    const savedTime = localStorage.getItem("studyTime");

    if (!savedImage) {
      router.push("/");
    } else {
      setStudyImage(savedImage);
      // Grab the time we calculated on the home page and save it to state
      if (savedTime) {
        setTotalMinutes(Number(savedTime));
      }
    }
  }, [router]);

  if (!studyImage) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-neutral-500 font-bold">Loading Canvas...</p>
      </div>
    );
  }

  // --- PROGRESSIVE MATH ---
  // 3. Dynamically calculate the chunk size based on the total time
  const MINUTES_PER_LEVEL = totalMinutes / 6; 

  const safeMinutes = Math.min(Math.max(minutes, 0), totalMinutes);
  const transitionIndex = Math.min(Math.floor(safeMinutes / MINUTES_PER_LEVEL), 5);

  const baseLevel = (transitionIndex + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const topLevel = (baseLevel + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;

  const localMinutes = safeMinutes - (transitionIndex * MINUTES_PER_LEVEL);
  const localProgressPercentage = (localMinutes / MINUTES_PER_LEVEL) * 100;

  const blocksVisible = Math.floor((localProgressPercentage / 100) * (GRID_SIZE * GRID_SIZE));
  const displayHours = Math.floor(safeMinutes / 60);
  const displayMins = safeMinutes % 60;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 space-y-12 p-8">
      
      {/* 1. THE CANVAS CONTAINER */}
      <div className="w-[400px] h-[400px] relative shadow-2xl bg-white overflow-hidden">
        
        {/* BASE LAYER */}
        <div className="absolute inset-0 z-0">
          <Level imageSrc={studyImage} level={baseLevel} />
        </div>

        {/* REVEAL LAYER */}
        <div className="absolute inset-0 z-10">
          <GridRevealMask progress={localProgressPercentage} gridSize={GRID_SIZE}>
            <Level imageSrc={studyImage} level={topLevel} />
          </GridRevealMask>
        </div>

      </div>

      {/* 2. THE SLIDER CONTROLS */}
      <div className="w-[400px] flex flex-col space-y-4 bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        
        <div className="flex justify-between items-end">
          <label className="text-sm font-semibold text-neutral-600">
            Study Timer
          </label>
          <span className="text-xl font-bold text-blue-600">
            {displayHours}h {displayMins}m
          </span>
        </div>
        
        <input 
          type="range" 
          min="0" 
          // 4. Update the max range to respect the new total minutes
          max={totalMinutes} 
          step="1" 
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full cursor-pointer accent-blue-600"
        />

        {/* Debugging Info */}
        <div className="text-xs text-neutral-500 font-mono space-y-1 mt-4 border-t pt-4">
          <p className="font-bold text-neutral-700">Target Time: {totalMinutes} mins</p>
          <p>Transition Phase: {baseLevel} to {topLevel}</p>
          <p>Local Hour Progress: {localProgressPercentage.toFixed(1)}%</p>
          <p>Blocks Revealed (Current Phase): {blocksVisible} / {GRID_SIZE * GRID_SIZE}</p>
        </div>

      </div>
    </div>
  );
}