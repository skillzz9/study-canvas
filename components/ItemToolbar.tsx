"use client";
import React from "react";
import { motion } from "framer-motion";

interface ItemToolbarProps {
  onDelete: () => void;
  onBringToFront: () => void;
  onBringToBack: () => void;
  theme?: "light" | "dark"; // ADDED: This fixes the Type Error
}

export default function ItemToolbar({
  onDelete,
  onBringToFront,
  onBringToBack,
  theme, // Destructured here to satisfy the compiler
}: ItemToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      className="flex items-center gap-1 p-1 bg-app-card border-4 border-app-border pointer-events-auto"
    >
      {/* BRING TO FRONT - UP ARROW */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBringToFront();
        }}
        className="p-2 hover:bg-app-accent/20 text-app-text transition-colors"
        title="Bring to front"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 15-6-6-6 6"/>
        </svg>
      </button>

      {/* BRING TO BACK - DOWN ARROW */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBringToBack();
        }}
        className="p-2 hover:bg-app-accent/20 text-app-text transition-colors"
        title="Bring to back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {/* Brutalist Divider */}
      <div className="w-[3px] h-6 bg-app-border mx-1" />

      {/* DELETE */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-2 hover:bg-red-500/20 text-red-500 transition-colors"
        title="Delete"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </motion.div>
  );
}