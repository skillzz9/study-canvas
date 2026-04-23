"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

// IMPORT YOUR LIVE COMPONENTS
import Window from "@/components/items/Window";
import Candle from "@/components/items/Candle";
import Clock from "@/components/items/Clock";
import PostItNote from "@/components/items/PostItNote";
import AffirmationWoodBoard from "@/components/items/AffirmationBoard";
import RetroTV from "@/components/items/RetroTV"; 
import SimpleShelf from "@/components/items/SimpleShelf";
import TodoList from "./items/TodoList";
import JoinPaintingModal from "./JoinPaintingModal";

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
  { name: "Window (Day)", src: "/items/window-light.png", forceTheme: "light", requiredHours: 0 },
  { name: "Window (Night)", src: "/items/window-dark.png", forceTheme: "dark", requiredHours: 20 },
];

const dynamicItems = [
  { name: "Candle (Light)", src: "/items/candle-light.png", forceTheme: "light", requiredHours: 5 },
  { name: "Candle (Dark)", src: "/items/candle-dark.png", forceTheme: "dark", requiredHours: 15 },
  { name: "Clock (Light)", src: "/items/clock-light.png", forceTheme: "light", requiredHours: 25 },
  { name: "Clock (Dark)", src: "/items/clock-dark.png", forceTheme: "dark", requiredHours: 50 },
];

const stationeryItems = [
  { name: "Post-it Note", src: "post-it", requiredHours: 0 },
  { name: "Todo List", src: "todo-list", requiredHours: 0 }, 
  { name: "Affirmations Board", src: "affirmation-board", requiredHours: 40 },
];

const studioGear = [
  { name: "Simple Shelf", src: "simple-shelf", requiredHours: 0 },
  { name: "Retro TV", src: "retro-tv", requiredHours: 0 },
  { name: "Mystery Gear", src: "mystery", requiredHours: 100 },
];

export default function SideMenu({ isOpen, onClose, onColorSelect, onCreateClick, onSpawnItem }: SideMenuProps) {
  const totalHours = 32;

  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isStaticItemsOpen, setIsStaticItemsOpen] = useState(false); 
  const [isDynamicItemsOpen, setIsDynamicItemsOpen] = useState(false); 
  const [isStationeryOpen, setIsStationeryOpen] = useState(false); 
  const [isStudioGearOpen, setIsStudioGearOpen] = useState(false); 
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  const { theme } = useTheme();
  const currentTheme = (theme === "light" ? "light" : "dark");

  const handleSpawnClick = (itemSrc: string, isLocked: boolean) => {
    if (isLocked) return;
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
      case "post-it":
        return (
          <div className="w-full h-[80px] flex justify-center items-center scale-[0.35] pointer-events-auto cursor-default">
            <PostItNote theme={appliedTheme as any} />
          </div>
        );
      case "affirmation-board":
        return (
          <div className="w-full h-[100px] flex justify-center items-center scale-[0.25] pointer-events-auto cursor-default">
            <AffirmationWoodBoard />
          </div>
        );
      case "retro-tv":
        return (
          <div className="w-full h-[100px] flex justify-center items-center scale-[0.4] origin-center pointer-events-none">
            <RetroTV theme={appliedTheme as any} />
          </div>
        );
      case "simple-shelf":
        return (
          <div className="w-full h-[60px] flex justify-center items-center scale-[0.6] origin-center pointer-events-none">
            <SimpleShelf theme={appliedTheme as any} />
          </div>
        );
      case "mystery":
        return (
          <div className="w-full h-[100px] flex items-center justify-center">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-20">
               <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
               <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
             </svg>
          </div>
        );
      case "todo-list":
        return (
          <div className="w-full h-[120px] flex justify-center items-center scale-[0.35] origin-center pointer-events-none">
            <TodoList theme={appliedTheme as any} />
          </div>
        );
      default: return null;
    }
  };

  const ItemCard = ({ item, forcedTheme }: { item: any, forcedTheme?: string }) => {
    const isLocked = totalHours < item.requiredHours;
    return (
      <button 
        onClick={() => handleSpawnClick(item.src, isLocked)} 
        className={`relative w-full min-h-[180px] flex flex-col items-stretch overflow-hidden border-2 border-app-border transition-all group ${isLocked ? 'cursor-not-allowed' : 'hover:translate-x-[1px] hover:translate-y-[1px]'}`}
      >
        {isLocked ? (
          <>
            <div className="flex-1 bg-black flex flex-col items-center justify-center gap-4 px-2">
              <div className="w-12 h-12 border-2 border-white/20 rounded-full flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="opacity-60">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div className="border border-white/30 px-4 py-1.5 flex items-center justify-center">
                <span className="text-[11px] font-black text-white uppercase tracking-tighter text-center whitespace-nowrap">
                  {item.requiredHours}H Goal
                </span>
              </div>
            </div>
            <div className="h-10 bg-app-card border-t-2 border-app-border flex items-center justify-center px-2">
              <span className="text-[12px] font-black text-app-text/30 tracking-[0.3em] pl-[0.3em] text-center whitespace-nowrap">
                ???
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 bg-app-bg flex items-center justify-center">
              {renderPreview(item.src, forcedTheme as any)}
            </div>
            <div className="h-10 bg-app-card border-t-2 border-app-border flex items-center justify-center px-2">
              <span className="text-[12px] font-black uppercase tracking-widest text-app-text group-hover:text-app-accent text-center whitespace-nowrap">
                {item.name}
              </span>
            </div>
          </>
        )}
      </button>
    );
  };

  return (
    <>
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

                <button onClick={onCreateClick} className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-left">
                  🖼️ Create new painting
                </button>

                <button 
                  onClick={() => setIsJoinModalOpen(true)} 
                  className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-left"
                >
                  👥 Join shared painting
                </button>

                <div className="flex flex-col gap-2">
                  <button onClick={() => setIsStationeryOpen(!isStationeryOpen)} className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-left">
                    <span className="flex items-center gap-4">📝 Stationery</span>
                    <span className={`transition-transform duration-300 ${isStationeryOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  <AnimatePresence>
                    {isStationeryOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-3 pt-2">
                        {stationeryItems.map((item) => <ItemCard key={item.name} item={item} />)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={() => setIsStudioGearOpen(!isStudioGearOpen)} className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-left">
                    <span className="flex items-center gap-4">📺 Studio Gear</span>
                    <span className={`transition-transform duration-300 ${isStudioGearOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  <AnimatePresence>
                    {isStudioGearOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-3 pt-2">
                        {studioGear.map((item) => <ItemCard key={item.name} item={item} />)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={() => setIsStaticItemsOpen(!isStaticItemsOpen)} className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-left">
                    <span className="flex items-center gap-4">📦 Static items</span>
                    <span className={`transition-transform duration-300 ${isStaticItemsOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  <AnimatePresence>
                    {isStaticItemsOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-3 pt-2">
                        {staticItems.map((item) => <ItemCard key={item.name} item={item} forcedTheme={item.forceTheme} />)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={() => setIsDynamicItemsOpen(!isDynamicItemsOpen)} className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-left">
                    <span className="flex items-center gap-4">⚡ Dynamic items</span>
                    <span className={`transition-transform duration-300 ${isDynamicItemsOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  <AnimatePresence>
                    {isDynamicItemsOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex flex-col gap-3 pt-2">
                        {dynamicItems.map((item) => <ItemCard key={item.name} item={item} forcedTheme={item.forceTheme} />)}
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

      <JoinPaintingModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
      />
    </>
  );
}