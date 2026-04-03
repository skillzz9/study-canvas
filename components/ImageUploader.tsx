"use client";

import React from "react";

interface ImageUploaderProps {
  image: string | null;
  onUpload: (base64: string) => void;
  onClear: () => void;
}

export default function ImageUploader({ image, onUpload, onClear }: ImageUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onUpload(base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-neutral-800 bg-neutral-50 mb-6 flex items-center justify-center">
      {image ? (
        <div className="relative w-full h-full group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Preview" className="w-full h-full object-cover" />
          
          {/* Small clear button that appears on hover */}
          <button 
            onClick={onClear}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border-2 border-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-bold"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="text-center text-neutral-400 p-4">
          <p className="mb-2 text-sm font-bold uppercase tracking-tighter">Upload Visual Reward</p>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-2 file:border-neutral-800 file:text-xs file:font-bold file:bg-white file:text-neutral-800 hover:file:bg-neutral-100"
          />
        </div>
      )}
    </div>
  );
}