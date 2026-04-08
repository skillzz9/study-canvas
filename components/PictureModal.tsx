"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
interface Contributor {
  id: number;
  username: string;
  avatarUrl: string; // URL for avatar image
  contributionPercent: number;
}

interface PictureModalProps {
  isOpen: boolean;       // Controls visibility
  onClose: () => void;  // Function to close modal
  src: string;           // Image source passed from the frame
  title: string;         // Title of the piece
  date: string;          // Date created (Passed from data)
}

// --- FAKE DATA FOR DEMO ---
const fakeMeta = {
  timeTaken: "14h 32m 08s", // Total time logged in StudyCanvas
};

const fakeContributors: Contributor[] = [
  { id: 1, username: "Alpha_Synth", avatarUrl: "https://api.dicebear.com/8.x/pixel-art/svg?seed=alpha", contributionPercent: 45 },
  { id: 2, username: "LogicGate_01", avatarUrl: "https://api.dicebear.com/8.x/pixel-art/svg?seed=logic", contributionPercent: 30 },
  { id: 3, username: "Pixel_Vandal", avatarUrl: "https://api.dicebear.com/8.x/pixel-art/svg?seed=vandal", contributionPercent: 25 },
];

// --- COMPONENT ---
export default function PictureModal({ isOpen, onClose, src, title, date }: PictureModalProps) {
  const themeColor = "#000"; // Locked to Black Neubrutalist

  return (
    <AnimatePresence>
      {isOpen && (
        // OVERLAY (Backdrop)
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Close when clicking backdrop
          className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
        >
          {/* MODAL CONTAINER */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            className="bg-white border-4 relative max-w-4xl w-full max-h-[90vh] overflow-y-auto cursor-default shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] font-space"
            style={{ borderColor: themeColor }}
          >
            {/* CLOSE BUTTON (X) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 border-2 w-10 h-10 flex items-center justify-center bg-white hover:bg-neutral-100 transition-colors z-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              style={{ borderColor: themeColor }}
            >
              <span className="text-2xl font-black leading-none">×</span>
            </button>

            {/* --- CONTENT LAYOUT --- */}
            <div className="p-8 md:p-12">
              
              {/* 1. THE IMAGE (Top & Center) */}
              <div 
                className="border-4 bg-neutral-100 p-3 mb-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                style={{ borderColor: themeColor }}
              >
                <img 
                  src={src} 
                  alt={title} 
                  className="w-full h-auto max-h-[60vh] object-contain block mx-auto" 
                />
              </div>

              {/* 2. HEADER: TITLE & DATE */}
              <div className="border-b-4 pb-6 mb-8" style={{ borderColor: themeColor }}>
                <h2 className="text-5xl font-black uppercase italic tracking-tighter text-neutral-900 leading-none mb-2">
                  {title}
                </h2>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-neutral-400">
                   Minted: {date}
                </p>
              </div>

              {/* 3. META INFO GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                
                {/* TIME TAKEN BLOCK */}
                <div className="border-4 p-6 bg-neutral-50" style={{ borderColor: themeColor }}>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-400 mb-3">
                    Total Creation Time
                  </h4>
                  <p className="text-4xl font-black tabular-nums tracking-tight text-neutral-950">
                    {fakeMeta.timeTaken}
                  </p>
                </div>

                {/* PLACEHOLDER / ADDITIONAL BLOCK (Keeps layout balanced) */}
                <div className="border-4 p-6 border-dashed border-neutral-300 flex items-center justify-center bg-neutral-50">
                    <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                        Metadata block v1.2
                    </span>
                </div>
              </div>

              {/* 4. CONTRIBUTORS BLOCK */}
              <div className="border-4 p-8 bg-neutral-50" style={{ borderColor: themeColor }}>
                <h3 className="text-xl font-black uppercase text-neutral-900 mb-6 tracking-tight">
                  Vault Contributors
                </h3>

                <div className="space-y-6">
                  {fakeContributors.map((con) => (
                    <div key={con.id} className="flex items-center gap-5 border-b border-neutral-200 pb-6 last:border-b-0 last:pb-0">
                      
                      {/* AVATAR PICTURE */}
                      <div 
                        className="w-16 h-16 border-4 flex-shrink-0 bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        style={{ borderColor: themeColor }}
                      >
                        <img src={con.avatarUrl} alt={con.username} className="w-full h-full object-cover" />
                      </div>

                      {/* USERNAME & CONTRIBUTION % */}
                      <div className="flex-grow grid grid-cols-2 items-center gap-4">
                        <p className="text-lg font-bold text-neutral-900 font-mono tracking-tight">
                          @{con.username}
                        </p>
                        <div className="text-right flex items-center justify-end gap-3">
                            {/* Simple Visual Bar */}
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

            </div> {/* End Content Layout */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}