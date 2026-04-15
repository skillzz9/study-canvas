"use client";
import React from "react";
// 1. DELETE THE ROOM SERVICE IMPORT!

interface StopwatchProps {
  secondsElapsed: number;
  totalMinutes: number; 
  workerCount: number; 
  isSessionComplete: boolean; 
  onFinish: () => void;       
  roomStatus: string; 
  revealedCount: number;
  totalSessionBlocks: number;
  onStart: () => void; // 2. Ensure onStart is in your interface
}

export default function Stopwatch({ 
  secondsElapsed, 
  totalMinutes,
  workerCount, 
  isSessionComplete, 
  onFinish,
  roomStatus,
  revealedCount,
  totalSessionBlocks,
  onStart // 3. Destructure the prop here
}: StopwatchProps) {
  
  // Calculate percentage based on revealed blocks
  const progressPercentage = totalSessionBlocks > 0 
    ? Math.min(100, (revealedCount / totalSessionBlocks) * 100) 
    : 0;

  const displayPercentage = Math.round(progressPercentage);
  const multiplier = Math.max(1, workerCount);

  return (
    <div className="w-[400px] relative overflow-hidden flex bg-app-card p-2 rounded-3xl border-4 border-app-border shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] z-20 items-center gap-4 justify-center font-space transition-colors duration-300">
      
      {/* BACKGROUND PROGRESS FILL */}
      <div 
        className="absolute left-0 top-0 bottom-0 bg-app-accent/20 transition-all duration-700 ease-out"
        style={{ width: `${progressPercentage}%` }}
      />

      {/* CONTENT */}
      {!isSessionComplete ? (
        <div className="flex items-center gap-4 justify-center z-10 w-full">
          {/* START BUTTON vs LIVE INDICATOR */}
          {roomStatus === "idle" ? (
            <button 
              onClick={onStart} // 4. CALL THE PROP HERE INSTEAD OF THE OLD FUNCTION!
              className="w-20 py-4 border-4 border-app-border rounded-3xl font-bold uppercase bg-app-accent text-app-card shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center"
            >
              <span className="text-xs">Start</span>
            </button>
          ) : (
            <div className="w-20 py-4 border-4 border-app-border rounded-3xl font-bold uppercase bg-app-accent text-app-card shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] flex items-center justify-center gap-1.5 transition-colors duration-300">
              <span className="w-2 h-2 bg-app-card rounded-full animate-pulse" />
              <span className="text-xs">Live</span>
            </div>
          )}
          
          {/* PERCENTAGE DISPLAY */}
          <div className="w-48 tabular-nums text-center text-app-text uppercase tracking-widest text-4xl font-bold drop-shadow-sm transition-colors duration-300">
            {displayPercentage}%
          </div>
          
          {/* SPEED MULTIPLIER */}
          <div 
            className={`w-20 py-4 border-4 border-app-border rounded-3xl font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] flex items-center justify-center
              ${multiplier > 1 ? "bg-app-accent text-app-card animate-bounce-short" : "bg-app-bg text-app-accent"}
            `}
          >
            {multiplier}x
          </div>
        </div>
      ) : (
        /* END STATE */
        <div className="flex flex-1 items-center justify-between px-4 gap-4 z-10">
          <div className="flex flex-col">
            <h2 className="text-sm font-black uppercase text-app-text leading-none transition-colors duration-300">Congratulations!</h2>
            <p className="text-[10px] font-bold uppercase text-app-accent transition-colors duration-300">You completed the masterpiece.</p>
          </div>
          <button 
            onClick={onFinish}
            className="flex-1 py-3 bg-app-accent border-4 border-app-border rounded-2xl font-black uppercase text-app-card shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}