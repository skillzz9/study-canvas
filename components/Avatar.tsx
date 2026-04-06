"use client";

import React, { useState, useEffect } from "react";

interface AvatarProps {
  targetBlocksCount: number;
  shuffledIndices: number[];
  gridSize: number;
  onBlockComplete?: () => void | Promise<void>;
  userName: string;
  avatarSrc: string;
  xOffset?: number; // Added for multiplayer spacing
}

export default function Avatar({ 
  avatarSrc,
  targetBlocksCount, 
  shuffledIndices, 
  gridSize, 
  onBlockComplete,
  userName,
  xOffset = 0, // Default to 0 if not provided
}: AvatarProps) {
  
  const [completedLocally, setCompletedLocally] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [pos, setPos] = useState({ x: 200, y: 580 }); 
  const [facingLeft, setFacingLeft] = useState(false);

  const getCoords = (index: number) => {
    const col = index % gridSize;
    const row = Math.floor(index / gridSize);
    const blockSize = 400 / gridSize;
    return {
      x: col * blockSize + blockSize / 2,
      y: row * blockSize + blockSize / 2,
    };
  };

  // Helper to handle moving and flipping
  const moveAvatar = (newX: number, newY: number) => {
    setPos(currentPos => {
      if (newX < currentPos.x) setFacingLeft(false);
      else if (newX > currentPos.x) setFacingLeft(true);
      return { x: newX, y: newY };
    });
  };

  // --- IDLE ROAMING LOGIC ---
  useEffect(() => {
    let idleInterval: NodeJS.Timeout;

    if (!isBusy) {
      idleInterval = setInterval(() => {
        const randomX = 50 + Math.random() * 300; 
        moveAvatar(randomX, 580);
      }, 4000); 
    }

    return () => clearInterval(idleInterval);
  }, [isBusy]);

  // --- DRAWING LOOP ---
  useEffect(() => {
    // Removed pos.x dependency to prevent infinite re-triggers
    if (targetBlocksCount > completedLocally && !isBusy) {
      const nextIndex = shuffledIndices[completedLocally];
      if (nextIndex === undefined) return;
      
      const targetCoords = getCoords(nextIndex);

      const runArtistLoop = async () => {
        setIsBusy(true);

        // 1. Flip and glide towards the coordinate (5s)
        moveAvatar(targetCoords.x, targetCoords.y);
        await new Promise((res) => setTimeout(res, 5000));

        // 2. Stay and paint (3s)
        await new Promise((res) => setTimeout(res, 3000));

        // 3. Reveal the square (FIX: Optional chaining for TS safety)
        onBlockComplete?.();

        // 4. Flip and glide back down to the idle zone (2s)
        moveAvatar(200, 580);
        await new Promise((res) => setTimeout(res, 2000));

        setCompletedLocally((prev) => prev + 1);
        setIsBusy(false);
      };

      runArtistLoop();
    }
  }, [targetBlocksCount, completedLocally, isBusy, shuffledIndices, gridSize]);

  return (
    <div 
      className="absolute z-50 pointer-events-none flex flex-col items-center"
      style={{ 
        // Use xOffset to prevent avatars from standing on top of each other
        left: `${pos.x + xOffset}px`, 
        top: `${pos.y}px`,
        transform: `translate(-50%, -50%) scaleX(${facingLeft ? -1 : 1})`,
        transitionProperty: "left, top",
        transitionDuration: isBusy && pos.y < 400 ? "5000ms" : "2000ms",
        transitionTimingFunction: "ease-in-out"
      }}
    >
      <div 
        className="mb-1"
        style={{ 
          transform: `scaleX(${facingLeft ? -1 : 1})` 
        }}
      >
        <h1 className="text-[10px] font-bold text-neutral-800 uppercase tracking-tighter whitespace-nowrap px-1 rounded bg-white/80 border border-neutral-200">
          {userName}
        </h1>
      </div>

      <div className="relative">
        <img 
          src="/paintbrush.png" 
          alt="Paintbrush" 
          className={`absolute -top-3 -left-3 w-6 h-6 object-contain transition-opacity duration-300 z-10 ${
            isBusy ? "opacity-100" : "opacity-0"
          }`}
        />

        <img 
          src={avatarSrc} 
          alt={userName} 
          className={`w-12 h-12 object-contain ${
            isBusy && pos.y < 400 ? "animate-bounce" : ""
          }`} 
        />
      </div>
    </div>
  );
}