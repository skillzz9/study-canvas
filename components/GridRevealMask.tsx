"use client";

import React, { useMemo } from "react";

interface GridRevealMaskProps {
  revealedCount: number;      // Absolute count from Firestore (e.g., 5)
  fullShuffledIndices: number[]; // The full list of 24 indices
  gridSize: number; 
  currentLayerIndex: number;  // Which layer we are currently drawing (0-5)
  children: React.ReactNode;
}

export default function GridRevealMask({ 
  revealedCount, 
  fullShuffledIndices,
  gridSize, 
  currentLayerIndex,
  children 
}: GridRevealMaskProps) {
  const BLOCKS_PER_LAYER = gridSize * gridSize;

  // 1. Figure out which blocks in the master list belong to THIS specific layer
  // For Layer 0: indices 0-3. For Layer 1: indices 4-7.
  const layerStart = currentLayerIndex * BLOCKS_PER_LAYER;
  const layerEnd = layerStart + BLOCKS_PER_LAYER;

  // 2. Determine which blocks are "Visible"
  // We only show blocks that are:
  // a) Part of this layer's window in the master list
  // b) Less than the global revealedCount
  const visibleIndices = useMemo(() => {
    return fullShuffledIndices
      .slice(layerStart, layerEnd) // Get the 4 blocks for this layer
      .filter((_, index) => (layerStart + index) < revealedCount); // Only if they are "done"
  }, [fullShuffledIndices, revealedCount, layerStart, layerEnd]);

  // If no blocks are revealed in this layer yet, hide the level
  if (visibleIndices.length === 0) return null;
  
  // If all 4 blocks are done, show the full level (skip the SVG mask math)
  if (visibleIndices.length === BLOCKS_PER_LAYER) {
    return <div className="absolute inset-0 z-10 w-full h-full">{children}</div>;
  }

  const maskImages: string[] = [];
  const maskSizes: string[] = [];
  const maskPositions: string[] = [];
  
  const w = 100 / gridSize; 
  const h = 100 / gridSize; 

  const getPosition = (abs: number, size: number) => {
    if (size >= 100) return 0;
    return (abs / (100 - size)) * 100;
  };

  for (let rawIndex of visibleIndices) {
    // THE KEY FIX: Use Modulo to map the master index (e.g., 23) 
    // to a 2x2 coordinate (0-3)
    const index = rawIndex % BLOCKS_PER_LAYER;

    const col = index % gridSize;
    const row = Math.floor(index / gridSize);
    const seed = index + 1;

    // Neighbor check (Logic remains same, but uses rawIndex for includes check)
    const hasTop = row === 0 || visibleIndices.includes(rawIndex - gridSize);
    const hasBottom = row === gridSize - 1 || visibleIndices.includes(rawIndex + gridSize);
    const hasLeft = col === 0 || visibleIndices.includes(rawIndex - 1);
    const hasRight = col === gridSize - 1 || visibleIndices.includes(rawIndex + 1);

    // SVG Path Generation (Organic shapes logic remains the same)
    const tlX = hasLeft ? -1 : (hasTop ? 0 : 12 + (seed * 7) % 8);
    const tlY = hasTop ? -1 : (hasLeft ? 0 : 12 + (seed * 11) % 8);
    const trX = hasRight ? 101 : (hasTop ? 100 : 88 - (seed * 13) % 8);
    const trY = hasTop ? -1 : (hasRight ? 0 : 12 + (seed * 17) % 8);
    const brX = hasRight ? 101 : (hasBottom ? 100 : 88 - (seed * 19) % 8);
    const brY = hasBottom ? 101 : (hasRight ? 100 : 88 - (seed * 23) % 8);
    const blX = hasLeft ? -1 : (hasBottom ? 0 : 12 - (seed * 29) % 8);
    const blY = hasBottom ? 101 : (hasLeft ? 100 : 88 + (seed * 31) % 8);

    let path = `M ${tlX} ${tlY} `;
    if (hasTop) path += `L ${trX} ${trY} `;
    else path += `C 30 2, 70 4, ${trX} ${trY} `;
    if (hasRight) path += `L ${brX} ${brY} `;
    else path += `C 98 30, 96 70, ${brX} ${brY} `;
    if (hasBottom) path += `L ${blX} ${blY} `;
    else path += `C 70 98, 30 96, ${blX} ${blY} `;
    if (hasLeft) path += `L ${tlX} ${tlY} `;
    else path += `C 2 70, 4 30, ${tlX} ${tlY} `;
    path += "Z";

    const encodedSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' overflow='visible'%3E%3Cpath d='${path}' fill='black' stroke='black' stroke-width='14' stroke-linejoin='round' /%3E%3C/svg%3E`;
    
    maskImages.push(`url("${encodedSVG}")`);
    maskSizes.push(`${w}% ${h}%`);
    maskPositions.push(`${getPosition(col * w, w)}% ${getPosition(row * h, h)}%`);
  }

  return (
    <div 
      className="absolute inset-0 z-10 w-full h-full" 
      style={{
        WebkitMaskImage: maskImages.join(", "),
        WebkitMaskSize: maskSizes.join(", "),
        WebkitMaskPosition: maskPositions.join(", "),
        WebkitMaskRepeat: "no-repeat",
        maskImage: maskImages.join(", "),
        maskSize: maskSizes.join(", "),
        maskPosition: maskPositions.join(", "),
        maskRepeat: "no-repeat",
      }}
    >
      {children}
    </div>
  );
}