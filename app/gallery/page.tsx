"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function GalleryPage() {
  const themeColor = "#000";

  const [frames, setFrames] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gallery_positions");
    if (saved) {
      setFrames(JSON.parse(saved));
    } else {
      setFrames([
        { id: 1, x: -150, y: 50 },
        { id: 2, x: 0, y: 50 },
        { id: 3, x: 150, y: 50 },
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
    localStorage.setItem("gallery_positions", JSON.stringify(updatedFrames));
  };

  if (!isLoaded) return null;

  return (
    <main className="relative w-full h-screen bg-white overflow-hidden flex items-center justify-center font-space">
      
      {/* 1. PERSPECTIVE SYSTEM (Walls and Floor) */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        {/* DEFINE WOOD TEXTURE FOR FLOOR */}

        {/* CEILING (Light Grey) */}
        <polygon points="0,0 100,0 90,10 10,10" fill="#f3f4f6" />
        
        {/* LEFT WALL (Slightly darker grey for depth) */}
        <polygon points="0,0 10,10 10,90 0,100" fill="#e5e7eb" />
        
        {/* RIGHT WALL (Slightly darker grey for depth) */}
        <polygon points="100,0 90,10 90,90 100,100" fill="#e5e7eb" />

        {/* FLOOR (Wooden Brown) */}
        <polygon points="0,100 100,100 90,90 10,90" fill="url(#woodPattern)" />

        {/* PERSPECTIVE LINES (Black) */}
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
        {/* GALLERY SIGN */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
          <div 
            className="bg-white px-8 py-3 border-4"
            style={{
              borderColor: themeColor,
              boxShadow: `8px 8px 0px 0px ${themeColor}`
            }}
          >
            <h1 className="text-5xl font-black text-neutral-900 uppercase italic tracking-tighter leading-none">
              Gallery
            </h1>
          </div>
        </div>

        {/* DRAGGABLE EMPTY FRAMES */}
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
            <div 
              className="p-4 bg-white border-4 relative shadow-lg"
              style={{ 
                borderColor: themeColor,
                width: "200px",
                height: "240px",
                background: `linear-gradient(145deg, #ac9764, #d8c3a1)` 
              }}
            >
              <div className="w-full h-full border-2 border-black bg-neutral-100 flex items-center justify-center shadow-inner">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Empty Frame
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="absolute bottom-10 text-neutral-300 uppercase text-[10px] font-bold tracking-[0.5em]">
          Click and drag to arrange
        </div>
      </div>
    </main>
  );
}