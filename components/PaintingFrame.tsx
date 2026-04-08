"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PaintingFrameProps {
  src: string;
  alt?: string;
  date?: string;
  themeColor?: string;
  onClick?: () => void;
}

export default function PaintingFrame({ 
  src, 
  alt = "Gallery Item", 
  date, 
  themeColor = "#000",
  onClick
}: PaintingFrameProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative z-20 cursor-pointer"
      style={{ width: "200px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setIsHovered(false); // Keeps the hover state from getting stuck
        if (onClick) onClick();
      }}
    >
      {/* HOVER DATE INDICATOR */}
      <AnimatePresence>
        {isHovered && date && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-8 left-0 w-full text-center pointer-events-none"
            style={{ WebkitFontSmoothing: "antialiased" }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 whitespace-nowrap">
              {date}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* YOUR EXACT ORNATE FRAME DESIGN */}
      <div 
        className="p-4 bg-white border-4 relative shadow-lg active:scale-95 transition-transform"
        style={{ 
          borderColor: themeColor,
          width: "200px",
          height: "240px",
          background: `linear-gradient(145deg, #ac9764, #d8c3a1)`,
          // THE FIX: Locks hardware acceleration so pixels don't shift on hover
          transform: "translateZ(0)",
          backfaceVisibility: "hidden"
        }}
      >
        <div className="w-full h-full border-2 border-black bg-neutral-100 overflow-hidden shadow-inner">
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover"
            // THE FIX: Keeps the image edges perfectly sharp
            style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
          />
        </div>
      </div>
    </div>
  );
}