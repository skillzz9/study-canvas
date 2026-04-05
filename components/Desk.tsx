import React from "react";

interface DeskProps {
  topPosition?: number; 
}

export default function Desk({ topPosition = 520 }: DeskProps) {
  return (
    <div 
      className="absolute z-30 pointer-events-none flex flex-col items-center"
      style={{ top: `${topPosition}px` }} 
    >
      {/* 1. The Table Top */}
      <div className="w-[600px] h-8 bg-amber-700 rounded-t-xl border-b-[6px] border-amber-900 shadow-2xl z-10" />
      
      {/* 2. The Legs Container */}
      <div className="w-[500px] flex justify-between z-0">
        <div className="w-8 h-64 bg-amber-800 shadow-[inset_4px_0_10px_rgba(0,0,0,0.3)] rounded-b-sm" />
        <div className="w-8 h-64 bg-amber-800 shadow-[inset_4px_0_10px_rgba(0,0,0,0.3)] rounded-b-sm" />
      </div>
    </div>
  );
}