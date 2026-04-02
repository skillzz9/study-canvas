"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader";

// Defining your 5 specific levels
type DisplayMode = "level-1" | "level-2" | "level-3" | "level-4" | "level-5";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [mode, setMode] = useState<DisplayMode>("level-5");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("user-avatar");
    if (saved) setImage(saved);
  }, []);

  const cycleMode = () => {
    const modes: DisplayMode[] = ["level-1", "level-2", "level-3", "level-4", "level-5"];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  const handleClear = () => {
    localStorage.removeItem("user-avatar");
    setImage(null);
    setMode("level-5");
  };

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cozy-beige p-6 font-sans">
      <div className="w-full max-w-md rounded-3xl border-4 border-lofi-charcoal bg-panda-white p-8 shadow-[8px_8px_0px_0px_rgba(61,61,61,1)]">
        
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-lofi-charcoal uppercase tracking-tight">Studio Canvas</h1>
          <p className="text-xs text-lofi-charcoal/50 font-mono italic">Visual Pipeline Alpha</p>
        </header>

        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-lofi-charcoal bg-white mb-6">
          {image ? (
            <div className="relative w-full h-full">
              
              {/* LEVEL 1: Blank White Square */}
              {mode === "level-1" && <div className="absolute inset-0 bg-white" />}

              {/* LEVEL 2: Hard Outline (No Shading) */}
              {mode === "level-2" && (
                <div className="relative w-full h-full bg-white">
                   <Image 
                    src={image} alt="Hard Outline" fill unoptimized
                    className="object-cover grayscale contrast-[1000%] brightness-[120%]" 
                  />
                  <Image 
                    src={image} alt="Edge" fill unoptimized
                    className="object-cover grayscale invert blur-[0.5px] mix-blend-color-dodge contrast-[1000%]" 
                  />
                </div>
              )}

              {/* LEVEL 3: Original Sketch (With Shading) */}
              {mode === "level-3" && (
                <div className="relative w-full h-full bg-white">
                   <Image 
                    src={image} alt="Base" fill unoptimized
                    className="object-cover grayscale contrast-[120%] brightness-[110%]" 
                  />
                  <Image 
                    src={image} alt="Shaded Sketch" fill unoptimized
                    className="object-cover grayscale invert blur-[2px] mix-blend-color-dodge opacity-90" 
                  />
                </div>
              )}

              {/* LEVEL 4: Sketched with some color */}
              {mode === "level-4" && (
                <div className="relative w-full h-full bg-cozy-beige/10">
                  <Image 
                    src={image} alt="Color Sketch" fill unoptimized
                    className="object-cover saturate-[0.6] contrast-[1.1] brightness-[1.05] opacity-90" 
                  />
                  <div className="absolute inset-0 bg-white/20 mix-blend-overlay pointer-events-none" />
                </div>
              )}

              {/* LEVEL 5: Final Image */}
              {mode === "level-5" && (
                <Image src={image} alt="Final" fill unoptimized className="object-cover" />
              )}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-50">
               <ImageUploader onImageChange={setImage} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {image ? (
            <>
              <button 
                onClick={cycleMode}
                className="w-full rounded-xl bg-study-pink py-4 font-bold text-lofi-charcoal border-2 border-lofi-charcoal shadow-[4px_4px_0px_0px_rgba(61,61,61,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all uppercase tracking-widest text-sm"
              >
                Progress: {mode.replace("-", " ")}
              </button>
              
              <button 
                onClick={handleClear}
                className="w-full rounded-xl bg-red-400 py-2 text-xs font-bold text-lofi-charcoal border-2 border-lofi-charcoal shadow-[2px_2px_0px_0px_rgba(61,61,61,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all uppercase"
              >
                Clear Canvas
              </button>
            </>
          ) : (
            <p className="text-center text-sm text-lofi-charcoal/40 italic font-mono">
              Waiting for upload...
            </p>
          )}
        </div>
      </div>
    </main>
  );
}