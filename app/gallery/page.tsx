"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PaintingFrame from "@/components/PaintingFrame"; // Adjust path if needed

interface FrameData {
  id: number;
  x: number;
  y: number;
  src: string;
  title?: string;
  date?: string;
}

export default function GalleryPage() {
  const themeColor = "#000";
const [frames, setFrames] = useState<FrameData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gallery_v4");
    if (saved) {
      setFrames(JSON.parse(saved));
    } else {
      setFrames([
        { id: 1, x: -250, y: 0, src: "/test.png" },
        { id: 2, x: 0, y: 0, src: "/test.png" },
        { id: 3, x: 250, y: 0, src: "/test.png" },
      ]);
    }
    setIsLoaded(true);
  }, []);

  const handleDragEnd = (id, info) => {
    const updatedFrames = frames.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          x: f.x + info.offset.x,
          y: f.y + info.offset.y,
        };
      }
      return f;
    });
    setFrames(updatedFrames);
    localStorage.setItem("gallery_v4", JSON.stringify(updatedFrames));
  };

  if (!isLoaded) return null;

  return (
    <main className="relative w-full h-screen bg-white overflow-hidden flex items-center justify-center font-space">
      
      {/* 1. PERSPECTIVE SYSTEM */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="woodPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#451a03" />
            <line x1="0" y1="0" x2="0" y2="10" stroke="#311102" strokeWidth="0.5" />
          </pattern>
        </defs>

        <polygon points="0,0 100,0 90,10 10,10" fill="#f3f4f6" />
        <polygon points="0,0 10,10 10,90 0,100" fill="#e5e7eb" />
        <polygon points="100,0 90,10 90,90 100,100" fill="#e5e7eb" />
        <polygon points="0,100 100,100 90,90 10,90" fill="url(#woodPattern)" />

        <line x1="0" y1="0" x2="10" y2="10" stroke={themeColor} strokeWidth="0.1" />
        <line x1="100" y1="0" x2="90" y2="10" stroke={themeColor} strokeWidth="0.1" />
        <line x1="0" y1="100" x2="10" y2="90" stroke={themeColor} strokeWidth="0.1" />
        <line x1="100" y1="100" x2="90" y2="90" stroke={themeColor} strokeWidth="0.1" />
      </svg>

      {/* 2. THE BACK WALL */}
      <div 
        className="relative z-10 bg-white flex items-center justify-center overflow-hidden"
        style={{
          width: "80%",
          height: "80%",
          border: `2px solid ${themeColor}`
        }}
      >
        {/* SIGN */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
          <div 
            className="bg-white px-8 py-3 border-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            style={{ borderColor: themeColor }}
          >
            <h1 className="text-5xl font-black text-neutral-900 uppercase italic tracking-tighter">
              Gallery
            </h1>
          </div>
        </div>

        {/* DRAGGABLE PAINTINGS */}
        {frames.map((frame) => (
          <motion.div
            key={frame.id}
            drag
            dragMomentum={false}
            initial={{ x: frame.x, y: frame.y }}
            animate={{ x: frame.x, y: frame.y }}
            onDragEnd={(e, info) => handleDragEnd(frame.id, info)}
            whileDrag={{ scale: 1.05, zIndex: 50 }}
            className="absolute cursor-grab active:cursor-grabbing"
          >
            <PaintingFrame 
              src={frame.src} 
              alt={`Artwork ${frame.id}`} 
              themeColor={themeColor} 
              title="2nd March"
            />
          </motion.div>
        ))}

        <div className="absolute bottom-10 text-neutral-300 uppercase text-[10px] font-bold tracking-[0.5em]">
          Arrange your collection
        </div>
      </div>
    </main>
  );
}