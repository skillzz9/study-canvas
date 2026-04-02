"use client";

import { useState, useEffect } from "react";
import ImageUploader from "@/components/ImageUploader";
import CanvasSketch from "@/components/CanvasSketch";

type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [level, setLevel] = useState<Level>(5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("user-avatar");
    if (saved) setImage(saved);
  }, []);

  const cycleLevel = () => {
const nextLevel = (level % 7 + 1) as any;
  setLevel(nextLevel);
  };

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cozy-beige p-6">
      <div className="w-full max-w-md rounded-3xl border-4 border-lofi-charcoal bg-panda-white p-8 shadow-[8px_8px_0px_0px_rgba(61,61,61,1)]">
        
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-lofi-charcoal uppercase tracking-tight">Studio Canvas</h1>
        </header>

        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-lofi-charcoal bg-white mb-6">
          {image ? (
            <CanvasSketch imageSrc={image} level={level} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-50">
               <ImageUploader onImageChange={setImage} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {image && (
            <>
              <button 
                onClick={cycleLevel}
                className="w-full rounded-xl bg-study-pink py-4 font-bold text-lofi-charcoal border-2 border-lofi-charcoal shadow-[4px_4px_0px_0px_rgba(61,61,61,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all uppercase"
              >
                Level: {level}
              </button>
              
              <button 
                onClick={() => { setImage(null); localStorage.removeItem("user-avatar"); }}
                className="w-full rounded-xl bg-red-400 py-2 text-xs font-bold text-lofi-charcoal border-2 border-lofi-charcoal shadow-[2px_2px_0px_0px_rgba(61,61,61,1)] transition-all uppercase"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}