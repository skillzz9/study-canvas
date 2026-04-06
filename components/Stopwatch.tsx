"use client";
import React from "react";

interface StopwatchProps {
  isActive: boolean;
  secondsElapsed: number;
  onToggle: () => void;
}

export default function Stopwatch({ isActive, secondsElapsed, onToggle }: StopwatchProps) {
  // We floor all values to strip the decimals coming from the high-frequency sync
  const hours = String(Math.floor(secondsElapsed / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((secondsElapsed % 3600) / 60)).padStart(2, '0');
  const seconds = String(Math.floor(secondsElapsed % 60)).padStart(2, '0');

  return (
    <div className="w-[400px] flex bg-white p-2 rounded-3xl border-4 border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-20 items-center gap-4 justify-center font-space">
      <button 
        onClick={onToggle}
        className="w-20 py-4 border-4 border-neutral-800 rounded-3xl font-bold uppercase transition-all bg-blue-500 text-white hover:bg-blue-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
      >
        {isActive ? "Pause" : "Start"}
      </button>
      
      {/* Tabular-nums keeps the digits from jumping around as they change */}
      <div className="w-48 tabular-nums text-center text-neutral-800 uppercase tracking-widest text-4xl font-bold">
        {hours}:{minutes}:{seconds}
      </div>
      
      <button className="w-20 py-4 border-4 border-neutral-800 rounded-3xl font-bold uppercase transition-all bg-neutral-800 text-white cursor-default">
        1x
      </button>
    </div>
  );
}