"use client";

import React from "react";
import dynamic from "next/dynamic";
import p5Types from "p5";

const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
});

interface P5OutlineProps {
  imageSrc: string;
  detailLevel: 1 | 2 | 3; 
}

export default function P5Outline({ imageSrc, detailLevel }: P5OutlineProps) {
  // 1. Removed the local 'img' variable entirely to protect it from React re-renders.

  const preload = (p5: p5Types) => {
    // Just warm up the cache. No variable assignment needed.
    p5.loadImage(imageSrc);
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    const canvasSize = 400;
    const cvs = p5.createCanvas(canvasSize, canvasSize).parent(canvasParentRef);

    // Ensure the canvas scales up perfectly to match your other layers
    cvs.style("width", "100%");
    cvs.style("height", "100%");
    cvs.style("object-fit", "cover");
    cvs.style("object-position", "center");

    p5.noLoop();

    p5.loadImage(imageSrc, (loadedImg) => {
      let ratio = Math.max(canvasSize / loadedImg.width, canvasSize / loadedImg.height);
      let newWidth = loadedImg.width * ratio;
      let newHeight = loadedImg.height * ratio;

      // 2. THE CLONE FIX: Detach the pixels from the shared browser cache
      // This stops Level 3 from accidentally resizing Level 2's image.
      let clonedImg = loadedImg.get();
      clonedImg.resize(newWidth, newHeight);

      // 3. THE SCOPE FIX: Attach directly to this specific p5 instance
      (p5 as any).myImg = clonedImg;

      p5.redraw(); 
    });
  };

  const draw = (p5: p5Types) => {
    // 4. Retrieve the safe, cloned image
    const img = (p5 as any).myImg;

    if (!img || img.width === 0) {
      return; 
    }

    p5.background(255);
    img.loadPixels();

    const offsetX = (p5.width - img.width) / 2;
    const offsetY = (p5.height - img.height) / 2;

    const settings = {
      1: { step: 8, threshold: 50, jumpRadius: 3, weight: 2.0, minLength: 8 }, 
      2: { step: 4, threshold: 35, jumpRadius: 2, weight: 1.2, minLength: 5 }, 
      3: { step: 2, threshold: 20, jumpRadius: 2, weight: 0.8, minLength: 3 }, 
    };

    const { step, threshold, jumpRadius, weight, minLength } = settings[detailLevel];

    let cols = Math.floor(img.width / step);
    let rows = Math.floor(img.height / step);
    
    let grid: any[][] = Array(cols).fill(null).map(() => Array(rows).fill(null));
    let allEdges = [];

    // Phase 1: Edge Detection
    for (let gy = 0; gy < rows - 1; gy++) {
      for (let gx = 0; gx < cols - 1; gx++) {
        let x = gx * step;
        let y = gy * step;

        const loc = (x + y * img.width) * 4;
        const bright = (img.pixels[loc] + img.pixels[loc + 1] + img.pixels[loc + 2]) / 3;

        const locRight = ((x + step) + y * img.width) * 4;
        const brightRight = (img.pixels[locRight] + img.pixels[locRight + 1] + img.pixels[locRight + 2]) / 3;

        const locDown = (x + (y + step) * img.width) * 4;
        const brightDown = (img.pixels[locDown] + img.pixels[locDown + 1] + img.pixels[locDown + 2]) / 3;

        if (Math.abs(bright - brightRight) > threshold || Math.abs(bright - brightDown) > threshold) {
          let node = { gx, gy, x: x + offsetX, y: y + offsetY, used: false };
          grid[gx][gy] = node;
          allEdges.push(node);
        }
      }
    }

    p5.stroke(61, 61, 61, 220);
    p5.strokeWeight(weight);
    p5.noFill();

    // Phase 2: Path Tracing (Connecting the dots into long lines)
    for (let i = 0; i < allEdges.length; i++) {
      let startNode = allEdges[i];
      if (startNode.used) continue;

      let path = [];
      let current = startNode;

      while (current) {
        path.push(current);
        current.used = true;

        let nextNode = null;
        let minD = Infinity;

        for (let r = 1; r <= jumpRadius; r++) {
          for (let dx = -r; dx <= r; dx++) {
            for (let dy = -r; dy <= r; dy++) {
              if (dx === 0 && dy === 0) continue;
              
              let nx = current.gx + dx;
              let ny = current.gy + dy;

              if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                let neighbor = grid[nx][ny];
                if (neighbor && !neighbor.used) {
                   let distSq = dx * dx + dy * dy;
                   if (distSq < minD) {
                      minD = distSq;
                      nextNode = neighbor;
                   }
                }
              }
            }
          }
          if (nextNode) break; 
        }
        current = nextNode;
      }

      // Phase 3: Draw the Line (Only if it is long enough)
      if (path.length >= minLength) {
        p5.beginShape();
        
        p5.curveVertex(path[0].x, path[0].y); 
        
        for (let pt of path) {
          p5.curveVertex(pt.x, pt.y);
        }
        
        p5.curveVertex(path[path.length - 1].x, path[path.length - 1].y); 
        p5.endShape();
      }
    }
  };

  return <Sketch className="absolute inset-0 w-full h-full" preload={preload} setup={setup} draw={draw} />;
}