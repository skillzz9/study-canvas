"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import PaintingFrame from "@/components/PaintingFrame";
import PictureModal from "@/components/PictureModal";
import SideMenu from "@/components/SideMenu";
import CreatePaintingModal from "@/components/CreatePaintingModal";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { updatePaintingPosition } from "@/lib/paintingService";

// 1. FIXED INTERFACE: Added shuffledIndices
interface FrameData {
  id: string;
  x: number;
  y: number;
  src: string;
  title: string;
  subject: string;
  revealedBlocks: number;
  totalBlocks: number;
  shuffledIndices: number[]; 
}

export default function GalleryPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [scale, setScale] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [wallColor, setWallColor] = useState<string | null>(null);
  
  const cameraX = useMotionValue(0);
  const cameraY = useMotionValue(0);
  const [selectedFrame, setSelectedFrame] = useState<FrameData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDraggingItem = useRef(false);

  // REAL-TIME FIRESTORE SYNC
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "paintings"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paintingsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          x: data.position?.x || 0,
          y: data.position?.y || 0,
          src: data.imageUrl || "/test.png",
          title: data.title || "Untitled",
          subject: data.subject || "General",
          revealedBlocks: data.revealedBlocks || 0,
          totalBlocks: data.totalBlocks || 180,
          // 2. FIXED SNAPSHOT: Pull the array from Firebase
          shuffledIndices: data.shuffledIndices || [], 
        };
      });
      
      setFrames(paintingsData);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [user]);

  // WHEEL & ZOOM LOGIC
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const sensitivity = 0.001;
      setScale((prevScale) => {
        const delta = e.deltaY * prevScale * sensitivity;
        return Math.min(Math.max(prevScale - delta, 0.1), 3);
      });
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [scale]);

  const handleWheel = (e: React.WheelEvent) => {
    const sensitivity = 0.001; 
    const delta = e.deltaY * scale * sensitivity;
    setScale(Math.min(Math.max(scale - delta, 0.1), 3));
  };

  // SYNC DRAG COORDINATES TO DATABASE
  const handleDragEnd = async (id: string, info: any) => {
    const frame = frames.find(f => f.id === id);
    if (!frame) return;

    const newX = frame.x + info.offset.x / scale;
    const newY = frame.y + info.offset.y / scale;

    try {
      await updatePaintingPosition(id, newX, newY);
    } catch (error) {
      console.error("Failed to save position:", error);
    }
  };

  if (!isLoaded) return null;

  return (
    <main 
      className="relative w-full h-screen bg-app-bg overflow-hidden font-space select-none transition-colors duration-300"
      onWheel={handleWheel}
      ref={containerRef}
      style={{ backgroundColor: wallColor || undefined }}
    >
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onColorSelect={setWallColor}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <CreatePaintingModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => console.log("New painting added to wall!")}
      />

      {/* FIXED UI LAYER */}
      <div className="absolute inset-0 z-[80] pointer-events-none">
        {/* SLOT 1: Home/Close */}
        {isMenuOpen ? (
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 left-6 p-3 bg-app-card border-4 border-app-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-app-text flex items-center justify-center pointer-events-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        ) : (
          <Link href="/" className="absolute top-6 left-6 p-3 bg-app-card border-4 border-app-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-app-text flex items-center justify-center pointer-events-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </Link>
        )}

        {/* SLOT 2: Theme */}
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="absolute top-6 left-[88px] p-3 bg-app-card border-4 border-app-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-app-text flex items-center justify-center pointer-events-auto">
          {theme === "dark" ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>}
        </button>

        {/* SLOT 3: Create */}
        {!isMenuOpen && (
          <button onClick={() => setIsMenuOpen(true)} className="absolute top-6 left-[150px] p-3 bg-app-card border-4 border-app-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-app-text flex items-center justify-center pointer-events-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
          </button>
        )}
      </div>

      {/* 2. THE WORLD (Live from Firestore) */}
      <motion.div
        drag
        dragMomentum={false}
        style={{ x: cameraX, y: cameraY, scale }}
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
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
            {/* 3. FIXED PROPS: Passing all required data to the Frame */}
            <PaintingFrame 
              src={frame.src} 
              title={frame.title} 
              revealedCount={frame.revealedBlocks}
              totalBlocks={frame.totalBlocks}
              shuffledIndices={frame.shuffledIndices}
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
    id={selectedFrame.id}
    src={selectedFrame.src}
    title={selectedFrame.title}
    date={selectedFrame.subject} 
    revealedCount={selectedFrame.revealedBlocks}
    totalBlocks={selectedFrame.totalBlocks}
    shuffledIndices={selectedFrame.shuffledIndices}
  />
)}
    </main>
  );
}