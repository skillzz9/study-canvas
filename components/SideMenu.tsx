"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: string | null) => void;
  onCreateClick: () => void; // ADD THIS PROP
}

const wallPresets = [
  { name: "Default", value: null, hex: "transparent" },
  { name: "Parchment", value: "#f5f2e9", hex: "#f5f2e9" },
  { name: "Antique", value: "#e8e2d6", hex: "#e8e2d6" },
  { name: "Slate", value: "#3d4043", hex: "#3d4043" },
  { name: "Muted Clay", value: "#8b7d72", hex: "#8b7d72" },
  { name: "Deep Ink", value: "#1a1c1e", hex: "#1a1c1e" },
];

export default function SideMenu({ isOpen, onClose, onColorSelect, onCreateClick }: SideMenuProps) {
  const [isColorOpen, setIsColorOpen] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 left-0 h-full w-80 z-[70] pointer-events-none flex flex-col"
        >
          <div className="h-full w-full bg-app-card border-r-4 border-app-border p-8 shadow-[10px_0px_0px_0px_rgba(0,0,0,0.3)] pointer-events-auto flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center mb-12">
            </div>

            <nav className="flex flex-col gap-4">
              {/* WALL COLOR DROPDOWN */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setIsColorOpen(!isColorOpen)}
                  className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  <span className="flex items-center gap-4">
                    <span className="text-xl">🎨</span> Wall color
                  </span>
                  <span className={`transition-transform duration-300 ${isColorOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                <AnimatePresence>
                  {isColorOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden flex flex-col gap-2 pl-4"
                    >
                      {wallPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => onColorSelect(preset.value)}
                          className="flex items-center gap-3 p-2 hover:bg-app-accent/10 rounded-lg transition-colors group"
                        >
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-app-border shadow-sm"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span className="text-[11px] font-bold uppercase text-app-text group-hover:text-app-accent">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* OTHER BUTTONS */}
 <button 
  onClick={onCreateClick} // UPDATE THIS BUTTON
  className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-left"
>
  <span className="text-xl">🖼️</span> Create new painting
</button>
              <button className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-left">
                <span className="text-xl">📦</span> Static items
              </button>
              <button className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-left">
                <span className="text-xl">⚡</span> Dynamic items
              </button>
            </nav>

            <div className="mt-auto pt-8">
              <p className="text-[10px] text-app-accent uppercase tracking-widest font-bold opacity-60">
                Edit Mode Active
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}