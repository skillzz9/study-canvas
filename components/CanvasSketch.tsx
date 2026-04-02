"use client";

import React from "react";
import Level from "./Level";

interface CanvasSketchProps {
  imageSrc: string;
  // Adjusted to 1-7 to match the actual levels we built
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7; 
}

export default function CanvasSketch({ imageSrc, level }: CanvasSketchProps) {
  return (
    <div className="relative w-full h-full bg-white">
      <Level imageSrc={imageSrc} level={level} />
    </div>
  );
}