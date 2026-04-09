"use client";
import React from "react";
import { startGlobalRoom } from "@/lib/roomService";

interface StopwatchProps {
  secondsElapsed: number;
  totalMinutes: number; 
  workerCount: number; 
  isSessionComplete: boolean; 
  onFinish: () => void;       
  roomStatus: string; 
  // NEW PROPS: Added to track square progress
  revealedCount: number;
  totalSessionBlocks: number;
}

export default function Stopwatch({ 
  secondsElapsed, 
  totalMinutes,
  workerCount, 
  isSessionComplete, 
  onFinish,
  roomStatus,
  revealedCount,
  totalSessionBlocks
}: StopwatchProps) {
  
  const totalSecondsGoal = totalMinutes * 60;
  const remainingSeconds = Math.max(0, totalSecondsGoal - secondsElapsed);
  
  // 1. UPDATED LOGIC: Fill based on squares, not time
  const progressPercentage = totalSessionBlocks > 0 
    ? Math.min(100, (revealedCount / totalSessionBlocks) * 100) 
    : 0;

  const hours = String(Math.floor(remainingSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(Math.floor(remainingSeconds % 60)).padStart(2, '0');

  const multiplier = Math.max(1, workerCount);

  return (
    <div className="w-[400px] relative overflow-hidden flex bg-white p-2 rounded-3xl border-4 border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-20 items-center gap-4 justify-center font-space">
      
      {/* 2. THE BACKGROUND PROGRESS FILL (Now tied to squares) */}
      <div 
        className="absolute left-0 top-0 bottom-0 bg-blue-500/20 transition-all duration-700 ease-out"
        style={{ width: `${progressPercentage}%` }}
      />

      {/* 3. CONTENT (z-10 ensures text stays on top) */}
      {!isSessionComplete ? (
        <div className="flex items-center gap-4 justify-center z-10 w-full">
          {/* START BUTTON vs LIVE INDICATOR */}
          {roomStatus === "idle" ? (
            <button 
              onClick={() => startGlobalRoom()}
              className="w-20 py-4 border-4 border-neutral-800 rounded-3xl font-bold uppercase bg-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-700 active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center"
            >
              <span className="text-xs">Start</span>
            </button>
          ) : (
            <div className="w-20 py-4 border-4 border-neutral-800 rounded-3xl font-bold uppercase bg-green-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-xs">Live</span>
            </div>
          )}
          
          {/* TIME DISPLAY (Countdown) */}
          <div className="w-48 tabular-nums text-center text-neutral-800 uppercase tracking-widest text-4xl font-bold drop-shadow-sm">
            {hours}:{minutes}:{seconds}
          </div>
          
          {/* SPEED MULTIPLIER */}
          <div 
            className={`w-20 py-4 border-4 border-neutral-800 rounded-3xl font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center
              ${multiplier > 1 ? "bg-blue-500 text-white animate-bounce-short" : "bg-neutral-100 text-neutral-400"}
            `}
          >
            {multiplier}x
          </div>
        </div>
      ) : (
        /* END STATE */
        <div className="flex flex-1 items-center justify-between px-4 gap-4 z-10">
          <div className="flex flex-col">
            <h2 className="text-sm font-black uppercase text-neutral-800 leading-none">Congratulations!</h2>
            <p className="text-[10px] font-bold uppercase text-neutral-400">You completed the masterpiece.</p>
          </div>
          <button 
            onClick={onFinish}
            className="flex-1 py-3 bg-yellow-400 border-4 border-neutral-800 rounded-2xl font-black uppercase text-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}