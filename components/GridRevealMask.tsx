"use client";

import React, { useMemo } from "react";

interface GridRevealMaskProps {
  progress: number; // 0 to 100
}

export default function GridRevealMask({ progress }: GridRevealMaskProps) {
  const GRID_SIZE = 20; // 20x20 grid = 400 squares
  const TOTAL_BLOCKS = GRID_SIZE * GRID_SIZE;

  // 1. Generate and Shuffle the Grid ONCE
  // useMemo ensures we only shuffle the deck once when the component first loads.
  // If we didn't use this, the squares would randomize every single frame!
  const shuffledIndices = useMemo(() => {
    const indices = Array.from({ length: TOTAL_BLOCKS }, (_, i) => i);
    
    // Fisher-Yates Shuffle Algorithm
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, []);

  // 2. Calculate how many blocks should be invisible right now
  const blocksToReveal = Math.floor((progress / 100) * TOTAL_BLOCKS);

  return (
    <div 
      className="absolute inset-0 z-50 grid pointer-events-none" 
      style={{ 
        gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
      }}
    >
      {Array.from({ length: TOTAL_BLOCKS }).map((_, index) => {
        // Find out where this specific square ended up in the shuffled deck
        const shufflePosition = shuffledIndices.indexOf(index);
        
        // If its position in the deck is less than our current reveal target, hide it.
        const isRevealed = shufflePosition < blocksToReveal;

        return (
          <div 
            key={index} 
            // bg-white matches your canvas background. 
            // duration-300 makes the squares fade out smoothly rather than blinking off.
            className={`w-full h-full bg-white transition-opacity duration-300 ${
              isRevealed ? "opacity-0" : "opacity-100"
            }`}
          />
        );
      })}
    </div>
  );
}