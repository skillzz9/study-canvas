"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CandleProps {
  theme?: "light" | "dark";
}

export default function Candle({ theme = "dark" }: CandleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = theme === "dark";

  // Dynamic colors mapped strictly to your Academia palettes
  const holderBg = isDark ? "bg-[#49111c]" : "bg-[#ffffff]";
  const holderBorder = isDark ? "border-[#5e503f]" : "border-[#a9927d]";
  
  // The wax body
  const waxBg = isDark ? "bg-[#a9927d]" : "bg-[#f2f4f3]";
  const waxBorder = isDark ? "border-[#5e503f]" : "border-[#a9927d]";
  
  // Brutalist shadow is always Cab Sav for maximum contrast
  const shadowColor = "#0a0908"; 

  // We use frames with randomized durations and scalings to make it feel organic.
  const flickerDuration = 2.5; 

  return (
    <div className="relative flex flex-col items-center font-space group w-[100px]">
      
      {/* WALL GLOW SYSTEM */}
      {mounted && (
        <motion.div
          className="absolute w-[300px] h-[300px] pointer-events-none transition-colors duration-300 rounded-full z-0"
          style={{
            background: isDark 
              ? "radial-gradient(circle, rgba(250, 204, 21, 0.4) 0%, rgba(250, 204, 21, 0.1) 40%, rgba(0, 0, 0, 0) 70%)"
              : "radial-gradient(circle, rgba(250, 204, 21, 0.2) 0%, rgba(250, 204, 21, 0.05) 40%, rgba(0, 0, 0, 0) 70%)",
            transformOrigin: "center top",
            y: "-45%", 
          }}
          initial={{ scale: 1, opacity: 0.9 }}
          animate={{
            scale: [1, 1.05, 0.98, 1.02, 1], 
            opacity: [0.9, 1, 0.8, 0.95, 0.9], 
          }}
          transition={{
            duration: flickerDuration,
            ease: "easeInOut",
            repeat: Infinity,
            times: [0, 0.2, 0.5, 0.8, 1], 
          }}
        />
      )}

      <div className="relative flex flex-col items-center z-10">
        
        {/* ORGANIC JITTER FLAME */}
        {mounted ? (
          <motion.div 
            className="w-3 h-4 bg-yellow-400 rounded-t-[50%] rounded-b-[40%] shadow-[0_0_15px_rgba(250,204,21,0.8)]"
            style={{ transformOrigin: "center bottom" }}
            initial={{ scaleY: 1, scaleX: 1, y: 0 }}
            animate={{
              scaleY: [1, 1.15, 0.9, 1.1, 1], 
              scaleX: [1, 0.9, 1.1, 0.95, 1], 
              y: [0, -1, 0.5, -0.5, 0],       
            }}
            transition={{
              duration: flickerDuration,
              ease: "easeInOut",
              repeat: Infinity,
              times: [0, 0.2, 0.5, 0.8, 1], 
            }}
          />
        ) : (
          /* STATIC FALLBACK FLAME FOR SSR */
          <div 
            className="w-3 h-4 bg-yellow-400 rounded-t-[50%] rounded-b-[40%] shadow-[0_0_15px_rgba(250,204,21,0.8)]"
            style={{ transformOrigin: "center bottom" }}
          />
        )}
        
        {/* The Wick */}
        <div className="w-1 h-1.5 bg-[#0a0908] -mt-0.5" />
        
        {/* The Wax Body */}
        <div className={`w-8 h-12 ${waxBg} border-4 ${waxBorder} transition-colors duration-300 relative z-10`} />
        
        {/* The Holder Base */}
        <div className={`w-16 h-5 ${holderBg} border-4 ${holderBorder} -mt-1 relative z-20 transition-colors duration-300 flex items-center`}>
        </div>

      </div>
    </div>
  );
}