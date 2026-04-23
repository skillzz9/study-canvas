"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { joinPaintingByCode } from "@/lib/paintingService";
import { useAuth } from "@/context/AuthContext";

interface JoinPaintingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinPaintingModal({ isOpen, onClose }: JoinPaintingModalProps) {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || code.length !== 5) return;
    
    setLoading(true);
    setError(null);

    try {
      await joinPaintingByCode(user.uid, code);
      onClose();
      setCode("");
    } catch (err: any) {
      setError("Invalid code or already joined.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-sm bg-app-card border-4 border-app-border rounded-3xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.3)]"
          >
            <h2 className="text-xl font-black text-app-text uppercase italic mb-4 text-center">Sync Canvas</h2>
            
            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-app-accent tracking-widest text-center">Enter 5-Character Code</label>
                <input 
                  autoFocus
                  required
                  maxLength={5}
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="XJ49L"
                  className="bg-app-bg border-4 border-app-border p-4 rounded-2xl text-app-text font-black outline-none text-2xl text-center tracking-[0.5em] uppercase focus:border-app-accent transition-colors"
                />
              </div>

              {error && <p className="text-[10px] font-black text-red-500 uppercase text-center">{error}</p>}

              <button 
                disabled={loading || code.length !== 5}
                type="submit" 
                className="w-full py-4 bg-app-accent text-app-card border-4 border-app-border rounded-2xl font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 transition-all"
              >
                {loading ? "Verifying..." : "Link to Wall"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}