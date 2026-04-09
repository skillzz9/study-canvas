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
  lastSeen: any;
  roomStatus: string;         // "active" or "idle"
  globalStartTime: number | null; // ms timestamp from DB
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
  lastSeen,
  roomStatus,
  globalStartTime
}: AvatarProps) {
  
  const [isBusy, setIsBusy] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const [stopwatch, setStopwatch] = useState("00:00:00");
  
  const homeX = 200 + (myIndex * 45); 
  const homeY = 580;
  const [state, setState] = useState({ x: homeX, y: homeY, facingLeft: false });

  // 1. CONDITIONAL STOPWATCH LOGIC
  useEffect(() => {
    // If room is not active or data is missing, reset/stop timer
    if (roomStatus !== "active" || !globalStartTime || !lastSeen) {
      setStopwatch("00:00:00");
      return;
    }

    const userJoinTime = lastSeen.toDate ? lastSeen.toDate().getTime() : lastSeen;

    const tick = () => {
      const now = Date.now();
      
      // The timer starts at 0 from whichever happened LATEST: 
      // the room starting OR the user joining.
      const effectiveStart = Math.max(userJoinTime, globalStartTime);
      const diff = Math.max(0, now - effectiveStart);

      const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");

      setStopwatch(`${h}:${m}:${s}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lastSeen, roomStatus, globalStartTime]);

  // 2. MOVEMENT LOGIC
  const moveAvatar = (newX: number, newY: number) => {
    setState(current => ({
      x: newX,
      y: newY,
      facingLeft: newX < current.x ? true : newX > current.x ? false : current.facingLeft
    }));
  };

  const getCoords = (globalIndex: number) => {
    const localIndex = globalIndex % (gridSize * gridSize);
    const col = localIndex % gridSize;
    const row = Math.floor(localIndex / gridSize);
    const blockSize = 400 / gridSize;
    return { x: col * blockSize + blockSize / 2, y: row * blockSize + blockSize / 2 };
  };

  // 3. IDLE WALKING (Wide Range: Middle 400px +- 250px)
useEffect(() => {
  if (isBusy) return;

  const idleInterval = setInterval(() => {
    // 1. Pick a random absolute position on the desk surface
    // Math: MinValue + (Random * TotalRange)
    // 150 + (Math.random() * 500) results in a number between 150 and 650
    const targetX = Math.random() * 300;

    // 2. Just move there
    moveAvatar(targetX, homeY);
  }, 4000);

  return () => clearInterval(idleInterval);
}, [isBusy, homeY]);

  // 4. ARTIST LOOP
  useEffect(() => {
    const isJobAvailable = targetBlocksCount > revealedCount;
    const isMyTurn = revealedCount % Math.max(1, totalWorkers) === myIndex;

    if (isJobAvailable && isMyTurn && !isBusy && shuffledIndices.length > 0) {
      const runArtistLoop = async () => {
        setIsBusy(true);
        const nextGlobalIndex = shuffledIndices[revealedCount];
        if (nextGlobalIndex === undefined) { setIsBusy(false); return; }
        
        const target = getCoords(nextGlobalIndex);
        moveAvatar(target.x, target.y);
        await new Promise(r => setTimeout(r, 2000));
        await new Promise(r => setTimeout(r, 500));
        setIsPainting(true);
        await new Promise(r => setTimeout(r, 2000));
        onBlockComplete?.();
        setIsPainting(false);
        await new Promise(r => setTimeout(r, 500));
        moveAvatar(homeX, homeY);
        await new Promise(r => setTimeout(r, 2000));
        setIsBusy(false);
      };
      runArtistLoop();
    }
  }, [targetBlocksCount, revealedCount, isBusy, myIndex, totalWorkers, shuffledIndices]);

  return (
    <div 
      className="absolute top-0 left-0 z-50 pointer-events-none flex flex-col items-center"
      style={{ 
        transform: `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%)`,
        transition: "transform 2000ms ease-in-out",
        willChange: "transform"
      }}
    >
      {/* USERNAME & STOPWATCH (Stationary text) */}
      <div className="mb-1 flex flex-col items-center gap-0.5">
        <h1 className="text-[12px] font-bold text-neutral-800 uppercase tracking-tighter whitespace-nowrap px-1 rounded bg-white/80 border border-neutral-200 shadow-sm">
          {userName}
        </h1>
      </div>

      {/* AVATAR & TOOLS (Flippable graphics) */}
      <div className="relative" style={{ transform: `scaleX(${state.facingLeft ? -1 : 1})` }}>
        {isPainting && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <DustCloud cellSize={100} />
          </div>
        )}
        <img 
          src="/paintbrush.png" 
          className={`absolute -top-3 -left-3 w-6 h-6 object-contain transition-opacity duration-300 z-10 ${isBusy ? "opacity-100" : "opacity-0"}`}
        />
        <img 
          src={avatarSrc} 
          className={`w-17 h-17 object-contain ${isBusy && state.y < 450 ? "animate-bounce" : ""}`} 
        />
      </div>
                      <span className="text-[12px] font-mono font-bold text-neutral-500 bg-white/60 px-1 rounded tabular-nums">
          {stopwatch}
        </span>
    </div>
  );
}