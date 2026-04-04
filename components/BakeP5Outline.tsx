"use client";

import React from "react";
import dynamic from "next/dynamic";
import p5Types from "p5";

const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), { ssr: false });

interface BakeProps {
  imageSrc: string;
  onComplete: (base64: string) => void;
}

export default function BakeOutline({ imageSrc, onComplete }: BakeProps) {
  let img: p5Types.Image | null = null;

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(400, 400).parent(canvasParentRef);
    p5.loadImage(imageSrc, (loadedImg) => {
      let ratio = Math.max(400 / loadedImg.width, 400 / loadedImg.height);
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
    
    // Hardcoded to your Level 2 detail settings
    const step = 4; const threshold = 35; const jumpRadius = 2; const weight = 1.2; const minLength = 5;

    let cols = Math.floor(img.width / step);
    let rows = Math.floor(img.height / step);
    let grid: any[][] = Array(cols).fill(null).map(() => Array(rows).fill(null));
    let allEdges = [];

    for (let gy = 0; gy < rows - 1; gy++) {
      for (let gx = 0; gx < cols - 1; gx++) {
        let x = gx * step; let y = gy * step;
        const loc = (x + y * img.width) * 4;
        const bright = (img.pixels[loc] + img.pixels[loc + 1] + img.pixels[loc + 2]) / 3;
        const brightRight = (img.pixels[loc + 4] + img.pixels[loc + 5] + img.pixels[loc + 6]) / 3;
        const brightDown = (img.pixels[loc + (img.width * 4)] + img.pixels[loc + (img.width * 4) + 1] + img.pixels[loc + (img.width * 4) + 2]) / 3;

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

    for (let i = 0; i < allEdges.length; i++) {
      let startNode = allEdges[i];
      if (startNode.used) continue;
      let path = []; let current = startNode;
      while (current) {
        path.push(current); current.used = true;
        let nextNode = null; let minD = Infinity;
        for (let r = 1; r <= jumpRadius; r++) {
          for (let dx = -r; dx <= r; dx++) {
            for (let dy = -r; dy <= r; dy++) {
              if (dx === 0 && dy === 0) continue;
              let nx = current.gx + dx; let ny = current.gy + dy;
              if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                let neighbor = grid[nx][ny];
                if (neighbor && !neighbor.used) {
                   let distSq = dx * dx + dy * dy;
                   if (distSq < minD) { minD = distSq; nextNode = neighbor; }
                }
              }
            }
          }
          if (nextNode) break; 
        }
        current = nextNode;
      }
      if (path.length >= minLength) {
        p5.beginShape();
        p5.curveVertex(path[0].x, path[0].y); 
        for (let pt of path) p5.curveVertex(pt.x, pt.y);
        p5.curveVertex(path[path.length - 1].x, path[path.length - 1].y); 
        p5.endShape();
      }
    }

    // THE FIX: Typecast p5 to any to bypass the TS definition error
    onComplete(((p5 as any).canvas as HTMLCanvasElement).toDataURL("image/png"));
    p5.noLoop();
  };

  return <Sketch setup={setup} draw={draw} />;
}