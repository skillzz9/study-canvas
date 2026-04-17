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

  // Palette mapping for Light/Dark Academia
  const frameBg = isDark ? "bg-[#49111c]" : "bg-[#ffffff]";
  const frameBorder = isDark ? "border-[#5e503f]" : "border-[#a9927d]";
  const faceBg = isDark ? "bg-[#0a0908]" : "bg-[#f2f4f3]";
  const handMain = isDark ? "bg-[#f2f4f3]" : "bg-[#0a0908]";
  const handAccent = isDark ? "bg-[#a9927d]" : "bg-[#5e503f]";

  // Rotation Math
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;

  if (!mounted) {
    return <div className="w-[160px] h-[160px]" />; // Prevent layout shift
  }

  return (
    <div className="relative flex flex-col items-center font-space w-[160px] h-[160px]">
      {/* Outer Frame */}
      <div className={`w-full h-full rounded-full ${frameBg} border-8 ${frameBorder} p-2 relative flex items-center justify-center transition-colors duration-300`}>
        
        {/* Face */}
        <div className={`w-full h-full rounded-full ${faceBg} relative overflow-hidden transition-colors duration-300`}>
          
          {/* Hour Markers */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3 ${handAccent} opacity-30`}
              style={{ 
                transformOrigin: "50% 64px", // Half of the inner face (128px / 2)
                transform: `translateX(-50%) rotate(${i * 30}deg)` 
              }}
            />
          ))}

          {/* Hour Hand: 30% height, positioned so bottom is at 50% center */}
          <div 
            className={`absolute top-[20%] left-1/2 -translate-x-1/2 w-2 h-[30%] ${handMain} rounded-full transition-colors duration-300`}
            style={{ 
              transformOrigin: "bottom center",
              transform: `translateX(-50%) rotate(${hourAngle}deg)` 
            }}
          />
          
          {/* Minute Hand: 40% height, positioned so bottom is at 50% center */}
          <div 
            className={`absolute top-[10%] left-1/2 -translate-x-1/2 w-1.5 h-[40%] ${handMain} rounded-full transition-colors duration-300`}
            style={{ 
              transformOrigin: "bottom center",
              transform: `translateX(-50%) rotate(${minuteAngle}deg)` 
            }}
          />
          
          {/* Second Hand: 45% height, positioned so bottom is at 50% center */}
          <div 
            className={`absolute top-[5%] left-1/2 -translate-x-1/2 w-1 h-[45%] ${handAccent} rounded-full transition-colors duration-300`}
            style={{ 
              transformOrigin: "bottom center",
              transform: `translateX(-50%) rotate(${secondAngle}deg)` 
            }}
          />

          {/* Center Pin */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${frameBorder} border-2 ${handMain} z-10 transition-colors duration-300`} />
        </div>
      </div>
    </div>
  );
}