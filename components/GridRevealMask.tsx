"use client";

import React, { useMemo } from "react";

interface GridRevealMaskProps {
  progress: number; // 0 to 100 percentage
  children: React.ReactNode;
  gridSize?: number; // E.g., 4 for a 4x4 grid
}

export default function GridRevealMask({ progress, children, gridSize = 4 }: GridRevealMaskProps) {
  const TOTAL_BLOCKS = gridSize * gridSize;

  // Shuffle the indices once on mount
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

  // --- DYNAMIC BORDER-RADIUS CSS MASK GENERATOR ---
  const maskImages: string[] = [];
  const maskSizes: string[] = [];
  const maskPositions: string[] = [];
  const maskRepeats: string[] = [];

  const w = 100 / gridSize; // Width percentage of a single block
  const h = 100 / gridSize; // Height percentage of a single block
  const o = 0.5; // 0.5% overlap bridge to prevent microscopic hairline cracks

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

  // Build the mask shapes block by block
  for (let index of visibleIndices) {
    const col = index % gridSize;
    const row = Math.floor(index / gridSize);

    // NEIGHBOR CHECKING
    const hasTop = row > 0 && shuffledIndices.indexOf(index - gridSize) < blocksToReveal;
    const hasBottom = row < gridSize - 1 && shuffledIndices.indexOf(index + gridSize) < blocksToReveal;
    const hasLeft = col > 0 && shuffledIndices.indexOf(index - 1) < blocksToReveal;
    const hasRight = col < gridSize - 1 && shuffledIndices.indexOf(index + 1) < blocksToReveal;

    // 1. The Base: A rounded rectangle. 
    // CHANGE THE rx='25' VALUE BELOW TO ADJUST THE CURVE.
    // rx='0' is a sharp square, rx='50' is a full circle.
    const encodedSVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='25' fill='black'/%3E%3C/svg%3E";
    const baseShape = `url("${encodedSVG}")`;
    
    addMaskLayer(baseShape, col * w, row * h, w, h);

    const solid = "linear-gradient(black, black)";

    // 2. The Bridges: Sharp rectangles that extend and square off the edges if a neighbor exists
    if (hasTop) {
      addMaskLayer(solid, col * w, row * h - o, w, h / 2 + o);
    }
    if (hasBottom) {
      addMaskLayer(solid, col * w, row * h + h / 2, w, h / 2 + o);
    }
    if (hasLeft) {
      addMaskLayer(solid, col * w - o, row * h, w / 2 + o, h);
    }
    if (hasRight) {
      addMaskLayer(solid, col * w + w / 2, row * h, w / 2 + o, h);
    }
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