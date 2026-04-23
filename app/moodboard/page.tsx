"use client";
import React from "react";
import Window from "@/components/items/Window";
import CoolGalleryCandle from "@/components/items/Candle";
import Clock from "@/components/items/Clock";
import PostItNote from "@/components/items/PostItNote";
import AffirmationWoodBoard from "@/components/items/AffirmationBoard";

export default function WindowDemoPage() {
  return (
    <main className="relative w-full h-screen bg-app-bg overflow-hidden font-space flex items-center justify-center transition-colors duration-300">
      
      {/* Background decoration just to make the transparent shadow pop */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-app-text to-transparent" />

      <Window theme="dark">
      </Window>

      <CoolGalleryCandle theme="dark"></CoolGalleryCandle>
      <Clock theme="dark"></Clock>
      <PostItNote theme="dark"></PostItNote>
      <AffirmationWoodBoard></AffirmationWoodBoard>
      

    </main>
  );
}