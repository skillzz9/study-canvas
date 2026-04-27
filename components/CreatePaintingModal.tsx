"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPainting } from "@/lib/paintingService";
import { useAuth } from "@/context/AuthContext";

interface CreatePaintingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePaintingModal({ isOpen, onClose, onSuccess }: CreatePaintingModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  
  // INITIALIZING FORM DATA
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    hours: 10,
    isShared: false,
  });

  // Local helper to generate a preview of the code for the UI
  const [tempCode, setTempCode] = useState<string>("");

  // uploading a file and getting the filepath
  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
      // Stores filename for manual public folder logic
      setSelectedFileName(`/${file.name}`);
    }
  };

  // The UI changes when you click solo/shared. 
  const toggleShared = () => {
    const newShared = !formData.isShared;
    setFormData({ ...formData, isShared: newShared });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // CREATES PAINTING FROM THE MODAL AND ADDS TO DATABASE
      await createPainting(
        user.uid,
        formData.title,
        formData.subject,
        formData.hours,
        selectedFileName || "/test.png",
        formData.isShared 
      );

      onSuccess();
      onClose();
      // Reset local state after successful creation
      setPreviewUrl(null);
      setFormData({ title: "", subject: "", hours: 10, isShared: false });
      setTempCode("");
    } catch (error) {
      console.error("Failed to create painting:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-app-card border-4 border-app-border rounded-3xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.3)]"
          >
            <h2 className="text-2xl font-black text-app-text uppercase italic mb-6">Start New Project</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              {/* IMAGE DROP ZONE */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-app-accent tracking-widest">Masterpiece Reference</label>
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
                  }}
                  className="relative w-full h-40 border-4 border-dashed border-app-border rounded-2xl bg-app-bg flex flex-col items-center justify-center overflow-hidden transition-all hover:border-app-accent"
                >
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-[10px] font-black uppercase text-app-accent">Drag & Drop Image</p>
                      <p className="text-[8px] uppercase text-app-text opacity-40 mt-1">Match your public folder names</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                  />
                </div>
              </div>

              {/* TITLE & SUBJECT */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black uppercase text-app-accent tracking-widest">Title</label>
                   <input 
                    required 
                    type="text" 
                    value={formData.title}
                    className="bg-app-bg border-4 border-app-border p-3 rounded-xl text-app-text font-bold outline-none text-xs" 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                   />
                </div>
                <div className="flex flex-col gap-2">
                   <label className="text-[10px] font-black uppercase text-app-accent tracking-widest">Subject</label>
                   <input 
                    required 
                    type="text" 
                    value={formData.subject}
                    className="bg-app-bg border-4 border-app-border p-3 rounded-xl text-app-text font-bold outline-none text-xs" 
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
                   />
                </div>
              </div>

              {/* HOURS & TYPE */}
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-app-accent tracking-widest">Target Hours</label>
                  <input 
                    required 
                    type="number" 
                    value={formData.hours} 
                    className="bg-app-bg border-4 border-app-border p-3 rounded-xl text-app-text font-bold outline-none text-xs" 
                    onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })} 
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-app-accent tracking-widest">Type</label>
                  <button 
                    type="button" 
                    onClick={toggleShared} 
                    className={`h-full border-4 border-app-border rounded-xl font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 ${formData.isShared ? "bg-app-accent text-app-card" : "bg-app-bg text-app-text"}`}
                  >
                    {formData.isShared ? "👥 Shared" : "👤 Solo"}
                  </button>
                </div>
              </div>

              {/* SHARED CODE PREVIEW */}
              <AnimatePresence>
                {formData.isShared && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-black/20 rounded-xl p-4 border-2 border-app-border border-dashed text-center">
                      <p className="text-[9px] font-black uppercase text-app-accent mb-1">Canvas Sync Code</p>
                      <p className="text-xl font-mono font-black tracking-widest text-app-text">{tempCode}</p>
                      <p className="text-[8px] uppercase text-app-text/40 mt-1">Friends use this to add this canvas to their wall</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                disabled={loading} 
                type="submit" 
                className="mt-4 w-full py-4 bg-app-accent text-app-card border-4 border-app-border rounded-2xl font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
              >
                {loading ? "Syncing..." : "Drop Canvas on Wall"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}