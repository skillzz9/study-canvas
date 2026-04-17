"use client";
import React from "react";
import { motion, Variants } from "framer-motion"; // Added Variants to import

interface WindowProps {
  theme?: "light" | "dark";
}

// Explicitly typing this as Variants solves the 'string' vs 'Easing' mismatch
const starVariants: Variants = {
  flicker1: {
    opacity: [0.8, 0.2, 0.8, 0.5, 0.8],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 0.2,
    },
  },
  flicker2: {
    opacity: [0.5, 0.1, 0.5, 0.3, 0.5],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 0.8,
    },
  },
  flicker3: {
    opacity: [0.7, 0.3, 0.7, 0.4, 0.7],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 0.1,
    },
  },
  flicker4: {
    opacity: [0.9, 0.4, 0.9, 0.6, 0.9],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 0.5,
    },
  },
};

export default function Window({ 
  theme = "dark" 
}: WindowProps) {
  
  const isDark = theme === "dark";

  const frameBg = isDark ? "bg-[#49111c]" : "bg-[#ffffff]";
  const frameBorder = isDark ? "border-[#5e503f]" : "border-[#a9927d]";
  const glassBorder = isDark ? "border-[#5e503f]" : "border-[#a9927d]";
  const skyGradient = isDark ? "from-[#0a0908] to-[#49111c]" : "from-sky-300 to-blue-100";
  const crossbarBg = isDark ? "bg-[#5e503f]" : "bg-[#a9927d]";

  return (
    <div className="relative flex flex-col items-center font-space">
      <div className={`w-[240px] h-[320px] ${frameBg} border-8 ${frameBorder} p-2 relative transition-colors duration-300`}>
        <div className={`w-full h-full border-4 ${glassBorder} bg-gradient-to-b ${skyGradient} relative overflow-hidden flex items-center justify-center transition-colors duration-300`}>
          
          {isDark ? (
            <>
              <motion.div
                className="absolute top-6 left-5 w-1 h-1 bg-[#a9927d] rounded-full"
                animate="flicker1"
                variants={starVariants}
              />
              <motion.div
                className="absolute top-16 left-16 w-1.5 h-1.5 bg-[#a9927d] rounded-full"
                animate="flicker2"
                variants={starVariants}
              />
              <motion.div
                className="absolute bottom-20 left-8 w-1 h-1 bg-[#f2f4f3] rounded-full"
                animate="flicker3"
                variants={starVariants}
              />
              <motion.div
                className="absolute top-10 right-20 w-1 h-1 bg-[#f2f4f3] rounded-full"
                animate="flicker4"
                variants={starVariants}
              />
            </>
          ) : (
            <>
              <div className="absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 w-28 h-12 flex items-center justify-center">

              </div>
            </>
          )}
          
          <div className={`absolute top-1/2 left-0 w-full h-3 ${crossbarBg} -translate-y-1/2 transition-colors duration-300`} />
          <div className={`absolute top-0 left-1/2 w-3 h-full ${crossbarBg} -translate-x-1/2 transition-colors duration-300`} />
        </div>
      </div>

      <div className={`w-[280px] h-6 ${frameBg} border-4 ${frameBorder} mt-1 transition-colors duration-300`} />
    </div>
  );
}