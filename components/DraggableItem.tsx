"use client";
import React from "react";
import { motion, useMotionValue } from "framer-motion";
import { useRef } from "react";

interface DraggableItemProps {
  id: number;
  initialX: number;
  initialY: number;
  scale: number; // The zoom level of your infinite canvas
  onSave: (id: number, x: number, y: number) => void;
  children: React.ReactNode;
}

export default function DraggableItem({ id, initialX, initialY, onSave, onClick, children }: any) {
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);
  
  // This ref tracks if we are currently in a drag operation
  const dragStarted = useRef(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => {
        // As soon as the item moves, we flip the switch
        dragStarted.current = true;
      }}
      onDragEnd={() => {
        onSave(id, x.get(), y.get());
        
        // We use a tiny timeout before resetting the ref.
        // This gives the 'click' event time to fire and see that 
        // dragStarted was still true, preventing the modal.
        setTimeout(() => {
          dragStarted.current = false;
        }, 100);
      }}
      onTap={() => {
        // Only trigger the modal if we didn't just finish a drag
        if (!dragStarted.current) {
          onClick();
        }
      }}
      style={{ x, y }}
      className="absolute cursor-grab active:cursor-grabbing z-30"
    >
      {children}
    </motion.div>
  );
}