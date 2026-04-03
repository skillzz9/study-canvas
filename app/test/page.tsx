"use client";

import React, { useState } from "react";
import Level from "@/components/Level"; // Make sure this path points to your new Level.tsx
import GridRevealMask from "@/components/GridRevealMask";

export default function StudyRoomTest() {
  // Slider represents minutes: 0 to 60
  const [minutes, setMinutes] = useState(0);
  
  // Convert minutes into a 0-100 percentage for the mask
  const progressPercentage = (minutes / 60) * 100;
  
  // Math check: how many blocks should be visible right now?
  const blocksVisible = Math.floor((progressPercentage / 100) * 16);

  // Put an image path from your public folder here
  const testImage = "/test.png"; 

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 space-y-12 p-8">
      
      {/* 1. THE CANVAS CONTAINER */}
      <div className="w-[400px] h-[400px] relative shadow-2xl bg-white overflow-hidden">
        
        {/* BASE LAYER: Level 1 (Always rendered) */}
        <div className="absolute inset-0 z-0">
          <Level imageSrc={testImage} level={1} />
        </div>

        {/* REVEAL LAYER: Level 2 (Masked) */}
        <GridRevealMask progress={progressPercentage} gridSize={4}>
          <Level imageSrc={testImage} level={2} />
        </GridRevealMask>

      </div>

      {/* 2. THE 60-MINUTE SLIDER */}
      <div className="w-[400px] flex flex-col space-y-4 bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        
        <label className="text-sm font-semibold text-neutral-600 flex justify-between">
          <span>Study Timer</span>
          <span>{minutes} / 60 mins</span>
        </label>
        
        <input 
          type="range" 
          min="0" 
          max="60" 
          step="1" // Snaps to whole minutes
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full cursor-pointer accent-blue-600"
        />

        {/* Debugging Info to verify your 3.75 min logic */}
        <div className="text-xs text-neutral-400 font-mono space-y-1 mt-4 border-t pt-4">
          <p>Timer Progress: {progressPercentage.toFixed(1)}%</p>
          <p>Blocks Revealed: {blocksVisible} / 16</p>
          <p>Next block at: {( (blocksVisible + 1) * 3.75 ).toFixed(2)} mins</p>
        </div>

      </div>
    </div>
  );
}