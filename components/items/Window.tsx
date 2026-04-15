"use client";
import React from "react";

interface WindowProps {
  theme?: "light" | "dark";
}

export default function Window({ 
  theme = "dark" 
}: WindowProps) {
  
  const isDark = theme === "dark";

  // Dynamic styles mapped to your Academia palettes
  const frameBg = isDark ? "bg-[#49111c]" : "bg-[#ffffff]";
  const frameBorder = isDark ? "border-[#5e503f]" : "border-[#a9927d]";
  const glassBorder = isDark ? "border-[#5e503f]" : "border-[#a9927d]";
  const skyGradient = isDark ? "from-[#0a0908] to-[#49111c]" : "from-sky-300 to-blue-100";
  const crossbarBg = isDark ? "bg-[#5e503f]" : "bg-[#a9927d]";

  // Brutalist shadow logic
  const shadowColor = "#0a0908"; 

  return (
    <div className="relative flex flex-col items-center font-space">
      {/* Main Window Frame */}
      <div 
        className={`w-[240px] h-[320px] ${frameBg} border-8 ${frameBorder} p-2 relative transition-colors duration-300`}
        style={{ boxShadow: `12px 12px 0px 0px ${shadowColor}` }}
      >
        
        {/* The Glass / Outside View */}
        <div className={`w-full h-full border-4 ${glassBorder} bg-gradient-to-b ${skyGradient} relative overflow-hidden flex items-center justify-center transition-colors duration-300`}>
          
          {isDark ? (
            <>
              {/* Night Sky Particles */}
              <div className="absolute top-6 left-5 w-1 h-1 bg-[#a9927d] rounded-full opacity-80" />
              <div className="absolute top-16 left-16 w-1.5 h-1.5 bg-[#a9927d] rounded-full opacity-50" />
              <div className="absolute bottom-20 left-8 w-1 h-1 bg-[#f2f4f3] rounded-full opacity-70" />
              <div className="absolute top-10 right-20 w-1 h-1 bg-[#f2f4f3] rounded-full opacity-90" />
            </>
          ) : (
            <>
              {/* Blue Sky Cloud */}
              <div className="absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 w-28 h-12 flex items-center justify-center">
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-white border-4 border-[#a9927d] rounded-full" />
                <div className="absolute bottom-0 left-3 w-8 h-8 bg-white border-4 border-[#a9927d] rounded-full" />
                <div className="absolute -top-1 right-5 w-10 h-10 bg-white border-4 border-[#a9927d] rounded-full" />
              </div>
            </>
          )}
          
          {/* Window Panes */}
          <div className={`absolute top-1/2 left-0 w-full h-3 ${crossbarBg} -translate-y-1/2 shadow-sm transition-colors duration-300`} />
          <div className={`absolute top-0 left-1/2 w-3 h-full ${crossbarBg} -translate-x-1/2 shadow-sm transition-colors duration-300`} />
        </div>
      </div>

      {/* The Window Sill */}
      <div 
        className={`w-[280px] h-6 ${frameBg} border-4 ${frameBorder} mt-1 transition-colors duration-300`} 
        style={{ boxShadow: `8px 8px 0px 0px ${shadowColor}` }}
      />
    </div>
  );
}