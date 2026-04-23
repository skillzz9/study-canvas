"use client";
import React from "react";
import { motion } from "framer-motion";

interface RetroTVProps {
  theme?: "light" | "dark";
}

export default function RetroTV({ theme = "dark" }: RetroTVProps) {
  const isDark = theme === "dark";

  return (
    <div className="relative w-[180px] h-[160px] flex items-center justify-center select-none group">
      {/* OUTER HOUSING */}
      <div className={`absolute inset-0 border-4 border-app-border rounded-xl ${isDark ? 'bg-[#2a2a2a]' : 'bg-[#e0e0e0]'}`} />
      
      {/* SCREEN BEZEL */}
      <div className={`absolute inset-3 border-4 border-app-border rounded-lg overflow-hidden flex items-center justify-center ${isDark ? 'bg-black' : 'bg-[#1a1a1a]'}`}>
        
        {/* SCANLINES OVERLAY */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-10" 
             style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 3px)' }} />

        {/* 3D SPINNING CUBE */}
        <div className="w-20 h-20 [perspective:400px]">
          <motion.div 
            className="relative w-full h-full [transform-style:preserve-3d]"
            animate={{ rotateX: 360, rotateY: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            {[
              { rotate: "rotateY(0deg)", translate: "translateZ(30px)" },
              { rotate: "rotateY(90deg)", translate: "translateZ(30px)" },
              { rotate: "rotateY(180deg)", translate: "translateZ(30px)" },
              { rotate: "rotateY(-90deg)", translate: "translateZ(30px)" },
              { rotate: "rotateX(90deg)", translate: "translateZ(30px)" },
              { rotate: "rotateX(-90deg)", translate: "translateZ(30px)" },
            ].map((face, i) => (
              <div 
                key={i}
                className="absolute inset-0 border-2 border-app-accent/60 bg-app-accent/10"
                style={{ transform: `${face.rotate} ${face.translate}` }}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* DIALS */}
      <div className="absolute right-5 top-8 flex flex-col gap-2 z-20">
        <div className="w-3 h-3 rounded-full border-2 border-app-border bg-app-card" />
        <div className="w-3 h-3 rounded-full border-2 border-app-border bg-app-card" />
      </div>
    </div>
  );
}