"use client";
import React from "react";

interface StopwatchProps {
  secondsElapsed: number;
  workerCount: number; 
  isSessionComplete: boolean; 
  onFinish: () => void;       
}

export default function Stopwatch({ 
  secondsElapsed, 
  workerCount, 
  isSessionComplete, 
  onFinish 
}: StopwatchProps) {
  // Time formatting logic
  const hours = String(Math.floor(secondsElapsed / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((secondsElapsed % 3600) / 60)).padStart(2, '0');
  const seconds = String(Math.floor(secondsElapsed % 60)).padStart(2, '0');

  const multiplier = Math.max(1, workerCount);

  return (
    <div className="w-[400px] flex bg-white p-2 rounded-3xl border-4 border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-20 items-center gap-4 justify-center font-space">
      
      {!isSessionComplete ? (
        <>
          {/* LIVE INDICATOR: Replaces the Start/Pause button */}
          <div className="w-20 py-4 border-4 border-neutral-800 rounded-3xl font-bold uppercase bg-green-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs">Live</span>
          </div>
          
          {/* TIME DISPLAY: Synced via props from StudyRoom */}
          <div className="w-48 tabular-nums text-center text-neutral-800 uppercase tracking-widest text-4xl font-bold">
            {hours}:{minutes}:{seconds}
          </div>
          
          {/* SPEED MULTIPLIER: Shows the collective study power */}
          <div 
            className={`w-20 py-4 border-4 border-neutral-800 rounded-3xl font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center
              ${multiplier > 1 ? "bg-blue-500 text-white animate-bounce-short" : "bg-neutral-100 text-neutral-400"}
            `}
          >
            {multiplier}x
          </div>
        </>
      ) : (
        /* END STATE: Swaps content while keeping the 400px container the same */
        <div className="flex flex-1 items-center justify-between px-4 gap-4">
          <div className="flex flex-col">
            <h2 className="text-sm font-black uppercase text-neutral-800 leading-none">Congratulations!</h2>
            <p className="text-[10px] font-bold uppercase text-neutral-400">Session Complete</p>
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