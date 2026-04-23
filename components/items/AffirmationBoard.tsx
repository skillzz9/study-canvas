"use client";
import React, { useState } from "react";

interface AffirmationWoodBoardProps {
  initialAffirmations?: string[];
  onSave?: (affirmations: string[]) => void;
}

export default function AffirmationWoodBoard({
  initialAffirmations = ["", "", "", "", ""],
  onSave,
}: AffirmationWoodBoardProps) {
  const [inputs, setInputs] = useState<string[]>(
    initialAffirmations.slice(0, 5).concat(Array(5).fill("")).slice(0, 5)
  );

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
    if (onSave) onSave(newInputs);
  };

  return (
    <div className="relative p-2 inline-block select-none">
      {/* MINIMAL HANGING PIN */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 w-3 h-3 bg-[var(--border-main)] rounded-full border-2 border-[var(--bg-main)]" />

      {/* COMPACT BOARD */}
      <div className="relative w-[280px] bg-[var(--accent-main)] border-4 border-[var(--border-main)] rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
        
        {/* SUBTLE TEXTURED OVERLAY */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none" />

        <div className="flex flex-col py-2">
          {inputs.map((text, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 px-4 py-2"
            >
              {/* COMPACT "I AM" */}
              <span className="text-[14px] font-black uppercase tracking-tight text-[var(--bg-main)] opacity-40 whitespace-nowrap">
                I AM
              </span>

              {/* MINIMAL INPUT LINE */}
              <input
                type="text"
                value={text}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder="..."
                className="flex-1 bg-transparent border-b-2 border-[var(--bg-main)]/10 focus:border-[var(--bg-main)]/40 text-[14px] font-bold text-[var(--bg-main)]/80 placeholder:text-[var(--bg-main)]/5 outline-none transition-all pb-0.5"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}