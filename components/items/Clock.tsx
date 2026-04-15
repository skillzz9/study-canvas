"use client";
import React, { useState, useEffect } from "react";

interface ClockProps {
  theme?: "light" | "dark";
}

export default function Clock({ theme = "dark" }: ClockProps) {
  
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const isDark = theme === "dark";

  // Dynamic colors strictly mapped to your Academia palettes
  const frameBg = isDark ? "bg-[#49111c]" : "bg-[#ffffff]";
  const frameBorder = isDark ? "border-[#5e503f]" : "border-[#a9927d]";
  const faceBg = isDark ? "bg-[#0a0908]" : "bg-[#f2f4f3]";
  const handMain = isDark ? "bg-[#f2f4f3]" : "bg-[#0a0908]";
  const handAccent = isDark ? "bg-[#a9927d]" : "bg-[#5e503f]";
  const shadowColor = "#0a0908"; 

  // Calculate rotation angles
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;

  return (
    // Removed the drag wrapper and explicitly set the w-160px h-160px layout
    <div className="relative flex flex-col items-center font-space group w-[160px] h-[160px]">
      
      {/* Outer Clock Frame */}
      <div 
        className={`w-full h-full rounded-full ${frameBg} border-8 ${frameBorder} p-2 relative transition-colors duration-300 flex items-center justify-center`}
        style={{ boxShadow: `8px 8px 0px 0px ${shadowColor}` }}
      >
        
        {/* Inner Clock Face */}
        <div className={`w-full h-full rounded-full ${faceBg} relative overflow-hidden transition-colors duration-300 shadow-inner`}>
          
          {/* Hour Markers */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-3 ${handAccent} opacity-40`}
              style={{ 
                transformOrigin: "50% 64px",
                transform: `translateX(-50%) rotate(${i * 30}deg)` 
              }}
            />
          ))}

          {/* Render hands only after mounting to prevent hydration mismatch */}
          {mounted && (
            <>
              {/* Hour Hand */}
              <div 
                className={`absolute top-[25%] left-1/2 -translate-x-1/2 w-2 h-[25%] ${handMain} rounded-full transition-colors duration-300 shadow-sm`}
                style={{ 
                  transformOrigin: "bottom center",
                  transform: `translateX(-50%) rotate(${hourAngle}deg)` 
                }}
              />
              
              {/* Minute Hand */}
              <div 
                className={`absolute top-[10%] left-1/2 -translate-x-1/2 w-1.5 h-[40%] ${handMain} rounded-full transition-colors duration-300 shadow-sm`}
                style={{ 
                  transformOrigin: "bottom center",
                  transform: `translateX(-50%) rotate(${minuteAngle}deg)` 
                }}
              />
              
              {/* Second Hand (Ticking) */}
              <div 
                className={`absolute top-[5%] left-1/2 -translate-x-1/2 w-1 h-[55%] ${handAccent} rounded-full transition-colors duration-300`}
                style={{ 
                  transformOrigin: "81.8% center",
                  transform: `translateX(-50%) rotate(${secondAngle}deg)` 
                }}
              />
            </>
          )}

          {/* Center Pin */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${frameBorder} border-2 ${handMain} z-10 transition-colors duration-300`} />
        </div>
      </div>
    </div>
  );
}