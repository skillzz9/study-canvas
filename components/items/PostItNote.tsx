"use client";
import React, { useState, useEffect } from "react";

interface PostItNoteProps {
  initialText?: string;
  onSave?: (text: string) => void;
  theme?: "light" | "dark"; // New prop to control the vibe
}

export default function PostItNote({ 
  initialText = "", 
  onSave,
  theme // Destructure the mode
}: PostItNoteProps) {
  const [text, setText] = useState(initialText);

  // If you pass a mode, it will wrap the component in that theme class
  // If no mode is passed, it just follows the global system theme
  const themeClass = theme === "light" ? "light" : theme === "dark" ? "dark" : "";

  return (
    <div className={`relative p-4 inline-block ${themeClass}`}>
      {/* THE PIN */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 w-4 h-4 bg-[var(--bg-card)] rounded-full border-4 border-app-border shadow-sm" />

      {/* THE NOTE BODY */}
      <div 
        className="w-56 h-56 p-6 bg-[var(--accent-main)] border-4 border-app-border shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] flex flex-col transition-colors duration-300"
      >
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (onSave) onSave(e.target.value);
          }}
          placeholder="Jot down a thought..."
          className="w-full h-full bg-transparent resize-none outline-none font-space text-sm font-black text-[var(--bg-main)] placeholder:text-[var(--bg-main)]/30 leading-tight no-scrollbar"
        />
      </div>
    </div>
  );
}