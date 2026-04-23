"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import PaintingFrame from "@/components/PaintingFrame";
import PictureModal from "@/components/PictureModal";
import SideMenu from "@/components/SideMenu";
import CreatePaintingModal from "@/components/CreatePaintingModal";
import ItemToolbar from "@/components/ItemToolbar"; 
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { updatePaintingPosition } from "@/lib/paintingService";
import { spawnItem, updateItemPosition, deleteItem } from "@/lib/itemService"; 

// DYNAMIC COMPONENT IMPORTS
import Window from "@/components/items/Window";
import Candle from "@/components/items/Candle";
import Clock from "@/components/items/Clock";
import PostItNote from "@/components/items/PostItNote";
import AffirmationWoodBoard from "@/components/items/AffirmationBoard";
import RetroTV from "@/components/items/RetroTV"; 
import SimpleShelf from "@/components/items/SimpleShelf";
import TodoList from "@/components/items/TodoList";

interface FrameData {
  id: string;
  x: number;
  y: number;
  src: string;
  title: string;
  subject: string;
  revealedBlocks: number;
  totalBlocks: number;
  shuffledIndices: number[]; 
}

interface ItemData {
  id: string;
  x: number;
  y: number;
  src: string;
  zIndex: number; 
  text?: string;
  affirmations?: string[];
  tasks?: { text: string; completed: boolean }[];
}

