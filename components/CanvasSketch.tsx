"use client";

import Image from "next/image";

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
        <div className="relative w-full h-full bg-white">
          <Image 
            src={imageSrc} alt="L3-Base" fill unoptimized
            className="object-cover grayscale blur-[3px] contrast-[100000%] brightness-[150%]" 
          />
        </div>
      )}
      {/* Level 3: Abstract Sketch weird shapes */}
{level === 3 && (
  <div className="relative w-full h-full bg-white">
    {/* 1. THE BASE SKETCH (Level 2 logic moved here as the bottom layer) */}
    <Image 
      src={imageSrc} 
      alt="L3-Sketch-Base" 
      fill 
      unoptimized
      className="object-cover grayscale blur-[3px] contrast-[10000%] brightness-[150%] z-0" 
    />

    {/* 2. THE WATERCOLOR WASH (Now overlayed on top)
        'mix-blend-multiply' makes the color stick to the sketch lines. */}
    <Image 
      src={imageSrc} 
      alt="L3-Watercolor-Wash" 
      fill 
      unoptimized
      className="absolute inset-0 object-cover blur-[35px] saturate-[2.5] opacity-70 brightness-[1.1] sepia-[0.1] mix-blend-multiply z-10" 
    />

    {/* 3. THE PAINT DABS (For extra depth) */}
    <Image 
      src={imageSrc} 
      alt="L3-Paint-Dabs" 
      fill 
      unoptimized
      className="absolute inset-0 object-cover blur-[15px] saturate-[1.8] opacity-40 mix-blend-multiply z-20" 
    />

    {/* 4. OPTIONAL: Paper Texture Overlay */}
    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] pointer-events-none z-30" />
  </div>
)}
      {/* LEVEL 4: Hard Sketch (Higher Detail) */}
{/* LEVEL 4: Defined Sketch over Watercolor
    The "Mystery" starts to resolve as sharp lines lock the colors in place. */}
{level === 4 && (
  <div className="relative w-full h-full bg-white">
    
    {/* 1. BOTTOM LAYER: The Watercolor Wash (Carried over from Level 3) */}
    <Image 
      src={imageSrc} 
      alt="L4-Color-Base" 
      fill 
      unoptimized
      className="object-cover blur-[25px] saturate-[2.2] opacity-80 brightness-[1.1] z-0" 
    />

    {/* 2. MIDDLE LAYER: The Paint Dabs (Adds that messy artistic feel) */}
    <Image 
      src={imageSrc} 
      alt="L4-Color-Dabs" 
      fill 
      unoptimized
      className="absolute inset-0 object-cover blur-[12px] saturate-[1.8] opacity-50 mix-blend-multiply z-10" 
    />

    {/* 3. TOP LAYER: The "Hard" Outline Sketch
        We use low blur (0.6px) and high contrast to get clean lines.
        'mix-blend-multiply' makes the white paper "transparent" to the colors below. */}
    <div className="absolute inset-0 z-20 mix-blend-multiply">
      {/* Structural base */}
      <Image 
        src={imageSrc} 
        alt="L4-Sketch-Structure" 
        fill 
        unoptimized
        className="object-cover grayscale contrast-[5000%] brightness-[140%] blur-[0.5px]" 
      />
      {/* High-definition edge detection */}
      <Image 
        src={imageSrc} 
        alt="L4-Sketch-Lines" 
        fill 
        unoptimized
        className="absolute inset-0 object-cover grayscale invert blur-[0.6px] mix-blend-color-dodge contrast-[5000%]" 
      />
    </div>

  </div>
)}

      {/* LEVEL 5: Minimal Shading (Graphite Texture) */}
      {level === 5 && (
        <div className="relative w-full h-full bg-white">
           <Image 
            src={imageSrc} alt="L5-Base" fill unoptimized
            className="object-cover grayscale contrast-[800%] brightness-[120%]" 
          />
          <Image 
            src={imageSrc} alt="L5-Shade" fill unoptimized
            className="object-cover grayscale invert blur-[2.5px] mix-blend-color-dodge opacity-40" 
          />
        </div>
      )}

      {/* LEVEL 6: Full Shaded Sketch */}
      {level === 6 && (
        <div className="relative w-full h-full bg-white">
           <Image 
            src={imageSrc} alt="L6-Base" fill unoptimized
            className="object-cover grayscale contrast-[300%] brightness-[110%]" 
          />
          <Image 
            src={imageSrc} alt="L6-Shade" fill unoptimized
            className="object-cover grayscale invert blur-[3px] mix-blend-color-dodge opacity-80" 
          />
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