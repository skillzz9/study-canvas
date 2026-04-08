"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import PaintingFrame from "@/components/PaintingFrame";
import PictureModal from "@/components/PictureModal";

interface FrameData {
  id: number;
  x: number;
  y: number;
  src: string;
  title?: string;
  date?: string;
}

// 1. HARDCODE YOUR CONTENT HERE
// You can change titles, dates, or add new paintings here anytime.
// The x and y values here act as the default starting positions.
const INITIAL_FRAMES: FrameData[] = [
  { id: 1, x: -250, y: 0, src: "/test.png", date: "April 2nd 2026" },
  { id: 2, x: 0, y: 0, src: "/test.png", date: "March 2026" },
  { id: 3, x: 250, y: 0, src: "/test.png", title: "Neon Nights", date: "Feb 2026" },
];

export default function GalleryPage() {
  const themeColor = "#000";
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Modal States
  const [selectedFrame, setSelectedFrame] = useState<FrameData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDragging = useRef(false);

  useEffect(() => {
    // 2. ONLY LOOK FOR POSITIONS IN LOCAL STORAGE
    const savedPositionsString = localStorage.getItem("gallery_positions");
    
    if (savedPositionsString) {
      const savedPositions = JSON.parse(savedPositionsString);
      
      // Merge the hardcoded content with the saved coordinates
      const mergedFrames = INITIAL_FRAMES.map((frame) => {
        const savedCoords = savedPositions.find((p: { id: number }) => p.id === frame.id);
        if (savedCoords) {
          return { ...frame, x: savedCoords.x, y: savedCoords.y };
        }
        return frame; // If no saved coords (like a newly added painting), use default
      });
      
      setFrames(mergedFrames);
    } else {
      // If nothing is saved at all, just use the defaults
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
    
    // 3. STRIP OUT EVERYTHING EXCEPT ID, X, AND Y TO SAVE
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
            onDragStart={() => (isDragging.current = true)}
            onDragEnd={(e, info) => {
              setTimeout(() => { isDragging.current = false; }, 150);
              handleDragEnd(frame.id, info);
            }}
            whileDrag={{ scale: 1.05, zIndex: 50 }}
            className="absolute cursor-grab active:cursor-grabbing"
          >
            <PaintingFrame 
              src={frame.src} 
              alt={frame.title || `Artwork ${frame.id}`} 
              themeColor={themeColor} 
              date={frame.date}
              onClick={() => {
                if (!isDragging.current) {
                  openModal(frame);
                }
              }}
            />
          </motion.div>
        ))}

        <div className="absolute bottom-10 text-neutral-300 uppercase text-[10px] font-bold tracking-[0.5em]">
          Arrange your collection
        </div>
      </div>

      {/* 3. RENDER THE MODAL ON TOP OF EVERYTHING */}
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