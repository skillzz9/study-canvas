"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Level from "@/components/Level";
import GridRevealMask from "@/components/GridRevealMask";
import Avatar from "@/components/Avatar";

export default function StudyRoom() {
  const router = useRouter();
  const [studyImage, setStudyImage] = useState<string | null>(null);
  const [totalMinutes, setTotalMinutes] = useState<number>(360);
  const [minutes, setMinutes] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);

  const GRID_SIZE = 4;
  const TOTAL_BLOCKS = GRID_SIZE * GRID_SIZE;

  const shuffledIndices = useMemo(() => {
    const indices = Array.from({ length: TOTAL_BLOCKS }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [TOTAL_BLOCKS]);

  useEffect(() => {
    const savedImage = localStorage.getItem("studyImage");
    const savedTime = localStorage.getItem("studyTime");
    if (!savedImage) router.push("/");
    else {
      setStudyImage(savedImage);
      if (savedTime) setTotalMinutes(Number(savedTime));
    }
  }, [router]);

  if (!studyImage) return null;

  const targetBlocksCount = Math.floor((minutes / totalMinutes) * TOTAL_BLOCKS);
  const MINUTES_PER_LEVEL = totalMinutes / 6;
  const safeMinutes = Math.min(Math.max(minutes, 0), totalMinutes);
  const transitionIndex = Math.min(Math.floor(safeMinutes / MINUTES_PER_LEVEL), 5);
  const baseLevel = (transitionIndex + 1) as any;
  const topLevel = (baseLevel + 1) as any;

  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-8">
      
      {/* THE MASTER CONTAINER: This is the 'Stage' for the Avatar */}
      <div className="relative flex flex-col items-center space-y-12 pb-24">
        
        {/* 1. THE CANVAS */}
        <div className="w-[400px] h-[400px] relative shadow-2xl bg-white rounded-2xl border-4 border-neutral-800 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Level imageSrc={studyImage} level={baseLevel} />
          </div>
          <div className="absolute inset-0 z-10">
            <GridRevealMask 
              progress={(revealedCount / TOTAL_BLOCKS) * 100} 
              gridSize={GRID_SIZE}
              shuffledIndicesOverride={shuffledIndices} 
            >
              <Level imageSrc={studyImage} level={topLevel} />
            </GridRevealMask>
          </div>
        </div>

        {/* 2. THE SLIDER BOX */}
        <div className="w-[400px] bg-white p-8 rounded-3xl border-4 border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-20">
          <input 
            type="range" min="0" max={totalMinutes} step="1" 
            value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full cursor-pointer accent-blue-600"
          />
          <div className="mt-4 text-center font-bold text-neutral-800 uppercase tracking-widest font-mono">
            {Math.floor(minutes / 60)}h {minutes % 60}m
          </div>
        </div>

        {/* 3. THE AVATAR (Now child of the master container) */}
        <Avatar 
        userName="hugo"
          targetBlocksCount={targetBlocksCount}
          shuffledIndices={shuffledIndices}
          gridSize={GRID_SIZE}
          onBlockComplete={() => setRevealedCount(prev => prev + 1)}
        />

      </div>
    </main>
  );
}