"use client";
import React from "react";
import GridRevealMask from "@/components/GridRevealMask";

interface PaintingFrameProps {
  src: string;
  title: string;
  revealedCount: number;
  totalBlocks: number;
  shuffledIndices: number[];
  onClick: () => void;
}

export default function PaintingFrame({ 
  src, 
  title, 
  revealedCount, 
  totalBlocks, 
  shuffledIndices,
  onClick 
}: PaintingFrameProps) {
  
  const percentage = Math.round((revealedCount / totalBlocks) * 100);
  const isBrandNew = revealedCount === 0;

  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      
      {/* 1. HOVER TITLE (TOP) - Plain Text */}
      <div className="absolute -top-6 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20 pointer-events-none">
        <span className="text-[12px] font-black uppercase text-app-text tracking-widest truncate max-w-[240px]">
          {title}
        </span>
      </div>

      {/* 2. CORNER-TO-CORNER WOOD FRAME */}
      {/* Using #5C4033 for a dark walnut wood look. You can change this hex code to make it lighter/darker */}
      <div className="relative w-[240px] h-[240px] border-[14px] border-[#5C4033] bg-app-bg">
        
        {/* CANVAS AREA */}
        <div className="absolute inset-0 bg-app-bg overflow-hidden">
          {isBrandNew ? (
            <div className="w-full h-full flex items-center justify-center bg-app-bg/50 bg-white">
            </div>
          ) : (
            <GridRevealMask 
              revealedCount={revealedCount} 
              gridSize={6} 
              fullShuffledIndices={shuffledIndices}
              isStatic={true} 
              allLayers={true}
            >
              <img src={src} className="w-full h-full object-cover" alt={title} />
            </GridRevealMask>
          )}
        </div>
      </div>

      {/* 3. HOVER PROGRESS (BOTTOM) - Plain Text */}
      <div className="absolute -bottom-6 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0 z-20 pointer-events-none">
        <span className="text-[10px] font-bold uppercase text-app-text tracking-widest">
          {percentage}% Complete
        </span>
      </div>

    </div>
  );
}