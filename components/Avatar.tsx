"use client";

import React, { useState, useEffect } from "react";
import DustCloud from "./DustCloud";

interface AvatarProps {
  myIndex: number;
  totalWorkers: number;
  revealedCount: number;
  targetBlocksCount: number;
  shuffledIndices: number[];
  gridSize: number;
  onBlockComplete?: () => void | Promise<void>;
  userName: string;
  avatarSrc: string;
}

export default function Avatar({ 
  myIndex,
  totalWorkers,
  revealedCount,
  avatarSrc,
  targetBlocksCount, 
  shuffledIndices, 
  gridSize, 
  onBlockComplete,
  userName,
}: AvatarProps) {
  
  const [isBusy, setIsBusy] = useState(false);
  const homeX = 200 + (myIndex * 45); 
  const homeY = 580;
  
  const [pos, setPos] = useState({ x: homeX, y: homeY }); 
  const [facingLeft, setFacingLeft] = useState(false);

  const [isPainting, setIsPainting] = useState(false);
  // THE CRITICAL FIX: Math.floor and Modulo based on gridSize
  const getCoords = (globalIndex: number) => {
    // Wrap the 0-23 index back into 0-3 for the 2x2 grid
    const localIndex = globalIndex % (gridSize * gridSize);
    
    const col = localIndex % gridSize;
    const row = Math.floor(localIndex / gridSize);
    const blockSize = 400 / gridSize;
    
    return {
      x: col * blockSize + blockSize / 2,
      y: row * blockSize + blockSize / 2,
    };
  };

  const moveAvatar = (newX: number, newY: number) => {
    setPos(currentPos => {
      // Logic from your working example:
      if (newX < currentPos.x) setFacingLeft(false);
      else if (newX > currentPos.x) setFacingLeft(true);
      return { x: newX, y: newY };
    });
  };

  useEffect(() => {
    let idleInterval: NodeJS.Timeout;
    if (!isBusy) {
      idleInterval = setInterval(() => {
        const randomX = (homeX - 15) + Math.random() * 30; 
        moveAvatar(randomX, homeY);
      }, 4000); 
    }
    return () => clearInterval(idleInterval);
  }, [isBusy, homeX]);

  useEffect(() => {
    const isJobAvailable = targetBlocksCount > revealedCount;
    const isMyTurn = revealedCount % Math.max(1, totalWorkers) === myIndex;

    if (isJobAvailable && isMyTurn && !isBusy && shuffledIndices.length > 0) {
      const runArtistLoop = async () => {
        // 1. REVEAL PAINTBRUSH
        setIsBusy(true);

        const nextGlobalIndex = shuffledIndices[revealedCount];
        if (nextGlobalIndex === undefined) {
          setIsBusy(false);
          return;
        }
        
        const targetCoords = getCoords(nextGlobalIndex);

        // 2. GO TO SQUARE (2 seconds)
        moveAvatar(targetCoords.x, targetCoords.y);
        await new Promise((res) => setTimeout(res, 2000));

        // 3. STAY THERE (0.5 seconds)
        await new Promise((res) => setTimeout(res, 500));

        // 4. CLOUD ANIMATION (2 seconds)
        setIsPainting(true);
        await new Promise((res) => setTimeout(res, 2000));

        // 5. REVEAL BLOCK & STAY (0.5 seconds)
        onBlockComplete?.();
        setIsPainting(false);
        await new Promise((res) => setTimeout(res, 500));

        // 6. GO BACK TO TABLE (2 seconds)
        moveAvatar(homeX, homeY);
        await new Promise((res) => setTimeout(res, 2000));

        // 7. UNREVEAL PAINTBRUSH
        setIsBusy(false);
      };

      runArtistLoop();
    }
  }, [targetBlocksCount, revealedCount, isBusy, myIndex, totalWorkers, shuffledIndices]);

  return (
    <div 
      className="absolute z-50 pointer-events-none flex flex-col items-center"
      style={{ 
        left: `${pos.x}px`, 
        top: `${pos.y}px`,
        transform: `translate(-50%, -50%) scaleX(${facingLeft ? -1 : 1})`,
        transitionProperty: "left, top",
        // CRITICAL: Set to 2000ms to match your walk duration
        transitionDuration: "2000ms",
        transitionTimingFunction: "ease-in-out"
      }}
    >
      <div className="mb-1" style={{ transform: `scaleX(${facingLeft ? -1 : 1})` }}>
        <h1 className="text-[10px] font-bold text-neutral-800 uppercase tracking-tighter whitespace-nowrap px-1 rounded bg-white/80 border border-neutral-200">
          {userName}
        </h1>
      </div>

      <div className="relative">
        {isPainting && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <DustCloud cellSize={100} />
          </div>
        )}

        <img 
          src="/paintbrush.png" 
          alt="" 
          className={`absolute -top-3 -left-3 w-6 h-6 object-contain transition-opacity duration-300 z-10 ${isBusy ? "opacity-100" : "opacity-0"}`}
        />
        <img 
          src={avatarSrc} 
          alt="" 
          className={`w-12 h-12 object-contain ${isBusy && pos.y < 400 ? "animate-bounce" : ""}`} 
        />
      </div>
    </div>
  );
}