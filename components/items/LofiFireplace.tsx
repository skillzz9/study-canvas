"use client";
import React from "react";
import { motion } from "framer-motion";

const Ember = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ y: 0, x: 0, opacity: 0 }}
    animate={{ 
      y: -120, 
      x: Math.random() * 40 - 20, 
      opacity: [0, 1, 0],
      scale: [1, 1.5, 0]
    }}
    transition={{
      duration: 2 + Math.random() * 2,
      repeat: Infinity,
      delay: delay,
      ease: "easeOut"
    }}
    className="absolute bottom-10 left-1/2 w-1 h-1 bg-orange-400 rounded-full blur-[1px]"
  />
);

export default function LofiFireplace() {
  return (
    <div className="relative w-64 h-48 bg-app-card border-4 border-app-border rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] flex flex-col items-center justify-end overflow-hidden group">
      
      {/* 1. MANTLE / ARCH */}
      <div className="absolute top-0 w-full h-8 bg-app-border/10 border-b-4 border-app-border" />
      
      {/* 2. THE HEARTH (INNER CAVITY) */}
      <div className="w-48 h-32 bg-neutral-900 rounded-t-full border-t-4 border-x-4 border-app-border relative flex items-end justify-center pb-2 overflow-hidden">
        
        {/* INNER GLOW */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/40 to-transparent" />

        {/* 3. EMBERS (Floating Particles) */}
        {[...Array(12)].map((_, i) => (
          <Ember key={i} delay={i * 0.4} />
        ))}

        {/* 4. THE FLAMES */}
        <div className="relative flex items-end justify-center scale-125">
          {/* Main Core */}
          <motion.div
            animate={{ 
              scaleY: [1, 1.2, 0.9, 1.1, 1],
              scaleX: [1, 0.9, 1.1, 1],
              opacity: [0.8, 1, 0.9, 1, 0.8]
            }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-12 h-16 bg-orange-500 rounded-full blur-sm"
          />
          
          {/* Inner Core */}
          <motion.div
            animate={{ scaleY: [1, 1.3, 0.8, 1.2, 1] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 w-8 h-10 bg-yellow-400 rounded-full blur-[2px]"
          />

          {/* Center Light */}
          <div className="absolute bottom-0 w-4 h-6 bg-white rounded-full blur-[4px] opacity-60" />
        </div>

        {/* 5. LOGS */}
        <div className="absolute bottom-0 flex gap-1 z-10">
          <div className="w-16 h-4 bg-[#3d2b1f] rounded-full border-2 border-app-border rotate-3 translate-y-1" />
          <div className="w-16 h-4 bg-[#2e1d13] rounded-full border-2 border-app-border -rotate-3 translate-y-1" />
        </div>
      </div>

      {/* 6. BOTTOM LEDGE */}
      <div className="w-full h-4 bg-app-border" />

      {/* AMBIENT GLOW ON THE "WALL" */}
      <motion.div 
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -inset-10 bg-orange-500/10 blur-3xl pointer-events-none"
      />
    </div>
  );
}