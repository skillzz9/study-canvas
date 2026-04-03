"use client";

import React, { useMemo } from "react";

interface GridRevealMaskProps {
  progress: number; 
  children: React.ReactNode;
  gridSize?: number; 
}

export default function GridRevealMask({ progress, children, gridSize = 4 }: GridRevealMaskProps) {
  const TOTAL_BLOCKS = gridSize * gridSize;

  const shuffledIndices = useMemo(() => {
    const indices = Array.from({ length: TOTAL_BLOCKS }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [TOTAL_BLOCKS]);

  if (progress <= 0) return <div className="hidden" />;
  if (progress >= 100) return <div className="absolute inset-0 z-10 w-full h-full">{children}</div>;

  const blocksToReveal = Math.floor((progress / 100) * TOTAL_BLOCKS);
  const visibleIndices = shuffledIndices.slice(0, blocksToReveal);

  if (visibleIndices.length === 0) return <div className="hidden" />;

  const maskImages: string[] = [];
  const maskSizes: string[] = [];
  const maskPositions: string[] = [];
  const maskRepeats: string[] = [];

  const w = 100 / gridSize; 
  const h = 100 / gridSize; 

  const getPosition = (absolute: number, size: number) => {
    if (size >= 100) return 0;
    return (absolute / (100 - size)) * 100;
  };

  const addMaskLayer = (image: string, absX: number, absY: number, sizeX: number, sizeY: number) => {
    const posX = getPosition(absX, sizeX);
    const posY = getPosition(absY, sizeY);
    maskImages.push(image);
    maskSizes.push(`${sizeX}% ${sizeY}%`);
    maskPositions.push(`${posX}% ${posY}%`);
    maskRepeats.push("no-repeat");
  };

  for (let index of visibleIndices) {
    const col = index % gridSize;
    const row = Math.floor(index / gridSize);
    const seed = index + 1; // Used to generate unique, predictable squiggles per block

    // 1. NEIGHBOR & EDGE CHECKING
    // If the block is on the grid boundary (e.g., row === 0), it automatically counts as having a neighbor
    const hasTop = row === 0 || shuffledIndices.indexOf(index - gridSize) < blocksToReveal;
    const hasBottom = row === gridSize - 1 || shuffledIndices.indexOf(index + gridSize) < blocksToReveal;
    const hasLeft = col === 0 || shuffledIndices.indexOf(index - 1) < blocksToReveal;
    const hasRight = col === gridSize - 1 || shuffledIndices.indexOf(index + 1) < blocksToReveal;

    const o = 1; // 1% overlap to prevent any hairline rendering cracks

    // 2. CORNER PINNING
    // If a corner touches a connected neighbor, it snaps to the exact grid corner (0 or 100).
    // If it touches empty space, it pulls inward (e.g., 12) so it can curve naturally.
    const tlX = hasLeft ? -o : (hasTop ? 0 : 12 + (seed * 7) % 8);
    const tlY = hasTop ? -o : (hasLeft ? 0 : 12 + (seed * 11) % 8);
    
    const trX = hasRight ? 100 + o : (hasTop ? 100 : 88 - (seed * 13) % 8);
    const trY = hasTop ? -o : (hasRight ? 0 : 12 + (seed * 17) % 8);
    
    const brX = hasRight ? 100 + o : (hasBottom ? 100 : 88 - (seed * 19) % 8);
    const brY = hasBottom ? 100 + o : (hasRight ? 100 : 88 - (seed * 23) % 8);
    
    const blX = hasLeft ? -o : (hasBottom ? 0 : 12 - (seed * 29) % 8);
    const blY = hasBottom ? 100 + o : (hasLeft ? 100 : 88 + (seed * 31) % 8);

    // 3. DYNAMIC PATH GENERATION
    let path = `M ${tlX} ${tlY} `;

    // TOP EDGE
    if (hasTop) {
      path += `L ${trX} ${trY} `; // Straight connecting line
    } else {
      // Wobbly outward curve
      const cp1x = 30 + (seed * 37) % 20;
      const cp1y = 2 + (seed * 41) % 6;
      const cp2x = 70 - (seed * 43) % 20;
      const cp2y = 4 + (seed * 47) % 6;
      path += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${trX} ${trY} `;
    }

    // RIGHT EDGE
    if (hasRight) {
      path += `L ${brX} ${brY} `;
    } else {
      const cp1x = 98 - (seed * 53) % 6;
      const cp1y = 30 + (seed * 59) % 20;
      const cp2x = 96 + (seed * 61) % 6;
      const cp2y = 70 - (seed * 67) % 20;
      path += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${brX} ${brY} `;
    }

    // BOTTOM EDGE
    if (hasBottom) {
      path += `L ${blX} ${blY} `;
    } else {
      const cp1x = 70 - (seed * 71) % 20;
      const cp1y = 98 - (seed * 73) % 6;
      const cp2x = 30 + (seed * 79) % 20;
      const cp2y = 96 + (seed * 83) % 6;
      path += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${blX} ${blY} `;
    }

    // LEFT EDGE
    if (hasLeft) {
      path += `L ${tlX} ${tlY} `;
    } else {
      const cp1x = 2 + (seed * 89) % 6;
      const cp1y = 70 - (seed * 97) % 20;
      const cp2x = 4 + (seed * 101) % 6;
      const cp2y = 30 + (seed * 103) % 20;
      path += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tlX} ${tlY} `;
    }

    path += "Z";

    // 4. INJECT INTO CSS
    const encodedSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='${path}' fill='black'/%3E%3C/svg%3E`;
    
    addMaskLayer(`url("${encodedSVG}")`, col * w, row * h, w, h);
  }

  const maskStyle = {
    WebkitMaskImage: maskImages.join(", "),
    WebkitMaskSize: maskSizes.join(", "),
    WebkitMaskPosition: maskPositions.join(", "),
    WebkitMaskRepeat: maskRepeats.join(", "),
    maskImage: maskImages.join(", "),
    maskSize: maskSizes.join(", "),
    maskPosition: maskPositions.join(", "),
    maskRepeat: maskRepeats.join(", "),
  };

  return (
    <div className="absolute inset-0 z-10 w-full h-full" style={maskStyle}>
      {children}
    </div>
  );
}