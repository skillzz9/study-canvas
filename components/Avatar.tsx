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
  
  // State for the zoom-in entry effect
  const [isMounted, setIsMounted] = useState(false);

  const homeX = 200 + (myIndex * 45); 
  const homeY = 580;
  const [state, setState] = useState({ x: homeX, y: homeY, facingLeft: false });

  // Trigger zoom effect on mount
useEffect(() => {
  // We wait 100ms to ensure the browser paints the 'scale(0)' state first.
  // This "kickstarts" the CSS transition.
  const timer = setTimeout(() => {
    setIsMounted(true);
  }, 100);

  return () => clearTimeout(timer);
}, []);

  // 1. CONDITIONAL STOPWATCH LOGIC
  useEffect(() => {
    if (roomStatus !== "active" || !globalStartTime || !lastSeen) {
      setStopwatch("00:00:00");
      return;
    }

    const userJoinTime = lastSeen.toDate ? lastSeen.toDate().getTime() : lastSeen;

    const tick = () => {
      const now = Date.now();
      const effectiveStart = Math.max(userJoinTime, globalStartTime);
      const diff = Math.max(0, now - effectiveStart);

      const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");

      setStopwatch(`${h}:${m}:${s}`);
    };

    tick();
    // CHANGED: 1000ms -> 100ms for high-frequency syncing
    const interval = setInterval(tick, 100); 
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

  // 3. IDLE WALKING
  useEffect(() => {
    if (isBusy) return;

    const idleInterval = setInterval(() => {
      const targetX = Math.random() * 300;
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
      
      // 1. Walk to the block
      moveAvatar(target.x, target.y);
      await new Promise(r => setTimeout(r, 2000));
      
      // 2. Short pause before starting
      await new Promise(r => setTimeout(r, 500));
      
      // 3. START PAINTING (Clouds appear)
      setIsPainting(true);
      
      // 4. Wait for 1 second (halfway through the cloud animation)
      await new Promise(r => setTimeout(r, 1000));
      
      // 5. REVEAL THE BLOCK (Happens behind the clouds)
      onBlockComplete?.();
      
      // 6. Wait another 1 second so the clouds stay visible a bit longer
      await new Promise(r => setTimeout(r, 1000));
      
      // 7. STOP PAINTING (Clouds fade out to reveal the block)
      setIsPainting(false);
      
      // 8. Return home
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
        // Logic: Added scale and opacity for the join animation
        transform: `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%) scale(${isMounted ? 1 : 0})`,
        opacity: isMounted ? 1 : 0,
        transition: "transform 2000ms ease-in-out, opacity 2000ms ease-in-out",
        willChange: "transform, opacity"
      }}
    >
      <div className="mb-1 flex flex-col items-center gap-0.5">
        <h1 className="text-[12px] font-bold text-neutral-800 uppercase tracking-tighter whitespace-nowrap px-1 rounded bg-white/80 border border-neutral-200 shadow-sm">
          {userName}
        </h1>
      </div>

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