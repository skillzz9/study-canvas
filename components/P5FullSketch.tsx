import React from "react";
import dynamic from "next/dynamic";
import p5Types from "p5";

const Sketch: any = dynamic(() => import("react-p5").then((mod) => mod.default as any), {
  ssr: false,
});

interface P5FullSketchProps {
  imageSrc: string;
  detailLevel: 1 | 2 | 3;
}

// 1. ADD THIS EXACT LINE OUTSIDE THE COMPONENT:
// This makes it immune to React's re-render cycle, so it won't reset to undefined!
let img: p5Types.Image;

export default function P5FullSketch({ imageSrc, detailLevel }: P5FullSketchProps) {
  // 2. DELETE "let img: p5Types.Image;" FROM INSIDE HERE.

  const preload = (p5: p5Types) => {
    img = p5.loadImage(imageSrc);
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    const canvasSize = 800; 
    const cvs = p5.createCanvas(canvasSize, canvasSize).parent(canvasParentRef);

    cvs.style("width", "100%");
    cvs.style("height", "100%");
    cvs.style("object-fit", "cover");
    cvs.style("object-position", "center");

    // YOUR MATH REMAINS 100% UNTOUCHED BELOW THIS LINE
    let ratio = Math.max(canvasSize / img.width, canvasSize / img.height);
    let newWidth = img.width * ratio;
    let newHeight = img.height * ratio;

    img.resize(newWidth, newHeight);
    
    p5.noLoop();
  };



  const draw = (p5: p5Types) => {
    if (!img) return; // The "Safety Shield"
    p5.background(255);
    img.loadPixels();

    const offsetX = (p5.width - img.width) / 2;
    const offsetY = (p5.height - img.height) / 2;

    // CONFIGURATION MAP
    // hardThresh: Required difference to draw a main structural line
    // softThresh: Required difference to draw a fine detail/shading line
    // hardWeight / softWeight: Pen thickness
    // softAlpha: Transparency of the shading lines (0 to 255)
    const settings = {
      1: { hardThresh: 30, softThresh: 30, hardWeight: 2.0, softWeight: 2.0, softAlpha: 255 }, 
      2: { hardThresh: 25, softThresh: 15, hardWeight: 1.8, softWeight: 1.2, softAlpha: 120 },
      3: { hardThresh: 20, softThresh: 8,  hardWeight: 1.5, softWeight: 0.6, softAlpha: 80 },
    };

    const { hardThresh, softThresh, hardWeight, softWeight, softAlpha } = settings[detailLevel];

    for (let x = 0; x < img.width - 1; x++) {
      for (let y = 0; y < img.height - 1; y++) {
        const loc = (x + y * img.width) * 4;
        const bright = (img.pixels[loc] + img.pixels[loc+1] + img.pixels[loc+2]) / 3;

        const locRight = ((x + 1) + y * img.width) * 4;
        const brightRight = (img.pixels[locRight] + img.pixels[locRight+1] + img.pixels[locRight+2]) / 3;

        const locDown = (x + (y + 1) * img.width) * 4;
        const brightDown = (img.pixels[locDown] + img.pixels[locDown+1] + img.pixels[locDown+2]) / 3;

        const diffRight = Math.abs(bright - brightRight);
        const diffDown = Math.abs(bright - brightDown);
        
        // Find the strongest contrast shift in either direction
        const maxDiff = Math.max(diffRight, diffDown);

        // Check if the pixel meets at least the lowest threshold for this level
        if (maxDiff > softThresh) {
          const drawX = x + offsetX;
          const drawY = y + offsetY;

          if (drawX >= 0 && drawX <= p5.width && drawY >= 0 && drawY <= p5.height) {
            
            // Draw a thick main line, or a thin shading line based on the contrast
            if (maxDiff > hardThresh) {
              p5.stroke(61, 61, 61, 255);
              p5.strokeWeight(hardWeight);
            } else {
              p5.stroke(61, 61, 61, softAlpha);
              p5.strokeWeight(softWeight);
            }
            
            p5.point(drawX, drawY);
          }
        }
      }
    }
  };

  return <Sketch className="absolute inset-0 w-full h-full" preload={preload} setup={setup} draw={draw} />;
}