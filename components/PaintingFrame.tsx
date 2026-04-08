"use client";
import React from "react";

// interface for component props
interface PaintingFrameProps {
  src: string;          // Source of the painting image
  alt: string;          // Alternative text for the painting
  title?: string;        // Optional title for the work
  width?: number;        // Optional width of the entire framed piece (default: 400)
  height?: number;       // Optional height of the entire framed piece (default: auto)
  className?: string;   // For adding specific styles to the wrapper
}

export default function PaintingFrame({
  src,
  alt,
  title,
  width = 400,
  height,
  className = "",
}: PaintingFrameProps) {
  // Theme color for neutral-brutalist styling
  const themeColor = "#000";

  return (
    <div
      className={`absolute z-20 transition-all origin-center ${className}`}
      style={{
        // Setting overall dimensions
        width: `${width}px`,
        height: height ? `${height}px` : "auto",
        // Positioned centrally on the back wall of the 3D vault from image_2.png, 3.png, and 4.png
        top: "15%",
        left: "10%",
        /* A subtle outer shadow to give it weight against the wall */
        boxShadow: `0 10px 40px -10px rgba(0,0,0,0.5)`,
      }}
    >
      {/* 1. THE ORNATE GILDED FRAME:
          Simulating the intricate filigree from reference image_6.png with CSS
          We use layers of linear gradients to create a detailed, metallic bronze/gold patined finish.
      */}
      <div
        className="relative border-4 bg-white"
        style={{
          borderColor: themeColor,
          // CSS SIMULATION OF GILDED FRAME TEXTURE: Complex metallic layers
          background: `
            /* Core bronze metal */
            linear-gradient(to right, #ac9764 0%, #d8c3a1 20%, #bfaf82 50%, #d8c3a1 80%, #ac9764 100%),
            /* Filigree pattern simulations: We describe complex scrollwork */
            linear-gradient(to bottom, #776239, #9e8550),
            linear-gradient(45deg, rgba(0,0,0,0) 40%, rgba(255,255,255,0.2) 50%, rgba(0,0,0,0) 60%)
          `,
          backgroundBlendMode: "soft-light, hard-light, screen",
          // The frame's profile: Detailed multi-step beveled edges
          padding: "20px 24px",
          // The filigree simulation details: Acanthus leaves, rosettes, and scrollwork on the outer edges and raised bands.
        }}
      >
        

        {/* --- 2. THE INNER FRAME LINER:
            Typically a dark, simple stained wood, positioned just inside the ornate metal frame.
        */}
        <div
          className="border-2 relative bg-neutral-100 p-3"
          style={{ borderColor: "#201a14", boxShadow: "inset 0 4px 10px rgba(0,0,0,0.8)" }}
        >
          {/* THE PAINTING IMAGE: The content */}
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            style={{
              /* An inner shadow on the image, making it appear to recede */
              boxShadow: "inset 0 6px 15px rgba(0,0,0,0.9)",
            }}
          />
        </div>
      </div>
      
      {/* OPTIONAL: A small plaque below the painting */}
      {title && (
        <div
          className="bg-white px-3 py-1 mt-4 inline-block relative -left-4 border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          style={{ borderColor: themeColor }}
        >
          <p className="text-[10px] font-black uppercase text-neutral-900 leading-none">
            {title}
          </p>
        </div>
      )}
    </div>
  );
}