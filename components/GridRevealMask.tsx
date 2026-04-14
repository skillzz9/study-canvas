"use client";

import React, { useMemo } from "react";

interface GridRevealMaskProps {
  revealedCount: number;      
  fullShuffledIndices: number[]; 
  gridSize: number; 
  currentLayerIndex?: number; 
  allLayers?: boolean;         
  isStatic?: boolean;          
  children: React.ReactNode;
}

export default function GridRevealMask({ 
  revealedCount, 
  fullShuffledIndices,
  gridSize, 
  currentLayerIndex = 0,
  allLayers = false,
  isStatic = false,
  children 
}: GridRevealMaskProps) {
  const BLOCKS_PER_LAYER = gridSize * gridSize;

  // 1. Determine which indices we actually need to draw
  const visibleIndices = useMemo(() => {
    if (allLayers) {
      // Gallery Mode: Show every block revealed so far across all layers
      return fullShuffledIndices.slice(0, revealedCount);
    } else {
      // Study Room Mode: Only show blocks belonging to the specific active layer
      const layerStart = currentLayerIndex * BLOCKS_PER_LAYER;
      const layerEnd = layerStart + BLOCKS_PER_LAYER;
      return fullShuffledIndices
        .slice(layerStart, layerEnd) 
        .filter((_, index) => (layerStart + index) < revealedCount);
    }
  // FIX: Updated dependency array to only use variables from the outer scope
  }, [fullShuffledIndices, revealedCount, currentLayerIndex, BLOCKS_PER_LAYER, allLayers]);

  // Create a Set for fast neighbor-checking
  const globalRevealedSet = useMemo(() => {
    return new Set(fullShuffledIndices.slice(0, revealedCount));
  }, [fullShuffledIndices, revealedCount]);

  if (visibleIndices.length === 0) return null;
  
  // If the specific layer (or everything) is fully revealed, just show the child
  const totalExpected = allLayers ? (fullShuffledIndices.length) : BLOCKS_PER_LAYER;
  if (!allLayers && visibleIndices.length === totalExpected && revealedCount >= (currentLayerIndex + 1) * BLOCKS_PER_LAYER) {
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
    // Normalizing the index to the 6x6 grid
    const index = rawIndex % BLOCKS_PER_LAYER;
    const col = index % gridSize;
    const row = Math.floor(index / gridSize);
    const seed = index + 1;

    // NEIGHBOR CHECK
    const hasTop = row === 0 || globalRevealedSet.has(rawIndex - gridSize);
    const hasBottom = row === gridSize - 1 || globalRevealedSet.has(rawIndex + gridSize);
    const hasLeft = col === 0 || globalRevealedSet.has(rawIndex - 1);
    const hasRight = col === gridSize - 1 || globalRevealedSet.has(rawIndex + 1);

    // Organic Path Logic
    const tlX = hasLeft ? -1 : 12 + (seed * 7) % 8;
    const tlY = hasTop ? -1 : 12 + (seed * 11) % 8;
    const trX = hasRight ? 101 : 88 - (seed * 13) % 8;
    const trY = hasTop ? -1 : 12 + (seed * 17) % 8;
    const brX = hasRight ? 101 : 88 - (seed * 19) % 8;
    const brY = hasBottom ? 101 : 88 - (seed * 23) % 8;
    const blX = hasLeft ? -1 : 12 - (seed * 29) % 8;
    const blY = hasBottom ? 101 : 88 + (seed * 31) % 8;

    let path = `M ${tlX} ${tlY} `;
    if (hasTop) path += `L ${trX} ${trY} `; else path += `C 30 2, 70 4, ${trX} ${trY} `;
    if (hasRight) path += `L ${brX} ${brY} `; else path += `C 98 30, 96 70, ${brX} ${brY} `;
    if (hasBottom) path += `L ${blX} ${blY} `; else path += `C 70 98, 30 96, ${blX} ${blY} `;
    if (hasLeft) path += `L ${tlX} ${tlY} `; else path += `C 2 70, 4 30, ${tlX} ${tlY} `;
    path += "Z";

    const encodedSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' overflow='visible'%3E%3Cpath d='${path}' fill='black' stroke='black' stroke-width='14' stroke-linejoin='round' /%3E%3C/svg%3E`;
    
    maskImages.push(`url("${encodedSVG}")`);
    maskSizes.push(`${w}% ${h}%`);
    maskPositions.push(`${getPosition(col * w, w)}% ${getPosition(row * h, h)}%`);
  }

  return (
    <div 
      className={`absolute inset-0 z-10 w-full h-full ${!isStatic ? 'transition-all duration-500' : ''}`} 
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