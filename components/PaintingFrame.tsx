"use client";
import React from "react";
import GridRevealMask from "@/components/GridRevealMask";
import Level from "@/components/Level"; 

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
  const isFinished = revealedCount >= totalBlocks;

  const gridSize = 6;
  const blocksPerLayer = gridSize * gridSize;
  const totalLayers = Math.floor(totalBlocks / blocksPerLayer); 
  
  const currentLayerIndex = Math.min(Math.floor(revealedCount / blocksPerLayer), totalLayers - 1);
  
  // THE FIX: Base level starts at 1 (the sketch), Top level starts at 2
  const baseLevel = isFinished ? 6 : (currentLayerIndex + 1);
  const topLevel = currentLayerIndex + 2;

  return (
    <div 
      onClick={onClick}
      className="group flex flex-col items-center gap-3 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      
      {/* 1. HOVER TITLE (TOP) */}
      <span className="text-[12px] font-black uppercase text-app-text tracking-widest truncate max-w-[240px] text-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        {title}
      </span>

      {/* 2. CORNER-TO-CORNER WOOD FRAME */}
      <div className="relative w-[240px] h-[240px] border-[14px] border-[#5C4033] bg-app-bg shadow-[4px_4px_10px_rgba(0,0,0,0.1)]">
        
        {/* CANVAS AREA */}
        <div className="absolute inset-0 bg-app-bg overflow-hidden">
          
          {/* BACKGROUND LAYER (The sketch or the last completed layer) */}
          <div className="absolute inset-0 bg-[#F5F5F5] overflow-hidden">
            <Level imageSrc={src} level={baseLevel as any} />
          </div>

          {/* ACTIVE PAINTING LAYER (What the mask is currently revealing) */}
          {!isFinished && (
            <div className="absolute inset-0 z-10">
              <GridRevealMask 
                revealedCount={revealedCount} 
                gridSize={gridSize} 
                fullShuffledIndices={shuffledIndices}
                currentLayerIndex={currentLayerIndex} 
                isStatic={true} 
                allLayers={false} 
              >
                <Level imageSrc={src} level={topLevel as any} />
              </GridRevealMask>
            </div>
          )}

        </div>
      </div>

      {/* 3. HOVER PROGRESS (BOTTOM) */}
      <span className="text-[10px] font-bold uppercase text-app-text tracking-widest text-center opacity-0 group-hover:opacity-60 transition-all duration-300 -translate-y-2 group-hover:translate-y-0">
        {percentage}% Complete
      </span>

    </div>
  );
}