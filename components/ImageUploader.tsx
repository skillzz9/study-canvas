"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  storageKey?: string;
  onImageChange?: (image: string | null) => void;
}

export default function ImageUploader({ 
  storageKey = "user-avatar", 
  onImageChange 
}: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false); // Critical for Next.js

  useEffect(() => {
    setMounted(true);
    const savedImage = localStorage.getItem(storageKey);
    if (savedImage) {
      setImage(savedImage);
      onImageChange?.(savedImage);
    }
  }, [storageKey, onImageChange]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        localStorage.setItem(storageKey, base64String);
        onImageChange?.(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteImage = () => {
    setImage(null);
    localStorage.removeItem(storageKey);
    onImageChange?.(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Prevent the "Stuck" UI by returning null until the browser is ready
  if (!mounted) return <div className="aspect-square w-full rounded-2xl bg-zinc-100 animate-pulse" />;

  if (image) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-lofi-charcoal bg-white">
          <Image
            src={image}
            alt="Uploaded Panda"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        {/* This button should now be visible */}
        <button
          onClick={deleteImage}
          type="button"
          className="w-full rounded-xl bg-red-400 py-3 font-bold text-lofi-charcoal border-2 border-lofi-charcoal shadow-[4px_4px_0px_0px_rgba(61,61,61,1)] hover:bg-red-500 active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          DELETE & TRY ANOTHER
        </button>
      </div>
    );
  }

  return (
    <label className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-lofi-charcoal/30 bg-zinc-50/50 text-lofi-charcoal/60 hover:text-lofi-charcoal hover:border-lofi-charcoal transition-all">
      <span className="text-4xl">+</span>
      <span className="text-sm font-medium italic">Upload Image</span>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </label>
  );
}