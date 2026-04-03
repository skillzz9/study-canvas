"use client";

import React, { useMemo } from "react";

interface GridRevealMaskProps {
  progress: number; // 0 to 100 percentage
  children: React.ReactNode;
  gridSize?: number; // E.g., 4 for a 4x4 grid
}

export default function GridRevealMask({ progress, children, gridSize = 4 }: GridRevealMaskProps) {
  const TOTAL_BLOCKS = gridSize * gridSize;

  // Shuffle the 16 indices once on mount
  const shuffledIndices = useMemo(() => {
    const indices = Array.from({ length: TOTAL_BLOCKS }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [TOTAL_BLOCKS]);

  // If progress is 0, completely hide this layer
  if (progress <= 0) return <div className="hidden" />;
  
  // If progress is 100%, show everything (no mask needed)
  if (progress >= 100) return <div className="w-full h-full absolute inset-0 z-10">{children}</div>;

  // Calculate how many of the 16 blocks should be visible
  const blocksToReveal = Math.floor((progress / 100) * TOTAL_BLOCKS);
  const visibleIndices = shuffledIndices.slice(0, blocksToReveal);

  if (visibleIndices.length === 0) return <div className="hidden" />;

  // --- PURE CSS MASK GENERATION ---
  // This builds a multi-part CSS mask without relying on brittle SVG IDs.
  const maskImage = visibleIndices.map(() => "linear-gradient(black, black)").join(", ");
  const maskSize = visibleIndices.map(() => `${100 / gridSize}% ${100 / gridSize}%`).join(", ");
  const maskRepeat = visibleIndices.map(() => "no-repeat").join(", ");
  
  const maskPosition = visibleIndices.map(index => {
    const col = index % gridSize;
    const row = Math.floor(index / gridSize);
    // CSS background/mask position percentage math
    const xPos = gridSize === 1 ? 0 : (col / (gridSize - 1)) * 100;
    const yPos = gridSize === 1 ? 0 : (row / (gridSize - 1)) * 100;
    return `${xPos}% ${yPos}%`;
  }).join(", ");

  const maskStyle = {
    WebkitMaskImage: maskImage,
    WebkitMaskSize: maskSize,
    WebkitMaskPosition: maskPosition,
    WebkitMaskRepeat: maskRepeat,
    maskImage: maskImage,
    maskSize: maskSize,
    maskPosition: maskPosition,
    maskRepeat: maskRepeat,
  };

  return (
    <div className="absolute inset-0 z-10 w-full h-full" style={maskStyle}>
      {children}
    </div>
  );
}