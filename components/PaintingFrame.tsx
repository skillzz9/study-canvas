"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PaintingFrameProps {
  src: string;
  alt?: string;
  title?: string;
  date?: string;
  themeColor?: string;
}

export default function PaintingFrame({ 
  src, 
  alt = "Gallery Item", 
  title, 
  date, 
  themeColor = "#000" 
}: PaintingFrameProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative z-20"
      style={{ width: "200px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* HOVER DATE INDICATOR */}
      <AnimatePresence>
        {isHovered && date && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-8 left-0 w-full text-center pointer-events-none"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 whitespace-nowrap">
              {date}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THE PLAQUE (Positioned 10px on top of the main frame, centered) */}
      {isHovered && title && (
        <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div
            className="bg-white px-3 py-1 border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] pointer-events-auto whitespace-nowrap"
            style={{ borderColor: themeColor }}
          >
            <p className="text-[10px] font-black uppercase text-neutral-900 leading-none">
              {title}
            </p>
          </div>
        </div>
      )}

      {/* YOUR EXACT ORNATE FRAME DESIGN */}
      <div 
        className="p-4 bg-white border-4 relative shadow-lg"
        style={{ 
          borderColor: themeColor,
          width: "200px",
          height: "240px",
          background: `linear-gradient(145deg, #ac9764, #d8c3a1)` 
        }}
      >
        <div className="w-full h-full border-2 border-black bg-neutral-100 overflow-hidden shadow-inner">
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}