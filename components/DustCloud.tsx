"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DustCloudProps {
  // Pass the actual rendered pixel width/height of the square
  cellSize: number;
}

// Simple unique ID generator for the key prop
const generateId = () => `dust-${Math.random().toString(36).substr(2, 9)}`;

export default function DustCloud({ cellSize }: DustCloudProps) {
  // This state holds the currently active particles
  const [particles, setParticles] = useState<{ id: string; x: number; y: number; scale: number; }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Calculate a random displacement from the center (Fight Cloud chaos)
      // They spawn slightly offset from true center
      const spawnVariance = cellSize * 0.1;
      const x = (Math.random() - 0.5) * spawnVariance;
      const y = (Math.random() - 0.5) * spawnVariance;

      // Random starting scale: some start tiny, some start medium
      const scale = 0.3 + Math.random() * 0.7;

      const newParticle = { id: generateId(), x, y, scale };

      // Add the new particle
      setParticles((prev) => [...prev, newParticle]);

      // PARTICLE DEATH: Automatically remove this particle after 600ms
      // (Matches the 'exit' animation duration)
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 600);
    }, 100); // How frantic the "boiling" looks (spawn rate)

    return () => clearInterval(interval);
  }, [cellSize]);

  return (
    // We position this over the grid square using absolute positioning
    <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            // Neubrutalist Styling: Opaque, strong borders, soft shadow
            className="absolute rounded-full bg-white border-2 border-neutral-300 shadow-xl"
            
            // Defines the size of each dust puff
            style={{
              width: `${cellSize * 1.0}px`, // Puffs are roughly size of the square
              height: `${cellSize * 1.0}px`,
            }}

            // FRAMER MOTION ANIMATIONS
            initial={{ 
              x: p.x, 
              y: p.y, 
              scale: 0, 
              opacity: 1 // Users wanted "no opacity" (fully solid) initially
            }}
            
            animate={{
              // Move further outward randomly as they grow
              x: p.x + (Math.random() - 0.5) * (cellSize * 0.8),
              y: p.y + (Math.random() - 0.5) * (cellSize * 0.8),
              
              // Scale up past full size, then back down slightly (Fight Cloud effect)
              scale: [0, p.scale * 2.2, p.scale * 1.6],
              opacity: 1, // Stay solid
              
              transition: {
                duration: 0.5,
                ease: "backOut", // Puffs out quickly
              },
            }}
            
            exit={{
              // Disappear quickly at the very end
              scale: 0,
              opacity: 0,
              transition: {
                duration: 0.1, // Quick instant vanish
                ease: "easeIn",
              },
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}