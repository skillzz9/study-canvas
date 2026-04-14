"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import GridRevealMask from "@/components/GridRevealMask";

// TYPES
interface Contributor {
  id: number;
  username: string;
  avatarUrl: string;
  contributionPercent: number;
}

interface PictureModalProps {
  isOpen: boolean;       
  onClose: () => void;  
  id: string; // Needed to route to the study room
  src: string;           
  title: string;         
  date: string;          
  revealedCount: number;
  totalBlocks: number;
  shuffledIndices: number[];
}

// FAKE DATA FOR DEMO
const fakeContributors: Contributor[] = [
  { id: 1, username: "joc", avatarUrl: "avatars/avatar7.webp", contributionPercent: 50 },
  { id: 2, username: "big bird", avatarUrl: "avatars/avatar9.webp", contributionPercent: 50 },
];

export default function PictureModal({ 
  isOpen, 
  onClose, 
  id,
  src, 
  title, 
  date,
  revealedCount,
  totalBlocks,
  shuffledIndices 
}: PictureModalProps) {
  const themeColor = "#000"; 
  const router = useRouter();

  // STATE
  const [localTitle, setLocalTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);
  const [sessionGoal, setSessionGoal] = useState<number>(60); // Default 60 minutes

  // DERIVED DATA
  const percentage = Math.round((revealedCount / totalBlocks) * 100);
  const isFinished = revealedCount >= totalBlocks;
  const isBrandNew = revealedCount === 0;

  useEffect(() => {
    setLocalTitle(title);
    setIsEditing(false);
  }, [title, isOpen]);

  const handleContinuePainting = () => {
    // Route to study room passing the painting ID and their session goal
    router.push(`/studyroom?paintingId=${id}&goal=${sessionGoal}`);
  };

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose} 
            className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} 
              className="bg-white border-4 relative max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar cursor-default shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] font-space"
              style={{ borderColor: themeColor }}
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 border-2 w-10 h-10 flex items-center justify-center bg-white hover:bg-neutral-100 transition-colors z-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                style={{ borderColor: themeColor }}
              >
                <span className="text-2xl font-black leading-none">×</span>
              </button>

              <div className="p-8 md:p-12">
                
                {/* 1. THE IMAGE (WITH REVEAL MASK) */}
                <div 
                  className="border-4 bg-neutral-100 p-3 mb-10 flex justify-center"
                  style={{ borderColor: themeColor }}
                >
                  {/* Square container ensures the grid mask draws accurately */}
                  <div className="relative w-full max-w-[500px] aspect-square bg-white border-2 border-neutral-200 overflow-hidden shadow-inner">
                    {isBrandNew ? (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                      </div>
                    ) : (
                      <GridRevealMask 
                        revealedCount={revealedCount} 
                        gridSize={6} 
                        fullShuffledIndices={shuffledIndices}
                        isStatic={true} 
                        allLayers={true}
                      >
                        <img 
                          src={src} 
                          alt={localTitle} 
                          className="w-full h-full object-cover block" 
                        />
                      </GridRevealMask>
                    )}
                  </div>
                </div>

                {/* 2. HEADER */}
                <div className="border-b-4 pb-6 mb-8" style={{ borderColor: themeColor }}>
                  {isEditing ? (
                    <input
                      autoFocus
                      type="text"
                      value={localTitle}
                      onChange={(e) => setLocalTitle(e.target.value)}
                      onBlur={() => setIsEditing(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setIsEditing(false);
                      }}
                      className="text-5xl font-black uppercase italic tracking-tighter text-neutral-900 leading-none mb-2 w-full bg-transparent border-b-2 border-neutral-300 outline-none focus:border-black"
                    />
                  ) : (
                    <h2 
                      onClick={() => setIsEditing(true)}
                      className="text-5xl font-black uppercase italic tracking-tighter text-neutral-900 leading-none mb-2 cursor-text hover:opacity-70 transition-opacity"
                      title="Click to edit title"
                    >
                      {localTitle}
                    </h2>
                  )}
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-neutral-400">
                     {date}
                  </p>
                </div>

                {/* 3. META INFO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                  
                  {/* PROGRESS BLOCK */}
                  <div className="border-4 p-6 bg-neutral-50" style={{ borderColor: themeColor }}>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-400 mb-3">
                      Canvas Completion
                    </h4>
                    <p className="text-4xl font-black tabular-nums tracking-tight text-neutral-950">
                      {percentage}%
                    </p>
                  </div>

                  {/* ACTION BLOCK (CONTINUE PAINTING) */}
                  <div className="border-4 p-6 bg-neutral-900 text-white flex flex-col justify-center" style={{ borderColor: themeColor }}>
                    {isFinished ? (
                      <div className="text-center">
                        <h4 className="text-2xl font-black uppercase tracking-tight text-white">Masterpiece Complete</h4>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-400 mb-3">
                          Next Session Goal (Mins)
                        </h4>
                        <div className="flex gap-4">
                          <input 
                            type="number" 
                            min="1"
                            value={sessionGoal}
                            onChange={(e) => setSessionGoal(Number(e.target.value))}
                            className="bg-transparent border-b-4 border-white text-3xl font-black tabular-nums w-24 outline-none text-white pb-1 focus:border-neutral-400 transition-colors"
                          />
                          <button 
                            onClick={handleContinuePainting}
                            className="flex-1 bg-white text-black font-black uppercase text-sm border-4 border-black hover:bg-neutral-200 transition-colors hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none"
                          >
                            Enter Room
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 4. CONTRIBUTORS BLOCK */}
                <div className="border-4 p-8 bg-neutral-50" style={{ borderColor: themeColor }}>
                  <h3 className="text-xl font-black uppercase text-neutral-900 mb-6 tracking-tight">
                    Artists
                  </h3>

                  <div className="space-y-6">
                    {fakeContributors.map((con) => (
                      <div key={con.id} className="flex items-center gap-5 border-b border-neutral-200 pb-6 last:border-b-0 last:pb-0">
                        <div className="w-16 h-16 flex-shrink-0 overflow-hidden">
                          <img src={con.avatarUrl} alt={con.username} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow grid grid-cols-2 items-center gap-4">
                          <p className="text-lg font-bold text-neutral-900 font-mono tracking-tight">
                            {con.username}
                          </p>
                          <div className="text-right flex items-center justify-end gap-3">
                              <div className="w-32 h-2 bg-neutral-200 border border-black relative overflow-hidden hidden md:block">
                                  <div className="absolute inset-0 bg-neutral-900" style={{ width: `${con.contributionPercent}%`}} />
                              </div>
                              <p className="text-2xl font-black tabular-nums text-neutral-950 whitespace-nowrap">
                                  {con.contributionPercent}%
                              </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}