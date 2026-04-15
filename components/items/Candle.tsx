"use client";

import React from "react";
import { motion } from "framer-motion";

interface CoolGalleryCandleProps {
  // Option to scale the entire candle assembly
  scaleMultiplier?: number;
}

export default function CoolGalleryCandle({ scaleMultiplier = 1 }: CoolGalleryCandleProps) {
  
  // 1. Define complex, slightly irregular flickering animation keyframes
  const flameVariants = {
    animate: {
      // Irregular opacity changes
      opacity: [0.95, 1, 0.8, 0.97, 0.75, 1],
      
      // Vertical stretching and shrinking
      scaleY: [1, 1.05, 0.98, 1.02, 1, 1.07, 1],
      
      // Horizontal width fluctuations
      scaleX: [1, 0.98, 1.02, 1, 0.99, 1.01, 1],
      
      // Subtle vertical jitter
      y: [0, -1, 0, 1, 0, -2, 0],
      
      // Subtle horizontal angle shifts (wind simulation)
      skewX: [0, -2, 0, 3, 0, -1, 0],
      
      // Random subltle blur changes for realism
      filter: [
        "blur(0.5px)",
        "blur(1px)",
        "blur(0.5px)",
        "blur(1.5px)",
        "blur(0.5px)",
      ],
    },
    transition: {
      duration: 1.2, // Total time for one full 'randomized' loop cycle
      repeat: Infinity, // Loop forever
      ease: "easeInOut", // Makes transitions between keyframes smoother
      repeatType: "loop" as const, // Uses the specified repeatType literal
    },
  };

  // 2. Define animation keyframes for the outer light halo/glow
  const glowVariants = {
    animate: {
      opacity: [0.4, 0.65, 0.5, 0.58, 0.35, 0.4],
      scale: [1, 1.1, 1.05, 1.15, 1, 1.2, 1],
    },
    transition: {
      duration: 1.8, // Slower than the flame itself for atmosphere
      repeat: Infinity,
      ease: "linear",
      repeatType: "loop" as const,
    },
  };

  return (
    <div 
      className="relative flex flex-col items-center select-none"
      style={{ transform: `scale(${scaleMultiplier})` }}
    >
      {/* 3. FLAME ASSEMBLY (Wick + Flame + Glow) */}
      <div className="relative w-8 h-12 flex justify-center items-end -mb-1.5 z-10 origin-bottom">
        
        {/* The intense Inner Flame part (Core) */}
        <motion.div
          className="absolute w-3 h-7 bg-amber-400 rounded-full origin-bottom z-10"
          {...flameVariants}
          style={{
            background: "linear-gradient(to top, #fff3b0 0%, #ffc039 60%, #ff7c1a 100%)",
            boxShadow: "0 0 5px #ffc039, 0 0 10px #ff7c1a",
          }}
        />

        {/* The Outer Flame Halo (Glow Effect) */}
        <motion.div
          className="absolute w-16 h-20 bg-amber-300 rounded-full origin-bottom z-0"
          {...glowVariants}
          style={{
            background: "radial-gradient(circle, rgba(255,243,176,1) 0%, rgba(255,192,57,0.7) 40%, rgba(255,124,26,0) 70%)",
            filter: "blur(12px)",
          }}
        />

        {/* The Wick */}
        <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-0.5 h-3.5 bg-neutral-900 rounded-sm z-[5]" />
      </div>

      {/* 4. CANDLE BODY (Clean Pillar) */}
      <div 
        className="w-7 h-28 bg-neutral-100 rounded-t-sm border border-neutral-200 relative overflow-hidden shadow-md"
        style={{
          background: "linear-gradient(to right, #ffffff 0%, #f4f4f4 50%, #e0e0e0 100%)",
        }}
      >
        {/* Subltle shadows on the wax near the wick */}
        <div className="absolute top-0 left-0 w-full h-2 bg-neutral-900/10 filter blur-[2px]" />
      </div>

      {/* 5. MINIMALIST GALLERY BASE (Sleek Brutalist Design) */}
      {/* Black metal/Concrete assembly */}
      <div className="flex flex-col items-center">
        {/* The holder cup */}
        <div className="w-10 h-3 bg-neutral-900 rounded-t-sm border border-neutral-800 -mb-0.5 shadow-md" />
        {/* The concrete pillar pedestal */}
        <div 
          className="w-14 h-5 bg-neutral-600 rounded-sm border-2 border-app-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
          style={{
            background: "linear-gradient(135deg, #8c8c8c 0%, #666666 100%)",
          }}
        />
      </div>
    </div>
  );
}