export default function GalleryPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [items, setItems] = useState<ItemData[]>([]); 
  const [scale, setScale] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [wallColor, setWallColor] = useState<string | null>(null);
  
  const cameraX = useMotionValue(0);
  const cameraY = useMotionValue(0);
  const [selectedFrame, setSelectedFrame] = useState<FrameData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDraggingItem = useRef(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // HANDLERS: DATABASE UPDATES
  const handleColorSelect = async (color: string | null) => {
    setWallColor(color);
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { wallColor: color });
    } catch (error) { console.error("Wall color sync failed:", error); }
  };

  const handleSpawnItem = async (itemSrc: string) => {
    if (!user) return;
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    await spawnItem(user.uid, itemSrc, startX, startY);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem(id);
      setSelectedItemId(null);
    } catch (error) { console.error("Delete failed:", error); }
  };

  const handleBringToFront = async (id: string) => {
    if (!user) return;
    const maxZ = items.length > 0 ? Math.max(...items.map(i => i.zIndex)) : 0;
    try {
      const itemRef = doc(db, "galleryItems", id);
      await updateDoc(itemRef, { zIndex: maxZ + 1 });
    } catch (e) { console.error(e); }
  };

  const handleBringToBack = async (id: string) => {
    if (!user) return;
    const minZ = items.length > 0 ? Math.min(...items.map(i => i.zIndex)) : 0;
    try {
      const itemRef = doc(db, "galleryItems", id);
      await updateDoc(itemRef, { zIndex: minZ - 1 });
    } catch (e) { console.error(e); }
  };

  // HANDLERS: STATIONERY & TOOLS CONTENT
  const handleUpdateItemText = async (itemId: string, text: string) => {
    if (!user) return;
    try {
      const itemRef = doc(db, "galleryItems", itemId);
      await updateDoc(itemRef, { text });
    } catch (error) { console.error("Note update failed:", error); }
  };

  const handleUpdateItemAffirmations = async (itemId: string, affirmations: string[]) => {
    if (!user) return;
    try {
      const itemRef = doc(db, "galleryItems", itemId);
      await updateDoc(itemRef, { affirmations });
    } catch (error) { console.error("Board update failed:", error); }
  };

  const handleUpdateTodoTasks = async (itemId: string, tasks: { text: string; completed: boolean }[]) => {
    if (!user) return;
    try {
      const itemRef = doc(db, "galleryItems", itemId);
      await updateDoc(itemRef, { tasks });
    } catch (error) { console.error("Todo update failed:", error); }
  };

  // SYNC: USER DATA (WALL COLOR)
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.wallColor !== undefined) setWallColor(data.wallColor);
      }
    });
    return () => unsubscribeUser();
  }, [user]);

  // SYNC: PAINTINGS
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "paintings"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paintingsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          x: data.position?.x || 0,
          y: data.position?.y || 0,
          src: data.imageUrl || "/test.png",
          title: data.title || "Untitled",
          subject: data.subject || "General",
          revealedBlocks: data.revealedBlocks || 0,
          totalBlocks: data.totalBlocks || 180,
          shuffledIndices: data.shuffledIndices || [], 
        };
      });
      setFrames(paintingsData);
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, [user]);

  // SYNC: GALLERY ITEMS
  useEffect(() => {
    if (!user) return;
    const qItems = query(collection(db, "galleryItems"), where("userId", "==", user.uid));
    const unsubscribeItems = onSnapshot(qItems, (snapshot) => {
      const itemsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          x: data.position?.x || 0,
          y: data.position?.y || 0,
          src: data.itemSrc || "",
          zIndex: data.zIndex || 0,
          text: data.text || "",
          affirmations: data.affirmations || ["", "", "", "", ""],
          tasks: data.tasks || [],
        };
      });
      setItems(itemsData);
    });
    return () => unsubscribeItems();
  }, [user]);

  // CAMERA & WHEEL CONTROLS
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleNativeWheel = (e: WheelEvent) => {
      if (isModalOpen || isCreateModalOpen || isMenuOpen) return; 
      e.preventDefault();
      const sensitivity = 0.001;
      setScale((prevScale) => {
        const delta = e.deltaY * prevScale * sensitivity;
        return Math.min(Math.max(prevScale - delta, 0.1), 3);
      });
    };
    container.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleNativeWheel);
  }, [scale, isModalOpen, isCreateModalOpen, isMenuOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    if (isModalOpen || isCreateModalOpen || isMenuOpen) return;
    const sensitivity = 0.001; 
    const delta = e.deltaY * scale * sensitivity;
    setScale(Math.min(Math.max(scale - delta, 0.1), 3));
  };

  // DRAG END HANDLERS
  const handleDragEnd = async (id: string, info: any) => {
    const frame = frames.find(f => f.id === id);
    if (!frame) return;
    const newX = frame.x + info.offset.x / scale;
    const newY = frame.y + info.offset.y / scale;
    try { await updatePaintingPosition(id, newX, newY); } catch (error) { console.error(error); }
  };

  const handleItemDragEnd = async (id: string, info: any) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newX = item.x + info.offset.x / scale;
    const newY = item.y + info.offset.y / scale;
    try { await updateItemPosition(id, newX, newY); } catch (error) { console.error(error); }
  };

  if (!isLoaded) return null;

  return (
    <main 
      className="relative w-full h-screen bg-app-bg overflow-hidden font-space select-none transition-colors duration-300"
      onWheel={handleWheel}
      onClick={() => setSelectedItemId(null)}
      ref={containerRef}
      style={{ backgroundColor: wallColor || undefined }}
    >
      {/* MENU & MODALS */}
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onColorSelect={handleColorSelect} 
        onCreateClick={() => setIsCreateModalOpen(true)}
        onSpawnItem={handleSpawnItem} 
      />

      <CreatePaintingModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => console.log("New setup confirmed")}
      />

      {/* FIXED UI CONTROLS */}
      <div className="absolute inset-0 z-[80] pointer-events-none">
        <div className="flex gap-4 p-6 pointer-events-auto">
          {isMenuOpen ? (
            <button onClick={() => setIsMenuOpen(false)} className="p-3 bg-app-card border-4 border-app-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          ) : (
            <Link href="/" className="p-3 bg-app-card border-4 border-app-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </Link>
          )}

          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-3 bg-app-card border-4 border-app-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            {theme === "dark" ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>}
          </button>

          {!isMenuOpen && (
            <button onClick={() => setIsMenuOpen(true)} className="p-3 bg-app-card border-4 border-app-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
            </button>
          )}
        </div>
      </div>

      {/* INFINITE WALL WORLD */}
      <motion.div
        drag
        dragMomentum={false}
        style={{ x: cameraX, y: cameraY, scale }}
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {/* RENDER PAINTINGS */}
        {frames.map((frame) => (
          <motion.div
            key={frame.id}
            drag
            dragMomentum={false}
            initial={{ x: frame.x, y: frame.y }}
            animate={{ x: frame.x, y: frame.y }}
            onDragStart={() => (isDraggingItem.current = true)}
            onDragEnd={(e, info) => {
              setTimeout(() => { isDraggingItem.current = false; }, 100);
              handleDragEnd(frame.id, info);
            }}
            whileDrag={{ zIndex: 100 }}
            className="absolute cursor-grab active:cursor-grabbing"
          >
            <PaintingFrame 
              src={frame.src} 
              title={frame.title} 
              revealedCount={frame.revealedBlocks}
              totalBlocks={frame.totalBlocks}
              shuffledIndices={frame.shuffledIndices}
              onClick={() => {
                if (!isDraggingItem.current) {
                  setSelectedFrame(frame);
                  setIsModalOpen(true);
                }
              }}
            />
          </motion.div>
        ))}

        {/* RENDER DYNAMIC ITEMS */}
        {items.map((item) => (
          <motion.div
            key={item.id}
            drag
            dragMomentum={false}
            initial={{ x: item.x, y: item.y }}
            animate={{ x: item.x, y: item.y }}
            onDragEnd={(e, info) => handleItemDragEnd(item.id, info)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItemId(item.id);
            }}
            whileDrag={{ zIndex: 100 }}
            style={{ zIndex: item.zIndex || 0 }}
            className="absolute cursor-grab active:cursor-grabbing" 
          >
            {/* ITEM TOOLBAR */}
            <AnimatePresence>
              {selectedItemId === item.id && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-[110]">
                  <ItemToolbar 
                    theme={theme as "light" | "dark"}
                    onDelete={() => handleDeleteItem(item.id)}
                    onBringToFront={() => handleBringToFront(item.id)}
                    onBringToBack={() => handleBringToBack(item.id)}
                  />
                </div>
              )}
            </AnimatePresence>

            {/* ITEM SWITCH LOGIC */}
            {item.src === "todo-list" ? (
              <TodoList 
                initialTasks={item.tasks} 
                onSave={(newTasks) => handleUpdateTodoTasks(item.id, newTasks)}
                theme={theme as any}
              />
            ) : item.src === "retro-tv" ? (
              <RetroTV theme={theme as any} />
            ) : item.src === "simple-shelf" ? (
              <SimpleShelf theme={theme as any} />
            ) : item.src === "post-it" ? (
              <PostItNote 
                initialText={item.text} 
                onSave={(newText) => handleUpdateItemText(item.id, newText)} 
              />
            ) : item.src === "affirmation-board" ? (
              <AffirmationWoodBoard 
                initialAffirmations={item.affirmations} 
                onSave={(newAffs) => handleUpdateItemAffirmations(item.id, newAffs)} 
              />
            ) : item.src === "/items/candle-light.png" ? (
              <Candle theme="light" /> 
            ) : item.src === "/items/candle-dark.png" ? (
              <Candle theme="dark" />
            ) : item.src === "/items/candle.png" ? (
              <Candle theme={theme as any} />
            ) : item.src === "/items/clock-light.png" ? (
              <Clock theme="light" />
            ) : item.src === "/items/clock-dark.png" ? (
              <Clock theme="dark" />
            ) : item.src === "/items/clock.png" ? (
              <Clock theme={theme as any} />
            ) : item.src === "/items/window-light.png" ? (
              <Window theme="light" /> 
            ) : item.src === "/items/window-dark.png" ? (
              <Window theme="dark" />
            ) : item.src === "/items/window.png" ? (
              <Window theme={theme as any} />
            ) : (
              <img src={item.src} className="w-auto h-auto max-w-[250px] object-contain drop-shadow-xl pointer-events-none" />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* DETAIL MODAL */}
      {selectedFrame && (
        <PictureModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          id={selectedFrame.id}
          src={selectedFrame.src}
          title={selectedFrame.title}
          date={selectedFrame.subject} 
          revealedCount={selectedFrame.revealedBlocks}
          totalBlocks={selectedFrame.totalBlocks}
          shuffledIndices={selectedFrame.shuffledIndices}
        />
      )}
    </main>
  );
}