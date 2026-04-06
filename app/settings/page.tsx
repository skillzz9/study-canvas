"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Protect the route
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading || !user) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-100 p-6">
      <div className="w-full max-w-md rounded-3xl border-4 border-neutral-800 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(61,61,61,1)]">
        
        <header className="mb-8 text-center border-b-4 border-neutral-800 pb-4">
          <h1 className="text-3xl font-bold text-neutral-800 uppercase tracking-widest">Settings</h1>
        </header>

        <div className="flex flex-col gap-4">
          <div className="p-4 bg-neutral-100 border-2 border-neutral-800 rounded-xl">
            <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Logged in as</p>
            <p className="font-bold text-neutral-800 break-all">{user.email}</p>
          </div>

          <button 
            onClick={handleLogOut}
            className="w-full rounded-xl bg-red-500 py-4 font-bold text-white border-2 border-neutral-800 shadow-[4px_4px_0px_0px_rgba(61,61,61,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all uppercase mt-4"
          >
            Log Out
          </button>

          <Link 
            href="/"
            className="w-full rounded-xl bg-neutral-200 py-4 font-bold text-neutral-800 border-2 border-neutral-800 shadow-[4px_4px_0px_0px_rgba(61,61,61,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all uppercase text-center mt-2"
          >
            Back to Room
          </Link>
        </div>
      </div>
    </main>
  );
}