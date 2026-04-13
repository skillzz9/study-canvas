"use client";
import React, { useEffect, useRef, useState } from "react";

// Track the parameters of the liquid warps
interface WarpOp {
  type: "swirl" | "dent";
  cx: number;
  cy: number;
  radius: number;
  strength: number;
}

// A helper function that applies complex math to manipulate raw pixels
function applyWarp(srcData: ImageData, width: number, height: number, op: WarpOp, progress: number): ImageData {
  const dst = new Uint8ClampedArray(srcData.data.length);
  const { type, cx, cy, radius, strength } = op;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let srcX = x;
      let srcY = y;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const falloff = Math.pow((radius - dist) / radius, 2); 
        
        if (type === "swirl") {
          const angleOffset = strength * falloff * progress;
          const currentAngle = Math.atan2(dy, dx);
          const newAngle = currentAngle - angleOffset;
          srcX = cx + dist * Math.cos(newAngle);
          srcY = cy + dist * Math.sin(newAngle);
        } else if (type === "dent") {
          const factor = 1 - (strength * falloff * progress);
          srcX = cx + dx * factor;
          srcY = cy + dy * factor;
        }
      }

      srcX = Math.max(0, Math.min(width - 1, Math.floor(srcX)));
      srcY = Math.max(0, Math.min(height - 1, Math.floor(srcY)));

      const dstIdx = (y * width + x) * 4;
      const srcIdx = (srcY * width + srcX) * 4;

      dst[dstIdx] = srcData.data[srcIdx];         
      dst[dstIdx + 1] = srcData.data[srcIdx + 1]; 
      dst[dstIdx + 2] = srcData.data[srcIdx + 2]; 
      dst[dstIdx + 3] = srcData.data[srcIdx + 3]; 
    }
  }
  return new ImageData(dst, width, height);
}

export default function TestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [snapshots, setSnapshots] = useState<ImageData[]>([]);
  const [operations, setOperations] = useState<WarpOp[]>([]);
  
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationFrameRef = useRef<number>();

  // 1. Initial Load and Brutal Scramble
  useEffect(() => {
    const img = new Image();
    img.src = "/test.png"; 
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400; 
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0, 400, 400);
      
      const history: ImageData[] = [];
      const ops: WarpOp[] = [];
      
      let currentData = ctx.getImageData(0, 0, 400, 400);
      history.push(currentData);

      // Apply 80 extreme overlapping warps to completely destroy the image
      const totalWarps = 80;
      for (let i = 0; i < totalWarps; i++) {
        const type = Math.random() > 0.5 ? "swirl" : "dent";
        
        const op: WarpOp = {
          type,
          cx: Math.random() * 400,
          cy: Math.random() * 400,
          // Massive radii so they overlap and affect huge chunks of the canvas
          radius: Math.random() * 200 + 100, 
          // Extreme strength (up to 5 full rotations for swirls, huge bulges for dents)
          strength: type === "swirl" ? (Math.random() - 0.5) * Math.PI * 10 : (Math.random() - 0.5) * 4.0
        };

        currentData = applyWarp(currentData, 400, 400, op, 1.0);
        
        ops.push(op);
        history.push(currentData);
      }

      setSnapshots(history);
      setOperations(ops);
      setIsReady(true);

      const mainCanvas = canvasRef.current;
      const mainCtx = mainCanvas?.getContext("2d");
      if (mainCtx) {
        mainCtx.putImageData(history[history.length - 1], 0, 0);
      }
    };
  }, []);

  // 2. The Reverse Animation Logic
  const handleStart = () => {
    if (!isReady || isPlaying || snapshots.length === 0) return;
    setIsPlaying(true);

    const mainCanvas = canvasRef.current;
    const mainCtx = mainCanvas?.getContext("2d");
    if (!mainCanvas || !mainCtx) return;

    let currentStateIndex = snapshots.length - 1;
    let progress = 1.0; 
    
    // Set to 0.15 so going through all 80 frames takes roughly 8 to 10 seconds
    const animationSpeed = 0.15; 

    const animate = () => {
      if (currentStateIndex <= 0) {
        mainCtx.putImageData(snapshots[0], 0, 0);
        setIsPlaying(false);
        return; 
      }

      progress -= animationSpeed;
      if (progress < 0) progress = 0;

      const op = operations[currentStateIndex - 1];
      const cleanSnapshot = snapshots[currentStateIndex - 1];

      const ease = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const animatedData = applyWarp(cleanSnapshot, 400, 400, op, ease);
      mainCtx.putImageData(animatedData, 0, 0);

      if (progress === 0) {
        currentStateIndex--;
        progress = 1.0;
      }

      if (currentStateIndex > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        mainCtx.putImageData(snapshots[0], 0, 0);
        setIsPlaying(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center gap-8 font-mono">
      <div className="w-[400px] h-[400px] relative shadow-2xl bg-white rounded-2xl border-4 border-neutral-800 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="absolute inset-0 z-10 w-full h-full"
        />
      </div>

      <button 
        onClick={handleStart}
        disabled={!isReady || isPlaying}
        className="px-8 py-3 bg-blue-600 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors"
      >
        {!isReady ? "GENERATING WARPS..." : isPlaying ? "UNWINDING..." : "START REVERSE REVEAL"}
      </button>
    </main>
  );
}