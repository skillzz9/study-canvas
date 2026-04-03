"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("studyImage");
    if (saved) setImage(saved);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImage(base64String);
      
      try {
        localStorage.setItem("studyImage", base64String);
      } catch (error) {
        alert("This image file is too large to save! Please try a smaller file.");
        setImage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEnterStudyRoom = () => {
    if (image) {
      router.push("/studyroom");
    }
  };

  const clearImage = () => {
    setImage(null);
    localStorage.removeItem("studyImage");
  };

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-100 p-6">
      <div className="w-full max-w-md rounded-3xl border-4 border-neutral-800 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(61,61,61,1)]">
        
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-neutral-800 uppercase tracking-tight">Studio Setup</h1>
        </header>

        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-neutral-800 bg-neutral-50 mb-6 flex items-center justify-center">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-neutral-400 p-4">
              <p className="mb-2 text-sm font-bold">Upload Visual Reward</p>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {image && (
            <>
              <button 
                onClick={handleEnterStudyRoom}
                className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white border-2 border-neutral-800 shadow-[4px_4px_0px_0px_rgba(61,61,61,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all uppercase"
              >
                Enter Study Room
              </button>
              
              <button 
                onClick={clearImage}
                className="w-full rounded-xl bg-red-400 py-2 text-xs font-bold text-white border-2 border-neutral-800 shadow-[2px_2px_0px_0px_rgba(61,61,61,1)] transition-all uppercase active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
              >
                Clear Image
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}