"use client";

import React, { useState } from "react";
import Level from "@/components/Level";
import GridRevealMask from "@/components/GridRevealMask";

export default function StudyRoomTest() {
  // Slider now represents 6 hours (360 minutes)
  const TOTAL_MINUTES = 360;
  const MINUTES_PER_LEVEL = 60; 
  const GRID_SIZE = 4; // 16 blocks per transition
  
  const [minutes, setMinutes] = useState(0);

  // --- PROGRESSIVE MATH ---
  // 1. Clamp time to ensure it never breaks bounds
  const safeMinutes = Math.min(Math.max(minutes, 0), TOTAL_MINUTES);
  
  // 2. Figure out which of the 6 transitions we are in (0 to 5)
  const transitionIndex = Math.min(Math.floor(safeMinutes / MINUTES_PER_LEVEL), 5);

  // 3. Set the correct levels based on the transition phase
  const baseLevel = (transitionIndex + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const topLevel = (baseLevel + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;

  // 4. Calculate progress strictly for the CURRENT hour
  // If total time is 90 mins, local time is 30 mins into transition 1 (Level 2 to 3)
  const localMinutes = safeMinutes - (transitionIndex * MINUTES_PER_LEVEL);
  const localProgressPercentage = (localMinutes / MINUTES_PER_LEVEL) * 100;

  // Debug math
  const blocksVisible = Math.floor((localProgressPercentage / 100) * (GRID_SIZE * GRID_SIZE));
  const displayHours = Math.floor(safeMinutes / 60);
  const displayMins = safeMinutes % 60;

  const testImage = "/test.png"; // Swap with your actual image path

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 space-y-12 p-8">
      
      {/* 1. THE CANVAS CONTAINER */}
      <div className="w-[400px] h-[400px] relative shadow-2xl bg-white overflow-hidden">
        
        {/* BASE LAYER: The level we are leaving behind */}
        <div className="absolute inset-0 z-0">
          <Level imageSrc={testImage} level={baseLevel} />
        </div>

        {/* REVEAL LAYER: The new level slowly appearing on top */}
        <div className="absolute inset-0 z-10">
          <GridRevealMask progress={localProgressPercentage} gridSize={GRID_SIZE}>
            <Level imageSrc={testImage} level={topLevel} />
          </GridRevealMask>
        </div>

      </div>

      {/* 2. THE 6-HOUR SLIDER */}
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
          max={TOTAL_MINUTES} 
          step="1" 
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full cursor-pointer accent-blue-600"
        />

        {/* Debugging Info */}
        <div className="text-xs text-neutral-500 font-mono space-y-1 mt-4 border-t pt-4">
          <p className="font-bold text-neutral-700">Transition Phase: {baseLevel} to {topLevel}</p>
          <p>Local Hour Progress: {localProgressPercentage.toFixed(1)}%</p>
          <p>Blocks Revealed (Current Hour): {blocksVisible} / 16</p>
        </div>

      </div>
    </div>
  );
}