"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuOptions = [
  { id: "color", label: "Wall color", icon: "🎨" },
  { id: "create", label: "Create new painting", icon: "🖼️" },
  { id: "static", label: "Static items", icon: "📦" },
  { id: "dynamic", label: "Dynamic items", icon: "⚡" },
];

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
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
          <div className="h-full w-full bg-app-card border-r-4 border-app-border p-8 shadow-[10px_0px_0px_0px_rgba(0,0,0,0.3)] pointer-events-auto flex flex-col">
            <div className="flex justify-between items-center mb-12">
            </div>

            <nav className="flex flex-col gap-4">
              {menuOptions.map((option) => (
                <button
                  key={option.id}
                  className="w-full p-4 bg-app-bg border-4 border-app-border text-app-text font-bold uppercase text-[12px] flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-left"
                >
                  <span className="text-xl">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto">
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