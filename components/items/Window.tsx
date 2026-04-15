"use client";
import React from "react";
import { motion } from "framer-motion";

interface WindowProps {
  defaultX?: number;
  defaultY?: number;
  theme?: "light" | "dark";
}

export default function Window({ 
  defaultX = 0, 
  defaultY = 0,
  theme = "dark" // Defaulting to your dark palette
}: WindowProps) {
  
  const isDark = theme === "dark";

  // dynamic styles
  const frameBg = isDark ? "bg-[#49111c]" : "bg-[#ffffff]";
  const frameBorder = isDark ? "border-[#5e503f]" : "border-[#a9927d]";
  const sillBg = isDark ? "bg-[#49111c]" : "bg-[#ffffff]";
  
  // The glass outside (gradient overrides academia palette inside the glass only)
  const glassBorder = isDark ? "border-[#5e503f]" : "border-[#a9927d]";
  const skyGradient = isDark ? "from-[#0a0908] to-[#49111c]" : "from-sky-300 to-blue-100";
  const crossbarBg = isDark ? "bg-[#5e503f]" : "bg-[#a9927d]";

  // The brutalist shadows should use the dark Cab Sav color when it exists, otherwise Cod Gray.

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: defaultX, y: defaultY }}
      className="absolute z-10 flex flex-col items-center cursor-grab active:cursor-grabbing font-space"
    >
      {/* Main Window Frame using exact Dark/Light Academia mappings */}
      <div 
        className={`w-[240px] h-[320px] ${frameBg} border-8 ${frameBorder} p-2 relative transition-colors duration-300`}
      >
        
        {/* The Glass / Outside View (conditional content based on theme) */}
        <div className={`w-full h-full border-4 ${glassBorder} bg-gradient-to-b ${skyGradient} relative overflow-hidden flex items-center justify-center transition-colors duration-300`}>
          
          {isDark ? (
            /* --- Moody Night Sky (Dark Academia Particles) --- */
            <>
              {/* Scattered Starlight using text and accent variables */}
              <div className="absolute top-6 left-5 w-1 h-1 bg-[#a9927d] rounded-full opacity-80 transition-colors duration-300" />
              <div className="absolute top-16 left-16 w-1.5 h-1.5 bg-[#a9927d] rounded-full opacity-50 transition-colors duration-300" />
              <div className="absolute bottom-20 left-8 w-1 h-1 bg-[#f2f4f3] rounded-full opacity-70 transition-colors duration-300" />
              <div className="absolute top-10 right-20 w-1 h-1 bg-[#f2f4f3] rounded-full opacity-90 transition-colors duration-300" />
            </>
          ) : (
            /* --- Blue Sky (Light Academia with Cloud) --- */
            <>
              {/* Hidden Cloud (Puffy brutalist cloud, derived from image concept) */}
              <div className="absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 z-1 w-28 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Simplified neo-brutalist cloud (circles and rectangle combined) */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-white border-4 border-app-border rounded-full" />
                <div className="absolute bottom-0 left-3 w-8 h-8 bg-white border-4 border-app-border rounded-full" />
                <div className="absolute -top-1 right-5 w-10 h-10 bg-white border-4 border-app-border rounded-full" />
                <div className="absolute -top-1 left-7 w-8 h-8 bg-white border-4 border-app-border rounded-full" />
              </div>
              
              {/* Scattered particles are intentionally missing in daylight mode for a clean look */}
            </>
          )}
          
          {/* Window Panes (crossbars) using the same border vars */}
          <div className={`absolute top-1/2 left-0 w-full h-3 ${crossbarBg} -translate-y-1/2 transition-colors duration-300`} />
          <div className={`absolute top-0 left-1/2 w-3 h-full ${crossbarBg} -translate-x-1/2 transition-colors duration-300`} />
        </div>
      </div>

      {/* The Window Sill */}
      <div 
        className={`w-[280px] h-6 ${sillBg} border-4 ${frameBorder} mt-1 transition-colors duration-300`} 
      />
    </motion.div>
  );
}