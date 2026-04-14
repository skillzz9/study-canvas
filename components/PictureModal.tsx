"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import GridRevealMask from "@/components/GridRevealMask";
import Level from "@/components/Level"; 

interface PictureModalProps {
  isOpen: boolean;       
  onClose: () => void;  
  id: string; 
  src: string;           
  title: string;         
  date: string;          
  revealedCount: number;
  totalBlocks: number;
  shuffledIndices: number[];
  targetHours?: number;  
  dateCreated?: string;  
}

export default function PictureModal({ 
  isOpen, 
  onClose, 
  id,
  src, 
  title, 
  date,
  revealedCount,
  totalBlocks,
  shuffledIndices,
  targetHours = 10,          
  dateCreated = "APR 14, 2026"   
}: PictureModalProps) {
  const router = useRouter();

  // STATE
  const [localTitle, setLocalTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);
  const [sessionGoal, setSessionGoal] = useState<number>(60); // Default 60 minutes

  // DERIVED DATA
  const percentage = Math.round((revealedCount / totalBlocks) * 100);
  const isFinished = revealedCount >= totalBlocks;
  
  // Calculate hours left
  const hoursGoal = targetHours;
  const hoursLeft = Math.max(0, ((totalBlocks - revealedCount) / totalBlocks) * hoursGoal).toFixed(1);

  // Exact same math from your Study Room and Gallery
  const gridSize = 6;
  const blocksPerLayer = gridSize * gridSize;
  const totalLayers = Math.floor(totalBlocks / blocksPerLayer); 
  
  const currentLayerIndex = Math.min(Math.floor(revealedCount / blocksPerLayer), totalLayers - 1);
  const baseLevel = isFinished ? 6 : (currentLayerIndex + 1);
  const topLevel = currentLayerIndex + 2;

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
              className="bg-app-card border-4 border-app-border relative max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar cursor-default shadow-[12px_12px_0px_0px_rgba(0,0,0,0.3)] font-space text-app-text"
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 border-2 border-app-border w-10 h-10 flex items-center justify-center bg-app-card hover:bg-app-bg transition-colors z-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] text-app-text"
              >
                <span className="text-2xl font-black leading-none">×</span>
              </button>

              <div className="p-8 md:p-12">
                
                {/* 1. THE IMAGE (WITH REVEAL MASK & LEVELS) */}
                <div className="border-4 border-app-border bg-app-bg p-3 mb-10 flex justify-center">
                  <div className="relative w-full max-w-[500px] aspect-square bg-app-bg border-2 border-app-border/20 overflow-hidden shadow-inner">
                    
                    {/* Empty Canvas Text (Just in case it hasn't loaded yet) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-black uppercase text-app-text/30 tracking-widest">
                        Empty Canvas
                      </span>
                    </div>
                    
                    {/* BACKGROUND LAYER (The sketch or the last completed layer) */}
                    <div className="absolute inset-0 z-0">
                      <Level imageSrc={src} level={baseLevel as any} />
                    </div>

                    {/* ACTIVE PAINTING LAYER (What the mask is currently revealing) */}
                    {!isFinished && (
                      <div className="absolute inset-0 z-10">
                        <GridRevealMask 
                          revealedCount={revealedCount} 
                          gridSize={gridSize} 
                          fullShuffledIndices={shuffledIndices}
                          currentLayerIndex={currentLayerIndex} 
                          isStatic={true} 
                          allLayers={false} 
                        >
                          <Level imageSrc={src} level={topLevel as any} />
                        </GridRevealMask>
                      </div>
                    )}

                  </div>
                </div>

                {/* 2. HEADER */}
                <div className="border-b-4 border-app-border pb-6 mb-8">
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
                      className="text-5xl font-black uppercase tracking-tighter text-app-text leading-none mb-2 w-full bg-transparent border-b-2 border-app-border/50 outline-none focus:border-app-border"
                    />
                  ) : (
                    <h2 
                      onClick={() => setIsEditing(true)}
                      className="text-5xl font-black uppercase tracking-tighter text-app-text leading-none mb-2 cursor-text hover:opacity-70 transition-opacity"
                      title="Click to edit title"
                    >
                      {localTitle}
                    </h2>
                  )}
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-app-text/60">
                     {date} <span className="mx-2 opacity-50">•</span> CREATED: {dateCreated}
                  </p>
                </div>

                {/* 3. META INFO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  
                  {/* PROGRESS BLOCK */}
                  <div className="border-4 border-app-border p-6 bg-app-bg flex flex-col justify-center">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-app-text/60 mb-3">
                      Canvas Completion
                    </h4>
                    <p className="text-4xl font-black tabular-nums tracking-tight text-app-text mb-1">
                      0h / 1h
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-app-text/50">
                      {percentage}% Complete
                    </p>
                  </div>

                  {/* ACTION BLOCK (CONTINUE PAINTING) */}
                  {/* Notice how the text and background classes are inverted here for that brutalist contrast */}
                  <div className="border-4 border-app-border p-6 bg-app-text text-app-bg flex flex-col justify-center">
                    {isFinished ? (
                      <div className="text-center">
                        <h4 className="text-2xl font-black uppercase tracking-tight text-app-bg">Masterpiece Complete</h4>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-app-bg/70 mb-3">
                          Next Session Goal (Mins)
                        </h4>
                        <div className="flex gap-4">
                          <input 
                            type="number" 
                            min="1"
                            value={sessionGoal}
                            onChange={(e) => setSessionGoal(Number(e.target.value))}
                            className="bg-transparent border-b-4 border-app-bg/50 text-3xl font-black tabular-nums w-24 outline-none text-app-bg pb-1 focus:border-app-bg transition-colors"
                          />
                          <button 
                            onClick={handleContinuePainting}
                            className="flex-1 bg-app-bg text-app-text font-black uppercase text-sm border-4 border-app-bg hover:opacity-90 transition-all hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none"
                          >
                            Enter Room
                          </button>
                        </div>
                      </>
                    )}
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