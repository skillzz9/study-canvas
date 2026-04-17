"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

// IMPORT YOUR LIVE COMPONENTS
import Window from "@/components/items/Window";
import Candle from "@/components/items/Candle";
import Clock from "@/components/items/Clock";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: string | null) => void;
  onCreateClick: () => void; 
  onSpawnItem?: (itemSrc: string) => void; 
}

const wallPresets = [
  { name: "Default", value: null, hex: "transparent" },
  { name: "Parchment", value: "#f5f2e9", hex: "#f5f2e9" },
  { name: "Antique", value: "#e8e2d6", hex: "#e8e2d6" },
  { name: "Slate", value: "#3d4043", hex: "#3d4043" },
  { name: "Muted Clay", value: "#8b7d72", hex: "#8b7d72" },
  { name: "Deep Ink", value: "#1a1c1e", hex: "#1a1c1e" },
];

const staticItems = [
  { name: "Window (Day)", src: "/items/window-light.png", forceTheme: "light" },
  { name: "Window (Night)", src: "/items/window-dark.png", forceTheme: "dark" },
];

const dynamicItems = [
  { name: "Candle (Light)", src: "/items/candle-light.png", forceTheme: "light" },
  { name: "Candle (Dark)", src: "/items/candle-dark.png", forceTheme: "dark" },
  { name: "Clock (Light)", src: "/items/clock-light.png", forceTheme: "light" },
  { name: "Clock (Dark)", src: "/items/clock-dark.png", forceTheme: "dark" },
];

export default function SideMenu({ isOpen, onClose, onColorSelect, onCreateClick, onSpawnItem }: SideMenuProps) {
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isStaticItemsOpen, setIsStaticItemsOpen] = useState(false); 
  const [isDynamicItemsOpen, setIsDynamicItemsOpen] = useState(false); 
  
  const { theme } = useTheme();
  const currentTheme = (theme === "light" ? "light" : "dark");

  // FIX: This function now ONLY tells the GalleryPage what to spawn.
  // The GalleryPage will handle the actual Firebase 'spawnItem' call.
  const handleSpawnClick = (itemSrc: string) => {
    onSpawnItem?.(itemSrc);
  };

  const renderPreview = (src: string, forcedTheme?: "light" | "dark") => {
    const appliedTheme = forcedTheme || currentTheme;
    switch (src) {
      case "/items/window-light.png":
      case "/items/window-dark.png":
        return (
          <div className="w-full h-[140px] flex justify-center items-start origin-top scale-[0.4] pointer-events-none mt-2">
            <Window theme={appliedTheme} />
          </div>
        );
      case "/items/candle-light.png":
      case "/items/candle-dark.png":
        return (
          <div className="w-full h-[60px] flex justify-center items-start origin-top scale-[0.45] pointer-events-none mt-2">
            <Candle theme={appliedTheme} />
          </div>
        );
      case "/items/clock-light.png":
      case "/items/clock-dark.png":
        return (
          <div className="w-full h-[80px] flex justify-center items-start origin-top scale-[0.4] pointer-events-none mt-2">
            <Clock theme={appliedTheme} />
          </div>
        );
      default: return null;
    }
  };

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
          <div className="h-full w-full bg-app-card border-r-4 border-app-border p-6 shadow-[10px_0px_0px_0px_rgba(0,0,0,0.3)] pointer-events-auto flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div className="mb-8" />
            <nav className="flex flex-col gap-4">
              {/* WALL COLOR */}
              <div className="flex flex-col gap-2">
                <button onClick={() => setIsColorOpen(!isColorOpen)} className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                  <span className="flex items-center gap-4">🎨 Wall color</span>
                  <span className={`transition-transform duration-300 ${isColorOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                <AnimatePresence>
                  {isColorOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-2 pl-4">
                      {wallPresets.map((preset) => (
                        <button key={preset.name} onClick={() => onColorSelect(preset.value)} className="flex items-center gap-3 p-2 hover:bg-app-accent/10 rounded-lg transition-colors group">
                          <div className="w-6 h-6 rounded-full border-2 border-app-border shadow-sm" style={{ backgroundColor: preset.hex }} />
                          <span className="text-[11px] font-bold uppercase text-app-text group-hover:text-app-accent">{preset.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CREATE PAINTING */}
              <button onClick={onCreateClick} className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-left">
                🖼️ Create new painting
              </button>

              {/* STATIC ITEMS */}
              <div className="flex flex-col gap-2">
                <button onClick={() => setIsStaticItemsOpen(!isStaticItemsOpen)} className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-left">
                  <span className="flex items-center gap-4">📦 Static items</span>
                  <span className={`transition-transform duration-300 ${isStaticItemsOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                <AnimatePresence>
                  {isStaticItemsOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-3 pt-2">
                      {staticItems.map((item) => (
                        <button key={item.name} onClick={() => handleSpawnClick(item.src)} className="flex flex-col items-center justify-between p-4 bg-app-bg border-4 border-app-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group w-full">
                          {renderPreview(item.src, item.forceTheme as "light" | "dark")}
                          <span className="text-[12px] font-black uppercase tracking-widest text-app-text group-hover:text-app-accent pb-2">{item.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* DYNAMIC ITEMS */}
              <div className="flex flex-col gap-2">
                <button onClick={() => setIsDynamicItemsOpen(!isDynamicItemsOpen)} className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-left">
                  <span className="flex items-center gap-4">⚡ Dynamic items</span>
                  <span className={`transition-transform duration-300 ${isDynamicItemsOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                <AnimatePresence>
                  {isDynamicItemsOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-3 pt-2">
                      {dynamicItems.map((item) => (
                        <button key={item.name} onClick={() => handleSpawnClick(item.src)} className="flex flex-col items-center justify-between p-4 bg-app-bg border-4 border-app-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group w-full">
                          {renderPreview(item.src, item.forceTheme as "light" | "dark")}
                          <span className="text-[12px] font-black uppercase tracking-widest text-app-text group-hover:text-app-accent pb-2">{item.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
            <div className="mt-auto pt-8">
              <p className="text-[10px] text-app-accent uppercase tracking-widest font-bold opacity-60">Edit Mode Active</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}