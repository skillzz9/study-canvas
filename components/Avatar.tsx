"use client";

import React, { useState, useEffect } from "react";

interface AvatarProps {
  targetBlocksCount: number;
  shuffledIndices: number[];
  gridSize: number;
  onBlockComplete: () => void;
}

export default function Avatar({ 
  targetBlocksCount, 
  shuffledIndices, 
  gridSize, 
  onBlockComplete 
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

  // Helper to handle moving and flipping at the same time
  const moveAvatar = (newX: number, newY: number) => {
    if (newX < pos.x) setFacingLeft(true);
    else if (newX > pos.x) setFacingLeft(false);
    setPos({ x: newX, y: newY });
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
  }, [isBusy, pos.x]);

  // --- DRAWING LOOP ---
  useEffect(() => {
    if (targetBlocksCount > completedLocally && !isBusy) {
      const nextIndex = shuffledIndices[completedLocally];
      const targetCoords = getCoords(nextIndex);

      const runArtistLoop = async () => {
        setIsBusy(true);

        // 1. Glide towards the coordinate (5s)
        moveAvatar(targetCoords.x, targetCoords.y);
        await new Promise((res) => setTimeout(res, 5000));

        // 2. Stay and paint (3s)
        await new Promise((res) => setTimeout(res, 3000));

        // 3. Reveal the square
        onBlockComplete();

        // 4. Glide back down to the idle zone (2s)
        moveAvatar(200, 580);
        await new Promise((res) => setTimeout(res, 2000));

        setCompletedLocally((prev) => prev + 1);
        setIsBusy(false);
      };

      runArtistLoop();
    }
  }, [targetBlocksCount, completedLocally, isBusy, shuffledIndices, gridSize, pos.x]);

  return (
    <div 
      className="absolute z-50 pointer-events-none transition-all ease-in-out"
      style={{ 
        left: `${pos.x}px`, 
        top: `${pos.y}px`,
        // We combine the centering translate with the horizontal flip
        transform: `translate(-50%, -50%) scaleX(${facingLeft ? -1 : 1})`,
        transitionDuration: isBusy && pos.y < 400 ? "5000ms" : "2000ms" 
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src="/avatar.webp" 
        alt="Artist" 
        // Removed drop-shadow-lg
        className={`w-12 h-12 object-contain ${
          isBusy && pos.y < 400 ? "animate-bounce" : ""
        }`} 
      />
    </div>
  );
}