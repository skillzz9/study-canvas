import React from "react";

interface StopwatchProps {
  isActive: boolean;
  secondsElapsed: number;
  onToggle: () => void;
}

export default function Stopwatch({ isActive, secondsElapsed, onToggle }: StopwatchProps) {
  // Helper variables to keep the JSX clean
  const hours = String(Math.floor(secondsElapsed / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((secondsElapsed % 3600) / 60)).padStart(2, '0');
  const seconds = String(secondsElapsed % 60).padStart(2, '0');

  return (
    <div className="w-[400px] flex bg-white p-2 rounded-3xl border-4 border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-20 items-center gap-4 justify-center">
      <button 
        onClick={onToggle}
        className="w-20 py-4 border-4 border-neutral-800 font-space rounded-3xl font-bold uppercase transition-all bg-blue-500 text-white hover:bg-blue-600"
      >
        {isActive ? "Pause" : "Start"}
      </button>
      
      {/* THE FIX: Added 'tabular-nums' and a fixed width of 'w-48' */}
      <div className="w-48 tabular-nums text-center font-space text-neutral-800 uppercase tracking-widest text-4xl">
        {hours}:{minutes}:{seconds}
      </div>
      
      <button className="w-20 py-4 border-4 border-neutral-800 font-space rounded-3xl font-bold uppercase transition-all bg-lofi-charcoal text-white">
        1x
      </button>
    </div>
  );
}