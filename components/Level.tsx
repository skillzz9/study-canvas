"use client";

import React from "react";
import Image from "next/image";
import P5Outline from "./P5Outline";
import P5FullSketch from "./P5FullSketch";

interface LevelProps {
  imageSrc: string;
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export default function Level({ imageSrc, level }: LevelProps) {
  switch (level) {
    case 1:
      return (
        <div className="relative w-full h-full bg-white">
        </div>
      );

    case 2:

      return <P5Outline imageSrc={imageSrc} detailLevel={2} />;

    case 3:
      return (
        <div className="relative w-full h-full bg-white">
          {/* 1. BOTTOM LAYER: The Watercolor Wash */}
          <Image
            src={imageSrc}
            alt="L3-Watercolor-Wash"
            fill
            unoptimized
            className="absolute inset-0 object-cover blur-[35px] saturate-[1] opacity-50 brightness-[1.1] sepia-[0.1] z-0"
          />

          {/* 2. MIDDLE LAYER: The Paint Dabs (Adds depth to the color) */}
          <Image
            src={imageSrc}
            alt="L3-Paint-Dabs"
            fill
            unoptimized
            className="absolute inset-0 object-cover blur-[15px] opacity-30 mix-blend-multiply z-10"
          />

          {/* 3. TOP LAYER: The P5 Outline (Pure lines, no shading) */}
          <div className="absolute inset-0 z-20 mix-blend-multiply">
            <P5Outline imageSrc={imageSrc} detailLevel={2} />
          </div>
        </div>
      );

    case 4:
      return (
        <div className="relative w-full h-full bg-white">
          {/* 1. BOTTOM LAYER: The Watercolor Wash */}
          <Image
            src={imageSrc}
            alt="L4-Color-Base"
            fill
            unoptimized
            className="object-cover blur-[25px] opacity-50 sepia-[0.1] brightness-[1.1] z-0"
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
            <P5FullSketch detailLevel={2} imageSrc={imageSrc} />
          </div>
        </div>
      );

    case 5:
      return (
        <div className="relative w-full h-full bg-white">
          {/* 1. BOTTOM LAYER: Tighter Watercolor Wash */}
          <Image
            src={imageSrc}
            alt="L5-Color-Base"
            fill
            unoptimized
            className="object-cover blur-[8px] saturate-[1.5] opacity-50 brightness-[1.05] sepia-[0.1] z-0"
          />

          {/* 2. MIDDLE LAYER: Photo-accurate Details */}
          <Image
            src={imageSrc}
            alt="L5-Color-Details"
            fill
            unoptimized
            className="absolute inset-0 object-cover blur-[2px] saturate-[1.2] opacity-60 mix-blend-multiply z-10"
          />

          {/* 3. TOP LAYER: The Detailed Sketch */}
          <div className="absolute inset-0 z-20 mix-blend-multiply">
            <P5FullSketch detailLevel={2} imageSrc={imageSrc} />
          </div>
        </div>
      );

    case 6:
      return (
        <div className="relative w-full h-full bg-white">
          {/* 1. BOTTOM LAYER: Tight Watercolor Wash */}
          <Image
            src={imageSrc}
            alt="L6-Color-Base"
            fill
            unoptimized
            className="absolute inset-0 object-cover blur-[8px] saturate-[1.5] opacity-10 brightness-[1.05] z-0"
          />

          {/* 2. MIDDLE LAYER: Photo-accurate Details */}
          <Image
            src={imageSrc}
            alt="L6-Color-Details"
            fill
            unoptimized
            className="absolute inset-0 object-cover blur-[2px] saturate-[1.2] opacity-60 mix-blend-multiply z-10"
          />

          {/* 3. TOP LAYER: Your Custom Sketch */}
          <div className="absolute inset-0 z-20 mix-blend-multiply">
            <Image
              src={imageSrc}
              alt="L6-Sketch-Base"
              fill
              unoptimized
              className="object-cover grayscale contrast-[800%] brightness-[120%]"
            />
            <Image
              src={imageSrc}
              alt="L6-Sketch-Shade"
              fill
              unoptimized
              className="absolute inset-0 object-cover grayscale invert blur-[2.5px] mix-blend-color-dodge opacity-40"
            />
          </div>
        </div>
      );

    case 7:
      return (
        <Image
          src={imageSrc}
          alt="L7-Final"
          fill
          unoptimized
          className="object-cover"
        />
      );

    default:
      return null;
  }
}