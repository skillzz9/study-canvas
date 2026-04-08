"use client";
import React from "react";

export default function GalleryPage() {
  // Theme color locked to black
  const themeColor = "#000"; 

  return (
    <main className="relative w-full h-screen bg-paper overflow-hidden flex items-center justify-center font-space">
      
      {/* THE PERSPECTIVE LINES (SVG LAYER)
          Coordinates at 10/90 to match the massive 80% box size.
      */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        {/* All perspective lines set to pure black */}
        <line x1="0" y1="0" x2="10" y2="10" stroke={themeColor} strokeWidth="0.1" />
        <line x1="100" y1="0" x2="90" y2="10" stroke={themeColor} strokeWidth="0.1" />
        <line x1="0" y1="100" x2="10" y2="90" stroke={themeColor} strokeWidth="0.1" />
        <line x1="100" y1="100" x2="90" y2="90" stroke={themeColor} strokeWidth="0.1" />
      </svg>

      {/* THE BACK WALL (The Square)
          Increased to 80% size as requested.
      */}
      <div 
        className="relative z-10 bg-white"
        style={{
          width: "80%",
          height: "80%",
          border: `2px solid ${themeColor}`
        }}
      >
        
        {/* THE GALLERY SIGN
            Mounted at the top center of the back wall.
        */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
          <div 
            className="bg-paper px-8 py-3 border-4 rounded-2xl"
          >
            <h1 className="text-5xl font-black font-space text-neutral-900 uppercase tracking-tighter leading-none">
              Gallery
            </h1>
          </div>
        </div>

        {/* DEMO CONTENT AREA */}
        <div className="w-full h-full pt-40 p-12 flex items-center justify-center">
            <div className="text-center text-neutral-200 uppercase tracking-widest font-bold text-xs italic">
                Ready for artwork...
            </div>
        </div>

      </div>

    </main>
  );
}