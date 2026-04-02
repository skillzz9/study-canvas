"use client";

import Image from "next/image";
import P5Outline from "./P5Outline";
import P5FullSketch from "./P5FullSketch";

interface CanvasSketchProps {
  imageSrc: string;
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; 
}

export default function CanvasSketch({ imageSrc, level }: CanvasSketchProps) {
  return (
    <div className="relative w-full h-full bg-white">
    
      {/* Level 1: blank canvas */}
      {level === 1 && (
        <div className="relative w-full h-full">
          <Image 
            src={imageSrc} alt="L1" fill unoptimized
            className="object-cover grayscale invert blur-[25px] contrast-[8000%] mix-blend-color-dodge" 
          />
        </div>
      )}
      {/* Level 2: Abstract Sketch weird shapes */}
      {level === 2 && (
<P5Outline imageSrc={imageSrc} detailLevel={2} />
      )}
{/* LEVEL 3: Watercolor Base + No-Shading Sketch on Top */}
      {level === 3 && (
        <div className="relative w-full h-full bg-white">
          
          {/* 1. BOTTOM LAYER: The Watercolor Wash */}
          <Image 
            src={imageSrc} 
            alt="L3-Watercolor-Wash" 
            fill 
            unoptimized
            className="absolute inset-0 object-cover blur-[35px] saturate-[2.5] opacity-70 brightness-[1.1] sepia-[0.1] z-0" 
          />

          {/* 2. MIDDLE LAYER: The Paint Dabs (Adds depth to the color) */}
          <Image 
            src={imageSrc} 
            alt="L3-Paint-Dabs" 
            fill 
            unoptimized
            className="absolute inset-0 object-cover blur-[15px] opacity-30 mix-blend-multiply z-10" 
          />

          {/* 3. TOP LAYER: The P5 Outline (Pure lines, no shading)
              The 'mix-blend-multiply' class here is the secret. It hides the 
              white background of the canvas so the colors show through the lines. */}
          <div className="absolute inset-0 z-20 mix-blend-multiply">
            {/* Using detailLevel={2} for a clean, recognizable contour, 
                or drop it to 1 for the very abstract look */}
            <P5Outline imageSrc={imageSrc} detailLevel={2} />
          </div>

          {/* 4. OPTIONAL: Paper Texture Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] pointer-events-none z-30" />
          
        </div>
      )}
      {/* LEVEL 4: Hard Sketch (Higher Detail) */}
{/* LEVEL 4: Defined Sketch over Watercolor
    The "Mystery" starts to resolve as sharp lines lock the colors in place. */}
{/* LEVEL 4: Detailed Sketch (No Shading) over Watercolor */}
{level === 4 && (
  <div className="relative w-full h-full bg-white">
    
    {/* 1. BOTTOM LAYER: The Watercolor Wash */}
    <Image 
      src={imageSrc} 
      alt="L4-Color-Base" 
      fill 
      unoptimized
      className="object-cover blur-[25px] opacity-50 brightness-[1.1] z-0" 
    />

    {/* 2. MIDDLE LAYER: The Paint Dabs */}
    <Image 
      src={imageSrc} 
      alt="L4-Color-Dabs" 
      fill 
      unoptimized
      className="absolute inset-0 object-cover blur-[12px] saturate-[1.8] opacity-50 mix-blend-multiply z-10" 
    />
    <div className="absolute inset-0 z-20 mix-blend-multiply">
    <P5FullSketch detailLevel={1} imageSrc={imageSrc}></P5FullSketch>
    </div>
      
    </div>

)}

      {/* LEVEL 5: Minimal Shading (Graphite Texture) */}
      {/* LEVEL 5: Tighter Colors + Detailed Sketch */}
{level === 5 && (
  <div className="relative w-full h-full bg-white">
    
    {/* 1. BOTTOM LAYER: Tighter Watercolor Wash 
        Blur dropped from 25px to 8px. Saturation lowered slightly so it looks 
        more like dried, controlled paint rather than a wet puddle. */}
    <Image 
      src={imageSrc} 
      alt="L5-Color-Base" 
      fill 
      unoptimized
      className="object-cover blur-[8px] saturate-[1.5] opacity-50 brightness-[1.05] sepia-[0.1] z-0" 
    />

    {/* 2. MIDDLE LAYER: Photo-accurate Details
        Blur dropped to just 2px. This brings back the actual textures and 
        keeps the colors strictly inside the lines. */}
    <Image 
      src={imageSrc} 
      alt="L5-Color-Details" 
      fill 
      unoptimized
      className="absolute inset-0 object-cover blur-[2px] saturate-[1.2] opacity-60 mix-blend-multiply z-10" 
    />

    {/* 3. TOP LAYER: The Detailed Sketch
        Wrapped in 'mix-blend-multiply' so the white p5 canvas turns transparent
        and the tight colors underneath shine through perfectly. */}
    <div className="absolute inset-0 z-20 mix-blend-multiply">
      <P5FullSketch detailLevel={2} imageSrc={imageSrc} />
    </div>
      
  </div>
)}

      {/* LEVEL 6: Full Shaded Sketch */}
{level === 6 && (
  <div className="relative w-full h-full bg-white">
    
    {/* 1. BOTTOM LAYER: Tight Watercolor Wash (From Level 5) */}
    <Image 
      src={imageSrc} 
      alt="L6-Color-Base" 
      fill 
      unoptimized
      className="absolute inset-0 object-cover blur-[8px] saturate-[1.5] opacity-10 brightness-[1.05] z-0" 
    />

    {/* 2. MIDDLE LAYER: Photo-accurate Details (From Level 5) */}
    <Image 
      src={imageSrc} 
      alt="L6-Color-Details" 
      fill 
      unoptimized
      className="absolute inset-0 object-cover blur-[2px] saturate-[1.2] opacity-60 mix-blend-multiply z-10" 
    />

    {/* 3. TOP LAYER: Your Custom Sketch 
        Wrapped in 'mix-blend-multiply' so the colors show through the white spaces. */}
    <div className="absolute inset-0 z-20 mix-blend-multiply">
      <Image 
        src={imageSrc} alt="L6-Sketch-Base" fill unoptimized
        className="object-cover grayscale contrast-[800%] brightness-[120%]" 
      />
      {/* Note: I added 'absolute inset-0' to this image so it stacks correctly over the base */}
      <Image 
        src={imageSrc} alt="L6-Sketch-Shade" fill unoptimized
        className="absolute inset-0 object-cover grayscale invert blur-[2.5px] mix-blend-color-dodge opacity-40" 
      />
    </div>

  </div>
)}

      {/* LEVEL 7: Color Reveal (Artistic) */}
      {level === 7 && (
        <Image 
          src={imageSrc} alt="L7" fill unoptimized
          className="object-cover saturate-[0.5] contrast-[1.1] brightness-[1.1] sepia-[0.1]" 
        />
      )}

      {/* LEVEL 8: Final Photo */}
      {level === 8 && (
        <Image src={imageSrc} alt="L8" fill unoptimized className="object-cover" />
      )}
    </div>
  );
}