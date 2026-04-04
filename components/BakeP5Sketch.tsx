"use client";

import React from "react";
import dynamic from "next/dynamic";
import p5Types from "p5";

const Sketch: any = dynamic(() => import("react-p5").then((mod) => mod.default as any), { ssr: false });

interface BakeProps {
  imageSrc: string;
  onComplete: (base64: string) => void;
}

export default function BakeSketch({ imageSrc, onComplete }: BakeProps) {
  let img: p5Types.Image | null = null;

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(800, 800).parent(canvasParentRef);
    p5.loadImage(imageSrc, (loadedImg) => {
      let ratio = Math.max(800 / loadedImg.width, 800 / loadedImg.height);
      loadedImg.resize(loadedImg.width * ratio, loadedImg.height * ratio);
      img = loadedImg;
    });
  };

  const draw = (p5: p5Types) => {
    if (!img) return; // Wait for image
    p5.background(255);
    img.loadPixels();

    const offsetX = (p5.width - img.width) / 2;
    const offsetY = (p5.height - img.height) / 2;
    
    // Hardcoded Level 2 settings
    const hardThresh = 25; const softThresh = 15; const hardWeight = 1.8; const softWeight = 1.2; const softAlpha = 120;

    for (let x = 0; x < img.width - 1; x++) {
      for (let y = 0; y < img.height - 1; y++) {
        const loc = (x + y * img.width) * 4;
        const bright = (img.pixels[loc] + img.pixels[loc+1] + img.pixels[loc+2]) / 3;
        const brightRight = (img.pixels[loc+4] + img.pixels[loc+5] + img.pixels[loc+6]) / 3;
        const brightDown = (img.pixels[loc + (img.width * 4)] + img.pixels[loc + (img.width * 4) + 1] + img.pixels[loc + (img.width * 4) + 2]) / 3;

        const maxDiff = Math.max(Math.abs(bright - brightRight), Math.abs(bright - brightDown));

        if (maxDiff > softThresh) {
          const drawX = x + offsetX; const drawY = y + offsetY;
          if (drawX >= 0 && drawX <= p5.width && drawY >= 0 && drawY <= p5.height) {
            if (maxDiff > hardThresh) {
              p5.stroke(61, 61, 61, 255); p5.strokeWeight(hardWeight);
            } else {
              p5.stroke(61, 61, 61, softAlpha); p5.strokeWeight(softWeight);
            }
            p5.point(drawX, drawY);
          }
        }
      }
    }

    // THE FIX: Typecast p5 to any to bypass the TS definition error
    onComplete(((p5 as any).canvas as HTMLCanvasElement).toDataURL("image/png"));
    p5.noLoop();
  };

  return <Sketch setup={setup} draw={draw} />;
}