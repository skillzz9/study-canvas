"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import PaintingFrame from "@/components/PaintingFrame";
// Import your new components as you build them
// import Shelf from "@/components/Shelf"; 

export default function MoodBoardPage() {
  const [scale, setScale] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [frames, setFrames] = useState([]); // Your study paintings
  
  // Panning logic: tracking the world position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    setMounted(true);
    // Load your frames from Firebase/LocalStorage here
  }, []);

  // ZOOM LOGIC: Handle mouse wheel to zoom in/out
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    const newScale = Math.min(Math.max(scale + delta, 0.2), 3); // Limits zoom between 20% and 300%
    setScale(newScale);
  };

  if (!mounted) return null;

  return (
    <main 
      className="relative w-full h-screen bg-[#f2f4f3] overflow-hidden cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
    >
      {/* GRID OVERLAY: Gives the "Miro" whiteboard feel */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(#0a0908 1px, transparent 1px)`,
          backgroundSize: `${40 * scale}px ${40 * scale}px`,
          backgroundPosition: `${x.get()}px ${y.get()}px`,
        }}
      />

      {/* THE WORLD CONTAINER: Everything inside here pans and zooms */}
      <motion.div
        drag
        dragMomentum={false}
        style={{ x, y, scale }}
        className="absolute inset-0 flex items-center justify-center origin-center"
      >
        {/* RENDER ITEMS HERE */}
        {frames.map((frame) => (
          <PaintingFrame 
            key={frame.id}
            {...frame}
            canvasScale={scale} // Pass scale down if you want items to react to zoom
          />
        ))}

        {/* Placeholder for your first shelf */}
        <div className="absolute top-0 left-0">
            {/* <Shelf /> */}
        </div>

      </motion.div>

      {/* UI OVERLAY: Stays fixed while the board moves */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-50">
        <div className="bg-white border-2 border-black p-3 font-bold text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Zoom: {Math.round(scale * 100)}%
        </div>
        <button 
          onClick={() => { setScale(1); x.set(0); y.set(0); }}
          className="bg-black text-white p-3 text-xs uppercase font-bold hover:bg-neutral-800 transition-colors"
        >
          Reset View
        </button>
      </div>
    </main>
  );
}