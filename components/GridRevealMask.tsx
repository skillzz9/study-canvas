"use client";

import React, { useMemo } from "react";

interface GridRevealMaskProps {
  progress: number; 
  children: React.ReactNode;
  gridSize?: number; 
  shuffledIndicesOverride?: number[]; 
}

export default function GridRevealMask({ 
  progress, 
  children, 
  gridSize = 20, 
  shuffledIndicesOverride 
}: GridRevealMaskProps) {
  const TOTAL_BLOCKS = gridSize * gridSize;

  // Use the master list from the parent or fall back to a local one
  const shuffledIndices = useMemo(() => {
    if (shuffledIndicesOverride) return shuffledIndicesOverride;
    
    const indices = Array.from({ length: TOTAL_BLOCKS }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [TOTAL_BLOCKS, shuffledIndicesOverride]);

  // If progress is 0, show nothing
  if (progress <= 0) return <div className="hidden" />;
  
  // If progress is 100, show the whole level
  if (progress >= 100) return <div className="absolute inset-0 z-10 w-full h-full">{children}</div>;

  const blocksToReveal = Math.floor((progress / 100) * TOTAL_BLOCKS);
  const visibleIndices = shuffledIndices.slice(0, blocksToReveal);

  if (visibleIndices.length === 0) return <div className="hidden" />;

  const maskImages: string[] = [];
  const maskSizes: string[] = [];
  const maskPositions: string[] = [];
  
  const w = 100 / gridSize; 
  const h = 100 / gridSize; 

  const getPosition = (abs: number, size: number) => {
    if (size >= 100) return 0;
    return (abs / (100 - size)) * 100;
  };

  for (let index of visibleIndices) {
    const col = index % gridSize;
    const row = Math.floor(index / gridSize);
    const seed = index + 1;

    // Neighbor check for blob merging
    const hasTop = row === 0 || visibleIndices.includes(index - gridSize);
    const hasBottom = row === gridSize - 1 || visibleIndices.includes(index + gridSize);
    const hasLeft = col === 0 || visibleIndices.includes(index - 1);
    const hasRight = col === gridSize - 1 || visibleIndices.includes(index + 1);

    // Corner pinning for organic shapes
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