"use client";

import React from "react";

interface SimpleShelfProps {
  theme?: "light" | "dark";
  width?: number; 
}

export default function SimpleShelf({ 
  theme = "dark", 
  width = 230 
}: SimpleShelfProps) {
  const isDark = theme === "dark";

  const colors = {
    wood: isDark ? "bg-[#5e503f]" : "bg-[#a9927d]",
    border: isDark ? "border-[#2d0a11]" : "border-[#5e503f]",
  };

  const SHELF_HEIGHT = 14;

  return (
    <div 
      className="relative flex flex-col items-center flex-shrink-0 select-none pointer-events-none"
      style={{ width: `${width}px`, height: `${SHELF_HEIGHT}px` }}
    >
      {/* THE WOOD BAR */}
      <div 
        className={`w-full h-full ${colors.wood} border-2 ${colors.border} rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-colors duration-500`}
      />
      
      {/* Subtle bottom depth line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/20 rounded-b-sm" />
    </div>
  );
}