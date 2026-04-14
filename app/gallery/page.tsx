"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
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
  { id: 1, x: -250, y: 0, src: "/finalpainting.png", title: "OH HELL NAH", date: "April 10th 2026" },
  { id: 2, x: 250, y: 0, src: "/finalpainting2.png", title: "MATCHA!?", date: "April 11th 2026" },
  { id: 3, x: 0, y: -300, src: "/finalpainting4.png", title: "may i?", date: "April 11th 2026" },
];

export default function GalleryPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [scale, setScale] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Camera Panning Values
  const cameraX = useMotionValue(0);
  const cameraY = useMotionValue(0);

  const [selectedFrame, setSelectedFrame] = useState<FrameData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDraggingItem = useRef(false);

  useEffect(() => {
    const savedPositionsString = localStorage.getItem("gallery_positions");
    if (savedPositionsString) {
      const savedPositions = JSON.parse(savedPositionsString);
      const mergedFrames = INITIAL_FRAMES.map((frame) => {
        const savedCoords = savedPositions.find((p: { id: number }) => p.id === frame.id);
        return savedCoords ? { ...frame, x: savedCoords.x, y: savedCoords.y } : frame;
      });
      setFrames(mergedFrames);
    } else {
      setFrames(INITIAL_FRAMES);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const handleWheel = (e: WheelEvent) => {
    // STOP the browser from moving the page up/down
    e.preventDefault();

    const sensitivity = 0.001;
    // Use the functional update to ensure we have the latest scale
    setScale((prevScale) => {
      const delta = e.deltaY * prevScale * sensitivity;
      return Math.min(Math.max(prevScale - delta, 0.1), 3);
    });
  };

  // 2. THE SECRET SAUCE: { passive: false } 
  // This allows e.preventDefault() to actually work.
  container.addEventListener("wheel", handleWheel, { passive: false });

  return () => {
    container.removeEventListener("wheel", handleWheel);
  };
}, [scale]); // Re-run if scale logic needs it, though functional setScale is better

const handleWheel = (e: React.WheelEvent) => {
  // 1. Damping factor (smaller = slower zoom)
  const sensitivity = 0.001; 
  
  // 2. Calculate the zoom based on how much the wheel actually moved.
  // We multiply by 'scale' so the zoom speed feels consistent 
  // whether you are zoomed in or out.
  const delta = e.deltaY * scale * sensitivity;
  
  // 3. Subtract the delta (scrolling down usually zooms out)
  const newScale = Math.min(Math.max(scale - delta, 0.1), 3);
  
  setScale(newScale);
};

  const handleDragEnd = (id: number, info: any) => {
    // When zoomed out, we need to divide the movement by the scale 
    // so the painting stays "glued" to the mouse cursor.
    const updatedFrames = frames.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          x: f.x + info.offset.x / scale,
          y: f.y + info.offset.y / scale,
        };
      }
      return f;
    });
    
    setFrames(updatedFrames);
    localStorage.setItem("gallery_positions", JSON.stringify(updatedFrames));
  };

  if (!isLoaded) return null;

  return (
    <main 
      className="relative w-full h-screen bg-white overflow-hidden font-space select-none"
      onWheel={handleWheel}
      ref={containerRef}
    >
      {/* 1. FIXED UI (Doesn't Zoom) */}
      <div className="absolute top-8 left-8 z-50 flex gap-4">
<Link 
        href="/"
        className="absolute top-8 left-8 z-50 p-3 bg-cod-gray border-4 border-judge-gray rounded-xl shadow-[4px_4px_0px_0px_#0a0908] hover:shadow-[2px_2px_0px_0px_#0a0908] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-wild-sand flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </Link>
      </div>

      {/* 2. THE WORLD (Everything inside here pans and zooms) */}
      <motion.div
        drag
        dragMomentum={false}
        style={{ x: cameraX, y: cameraY, scale }}
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {/* Background Grid: Helps you see that you are actually moving */}
        <div 
          className="absolute inset-[-200%] pointer-events-none opacity-20"
          style={{
            backgroundSize: `${40 * scale}px ${40 * scale}px`,
          }}
        />

        {frames.map((frame) => (
          <motion.div
            key={frame.id}
            drag
            dragMomentum={false}
            initial={{ x: frame.x, y: frame.y }}
            animate={{ x: frame.x, y: frame.y }}
            onDragStart={() => (isDraggingItem.current = true)}
            onDragEnd={(e, info) => {
              setTimeout(() => { isDraggingItem.current = false; }, 100);
              handleDragEnd(frame.id, info);
            }}
            whileDrag={{ scale: 1.1, zIndex: 100 }}
            className="absolute cursor-grab active:cursor-grabbing"
          >
            <PaintingFrame 
              src={frame.src} 
              title={frame.title} 
              date={frame.date}
              onClick={() => {
                if (!isDraggingItem.current) {
                  setSelectedFrame(frame);
                  setIsModalOpen(true);
                }
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* 3. MODAL */}
      {selectedFrame && (
        <PictureModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          src={selectedFrame.src}
          title={selectedFrame.title}
        />
      )}

      {/* ZOOM INDICATOR (Bottom Right) */}
      <div className="absolute bottom-8 right-8 z-50">
        <div className="p-3 bg-cod-gray border-4 border-judge-gray rounded-xl shadow-[4px_4px_0px_0px_#0a0908] text-wild-sand font-bold uppercase text-[10px] flex items-center justify-center">
          Zoom: {Math.round(scale * 100)}%
        </div>
      </div>
      
    </main>
  );
}