"use client";
import React, { useState, useEffect, useMemo } from "react";
import DustCloud from "./DustCloud";

interface AvatarProps {
  isMe: boolean; // NEW: Only the owner of this avatar updates the DB
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
  roomStatus: string;
  globalStartTime: number | null;
}

export default function Avatar({ 
  isMe,
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
  const [isMounted, setIsMounted] = useState(false);

  const homeX = 200 + (myIndex * 45); 
  const homeY = 580;
  const [state, setState] = useState({ x: homeX, y: homeY, facingLeft: false });

  // 1. RELAY LOGIC: Find the next block assigned to THIS avatar
  const myNextTaskIndex = useMemo(() => {
    let k = revealedCount;
    while (k < shuffledIndices.length) {
      if (k % Math.max(1, totalWorkers) === myIndex) return k;
      k++;
    }
    return -1;
  }, [revealedCount, totalWorkers, myIndex, shuffledIndices]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
    const interval = setInterval(tick, 100); 
    return () => clearInterval(interval);
  }, [lastSeen, roomStatus, globalStartTime]);

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

  useEffect(() => {
    if (isBusy) return;
    const idleInterval = setInterval(() => {
      const targetX = Math.random() * 300;
      moveAvatar(targetX, homeY);
    }, 1333); 
    return () => clearInterval(idleInterval);
  }, [isBusy, homeY]);

  // 2. STAGGERED ARTIST LOOP
  useEffect(() => {
    const isBlockDue = targetBlocksCount > myNextTaskIndex && myNextTaskIndex !== -1;
    const isStrictlyMyTurn = revealedCount === myNextTaskIndex;

    if (isBlockDue && isStrictlyMyTurn && !isBusy && shuffledIndices.length > 0) {
      const runArtistLoop = async () => {
        setIsBusy(true);
        const blockIdToReveal = shuffledIndices[myNextTaskIndex];
        if (blockIdToReveal === undefined) { setIsBusy(false); return; }
        
        const target = getCoords(blockIdToReveal);
        
        moveAvatar(target.x, target.y);
        await new Promise(r => setTimeout(r, 666)); 
        await new Promise(r => setTimeout(r, 166)); 
        
        setIsPainting(true);
        await new Promise(r => setTimeout(r, 333)); 
        
        // ONLY the user who owns this avatar triggers the block reveal in the DB
        if (isMe) {
          await onBlockComplete?.();
        }
        
        await new Promise(r => setTimeout(r, 333)); 
        setIsPainting(false);
        await new Promise(r => setTimeout(r, 166)); 
        
        moveAvatar(homeX, homeY);
        await new Promise(r => setTimeout(r, 666)); 
        setIsBusy(false);
      };
      runArtistLoop();
    }
  }, [targetBlocksCount, revealedCount, isBusy, myNextTaskIndex, shuffledIndices, onBlockComplete, homeX, homeY, isMe]);

  return (
    <div 
      className="absolute top-0 left-0 z-50 pointer-events-none flex flex-col items-center"
      style={{ 
        transform: `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%) scale(${isMounted ? 1 : 0})`,
        opacity: isMounted ? 1 : 0,
        transition: "transform 666ms ease-in-out, opacity 666ms ease-in-out",
        willChange: "transform, opacity"
      }}
    >
      <div className="mb-1 flex flex-col items-center gap-0.5">
        <h1 className="text-[12px] font-bold text-neutral-800 uppercase tracking-tighter whitespace-nowrap px-1 rounded bg-white/80 border border-neutral-200 shadow-sm">
          {userName}
        </h1>
        {roomStatus === "active" && (
           <div className="bg-app-accent text-white text-[8px] px-1 font-black rounded shadow-sm">
             {stopwatch}
           </div>
        )}
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
    </div>
  );
}