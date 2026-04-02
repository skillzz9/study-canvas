"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  storageKey?: string;
}

export default function ImageUploader({ storageKey = "user-avatar" }: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(null);

  // Load image from localStorage on mount
  useEffect(() => {
    const savedImage = localStorage.getItem(storageKey);
    if (savedImage) {
      setImage(savedImage);
    }
  }, [storageKey]);

  // Logic: Handles the file selection and conversion to Base64
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        localStorage.setItem(storageKey, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Logic: Clears state and storage
  const removeImage = () => {
    setImage(null);
    localStorage.removeItem(storageKey);
  };

  return (
    <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-lofi-charcoal/30 bg-zinc-50/50">
      {image ? (
        <>
          <Image
            src={image}
            alt="Uploaded avatar overlay"
            fill
            className="object-cover"
            unoptimized // Useful for base64 strings in dev
          />
          <button
            onClick={removeImage}
            aria-label="Remove image"
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-lofi-charcoal text-white hover:bg-red-500 transition-colors shadow-sm"
          >
            ✕
          </button>
        </>
      ) : (
        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-lofi-charcoal/60 hover:text-lofi-charcoal transition-colors">
          <span className="text-4xl">+</span>
          <span className="text-sm font-medium italic">Upload Canvas Image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      )}
    </div>
  );
}