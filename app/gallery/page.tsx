"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PaintingFrame from "@/components/PaintingFrame";
import PictureModal from "@/components/PictureModal";
import Link from "next/link";

interface FrameData {
  id: number;
  x: number;
  y: number;
  src: string;
  title?: string;
  date?: string;
}

const INITIAL_FRAMES: FrameData[] = [
  { id: 1, x: -250, y: 0, src: "/test.png", title: "BIG BIRD", date: "April 10th 2026" },
];

export default function GalleryPage() {
  const themeColor = "#000";
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [selectedFrame, setSelectedFrame] = useState<FrameData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDragging = useRef(false);

  useEffect(() => {
    const savedPositionsString = localStorage.getItem("gallery_positions");
    
    if (savedPositionsString) {
      const savedPositions = JSON.parse(savedPositionsString);
      const mergedFrames = INITIAL_FRAMES.map((frame) => {
        const savedCoords = savedPositions.find((p: { id: number }) => p.id === frame.id);
        if (savedCoords) {
          return { ...frame, x: savedCoords.x, y: savedCoords.y };
        }
        return frame; 
      });
      setFrames(mergedFrames);
    } else {
      setFrames(INITIAL_FRAMES);
    }
    setIsLoaded(true);
  }, []);

  const handleDragEnd = (id: number, info: any) => {
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
    
    const positionsToSave = updatedFrames.map((frame) => ({
      id: frame.id,
      x: frame.x,
      y: frame.y
    }));
    
    localStorage.setItem("gallery_positions", JSON.stringify(positionsToSave));
  };

  const openModal = (frame: FrameData) => {
    setSelectedFrame(frame);
    setIsModalOpen(true);
  };

  if (!isLoaded) return null;

  return (
    <main className="relative w-full h-screen bg-white overflow-hidden flex items-center justify-center font-space">

      <Link 
        href="/"
        className="absolute top-8 left-8 z-50 p-3 bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-black flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </Link>
      
      {/* 1. PERSPECTIVE SYSTEM (Background Environment) */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id="floorClip">
            <polygon points="0,100 100,100 90,90 10,90" />
          </clipPath>
        </defs>

        <polygon points="0,0 100,0 90,10 10,10" fill="#f3f4f6" />
        <polygon points="0,0 10,10 10,90 0,100" fill="#e5e7eb" />
        <polygon points="100,0 90,10 90,90 100,100" fill="#e5e7eb" />
        <polygon points="0,100 100,100 90,90 10,90" fill="#451a03" />
        
        <g clipPath="url(#floorClip)">
          {Array.from({ length: 21 }).map((_, i) => (
            <line key={i} x1="50" y1="50" x2={i * 5} y2="100" stroke="#311102" strokeWidth="0.5" />
          ))}
        </g>

        <line x1="0" y1="0" x2="10" y2="10" stroke={themeColor} strokeWidth="0.1" />
        <line x1="100" y1="0" x2="90" y2="10" stroke={themeColor} strokeWidth="0.1" />
        <line x1="0" y1="100" x2="10" y2="90" stroke={themeColor} strokeWidth="0.1" />
        <line x1="100" y1="100" x2="90" y2="90" stroke={themeColor} strokeWidth="0.1" />
      </svg>

      {/* 2. THE BACK WALL */}
      <div 
        className="relative z-10 bg-white flex items-center justify-center"
        style={{
          width: "80%",
          height: "80%",
          border: `2px solid ${themeColor}`,
          overflow: "visible" // Allows paintings to be seen on the grey walls
        }}
      >
        {/* SIGN */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
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
            // Logic for rotateY and scale removed
            initial={{ x: frame.x, y: frame.y }}
            animate={{ x: frame.x, y: frame.y }}
            onDragStart={() => (isDragging.current = true)}
            onDragEnd={(e, info) => {
              setTimeout(() => { isDragging.current = false; }, 150);
              handleDragEnd(frame.id, info);
            }}
            whileDrag={{ scale: 1.05, zIndex: 100 }}
            className="absolute cursor-grab active:cursor-grabbing z-30"
          >
            <PaintingFrame 
              src={frame.src} 
              alt={frame.title || `Artwork ${frame.id}`} 
              themeColor={themeColor}
              title={frame.title} 
              date={frame.date}
              onClick={() => {
                if (!isDragging.current) {
                  openModal(frame);
                }
              }}
            />
          </motion.div>
        ))}

      </div>

      {/* 3. MODAL */}
      {selectedFrame && (
        <PictureModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          src={selectedFrame.src}
          title={selectedFrame.title || "Untitled"}
          date={selectedFrame.date || "Unknown Date"}
        />
      )}
    </main>
  );
}