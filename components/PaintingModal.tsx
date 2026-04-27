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
  shareCode?: string | null;
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
  targetHours,          
  dateCreated,
  shareCode
}: PictureModalProps) {
  const router = useRouter();

  const [localTitle, setLocalTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);
  const [sessionGoal, setSessionGoal] = useState<number>(60);
  const [copied, setCopied] = useState(false);

  const percentage = Math.round((revealedCount / totalBlocks) * 100);
  const isFinished = revealedCount >= totalBlocks;

  const gridSize = 6;
  const blocksPerLayer = gridSize * gridSize;
  const totalLayers = Math.floor(totalBlocks / blocksPerLayer); 
  
  const currentLayerIndex = Math.min(Math.floor(revealedCount / blocksPerLayer), totalLayers - 1);
  const baseLevel = isFinished ? 6 : (currentLayerIndex + 1);
  const topLevel = currentLayerIndex + 2;

  useEffect(() => {
    setLocalTitle(title);
    setIsEditing(false);
    setCopied(false);
  }, [title, isOpen]);

  // pushes to the link where the room is happening
  const handleContinuePainting = () => {
    router.push(`/studyroom?paintingId=${id}&goal=${sessionGoal}`);
  };

  const handleCopyCode = () => {
    if (!shareCode) return;
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
                
                {/* 1. THE IMAGE PREVIEW */}
                <div key={id} className="border-4 border-app-border bg-app-bg p-3 mb-10 flex justify-center">
                  <div className="relative w-full max-w-[400px] aspect-square bg-app-bg border-2 border-app-border/20 overflow-hidden shadow-inner">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-black uppercase text-app-text/30 tracking-widest">Empty Canvas</span>
                    </div>
                    <div className="absolute inset-0 bg-[#F5F5F5] overflow-hidden">
                      <Level imageSrc={src} level={baseLevel as any} />
                    </div>
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
                      onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
                      className="text-5xl font-black uppercase tracking-tighter text-app-text leading-none mb-2 w-full bg-transparent border-b-2 border-app-border/50 outline-none focus:border-app-border"
                    />
                  ) : (
                    <h2 
                      onClick={() => setIsEditing(true)}
                      className="text-5xl font-black uppercase tracking-tighter text-app-text leading-none mb-2 cursor-text hover:opacity-70 transition-opacity"
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
                  <div className="border-4 border-app-border p-6 bg-app-bg flex flex-col justify-center">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-app-text/60 mb-3">Canvas Completion</h4>
                    <p className="text-4xl font-black tabular-nums tracking-tight text-app-text mb-1">{percentage}%</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-app-text/50">Progress: {revealedCount} / {totalBlocks} Blocks</p>
                  </div>

                  <div className="border-4 border-app-border p-6 bg-app-text text-app-bg flex flex-col justify-center">
                    {isFinished ? (
                      <div className="text-center">
                        <h4 className="text-2xl font-black uppercase tracking-tight text-app-bg">Masterpiece Complete</h4>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-app-bg/70 mb-3">Next Session Goal (Mins)</h4>
                        <div className="flex gap-4">
                          <input 
                            type="number" 
                            value={sessionGoal}
                            onChange={(e) => setSessionGoal(Number(e.target.value))}
                            className="bg-transparent border-b-4 border-app-bg/50 text-3xl font-black tabular-nums w-24 outline-none text-app-bg pb-1 focus:border-app-bg transition-colors"
                          />
                          <button 
                          // The function responsible for joining the painting
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

                {/* 4. MULTIPLAYER SYNC SECTION */}
                {shareCode && (
                  <div className="mt-10 border-4 border-app-border border-dashed p-6 bg-app-card flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
                    <div className="flex flex-col text-center md:text-left">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-app-accent mb-1">Canvas Sync ID</h4>
                      <p className="text-[10px] font-bold uppercase text-app-text/40 tracking-widest">Share this code with your study squad</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div 
                        onClick={handleCopyCode}
                        className="bg-app-bg border-4 border-app-border px-8 py-3 rounded-2xl cursor-pointer hover:border-app-accent transition-all group relative active:scale-95"
                      >
                        <span className="text-3xl font-mono font-black tracking-[0.4em] text-app-text pl-[0.4em]">
                          {shareCode}
                        </span>
                      </div>
                      <button 
                        onClick={handleCopyCode}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'text-green-500' : 'text-app-text/40 hover:text-app-accent'}`}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}