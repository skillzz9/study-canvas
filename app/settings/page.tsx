"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getUserDocument } from "@/lib/userService";
import { doc, updateDoc } from "firebase/firestore";
import { UserProfile } from "@/types";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"user" | "avatar">("user");
  const [userData, setUserData] = useState<UserProfile | null>(null);

  // Update this list to match your public/avatars folder
  const avatarOptions = [
    "avatar1.webp",
    "avatar2.webp",
    "avatar3.webp",
    "avatar4.webp",
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      const fetchProfile = async () => {
        const profile = await getUserDocument(user.uid);
        setUserData(profile);
      };
      fetchProfile();
    }
  }, [user, loading, router]);

  const handleUpdateAvatar = async (avatarName: string) => {
    if (!user) return;
    const newPath = `/avatars/${avatarName}`;
    
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { avatar: newPath });
      setUserData(prev => prev ? { ...prev, avatar: newPath } : null);
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  const handleLogOut = async () => {
    await signOut(auth);
    router.push("/signin");
  };

  if (loading || !user) return null;

  return (
    <main className="flex h-screen w-full bg-paper font-space overflow-hidden">
      {/* ASYNC ANIMATIONS */}
      <style jsx global>{`
        @keyframes bop {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spinY {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        
        /* Different durations keep them from syncing up */
        .bop-layer {
          animation: bop 3s ease-in-out infinite;
        }
        
        .spin-layer {
          animation: spinY 4.3s linear infinite;
          transform-style: preserve-3d;
          perspective: 1000px;
        }
      `}</style>

      {/* LEFT SIDEBAR */}
      <aside className="w-64 border-r-4 border-neutral-800 bg-white flex flex-col">
        <div className="p-6 border-b-4 border-neutral-800">
          <h1 className="text-xl font-black uppercase tracking-tighter italic text-neutral-800">Settings</h1>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab("user")}
            className={`w-full text-left p-4 rounded-xl font-bold uppercase transition-all border-2 ${activeTab === "user" ? "bg-blue-500 text-white border-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-transparent border-transparent hover:bg-neutral-200 text-neutral-600"}`}
          >
            User
          </button>
          <button 
            onClick={() => setActiveTab("avatar")}
            className={`w-full text-left p-4 rounded-xl font-bold uppercase transition-all border-2 ${activeTab === "avatar" ? "bg-blue-500 text-white border-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-transparent border-transparent hover:bg-neutral-200 text-neutral-600"}`}
          >
            Avatar
          </button>
        </nav>

        <div className="p-4 mt-auto border-t-4 border-neutral-800 flex flex-col gap-2">
          <button 
            onClick={() => router.push("/")}
            className="w-full py-3 bg-neutral-800 text-white font-bold rounded-xl uppercase text-sm hover:bg-neutral-700 transition-colors"
          >
            Back to Room
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <section className="flex-1 overflow-y-auto p-12 bg-paper text-neutral-800">
        
        {activeTab === "user" && (
          <div className="max-w-2xl animate-in fade-in duration-300">
            <h2 className="text-4xl font-black uppercase mb-8">User Profile</h2>
            
            <div className="grid gap-6">
              <div className="p-6 bg-neutral-100 border-4 border-neutral-800 rounded-3xl">
                <label className="block text-xs font-black text-neutral-500 uppercase mb-2">Username</label>
                <p className="text-2xl font-bold">{userData?.username || "Loading..."}</p>
              </div>

              <div className="p-6 bg-neutral-100 border-4 border-neutral-800 rounded-3xl">
                <label className="block text-xs font-black text-neutral-500 uppercase mb-2">Email Address</label>
                <p className="text-2xl font-bold break-all">{user.email}</p>
              </div>

              <button 
                onClick={handleLogOut}
                className="mt-4 w-fit px-8 py-4 bg-red-500 text-white border-4 border-neutral-800 rounded-2xl font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

       {activeTab === "avatar" && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300 flex flex-col items-center">
            <h2 className="text-4xl font-black uppercase mb-12 text-center">Artist Select</h2>
            
            {/* CURRENT SELECTION */}
            <div className="relative mb-16">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-50 scale-150 -z-10"></div>
              
              <div className="flex flex-col items-center gap-6 p-10 bg-white border-4 border-neutral-800 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <div>
                    <img 
                      src={userData?.avatar || "/avatars/avatar1.webp"} 
                      alt="Selected Artist" 
                      className="w-56 h-56 object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>
                <div className="px-6 py-2 bg-blue-500 border-2 border-neutral-800 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <p className="font-black uppercase text-white text-sm tracking-widest">Active Artist</p>
                </div>
              </div>
            </div>

            <div className="w-full flex items-center gap-4 mb-8">
              <div className="h-1 flex-1 bg-neutral-200"></div>
              <p className="font-black uppercase text-neutral-400 text-xs tracking-widest">Available Artists</p>
              <div className="h-1 flex-1 bg-neutral-200"></div>
            </div>

            {/* GRID OPTIONS */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-10 pb-20">
              {avatarOptions.map((name) => {
                const isSelected = userData?.avatar.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() => handleUpdateAvatar(name)}
                    className={`
                      aspect-square p-4 bg-white border-4 border-neutral-800 rounded-2xl transition-all 
                      hover:scale-105
                      ${isSelected ? 'bg-yellow-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : 'hover:bg-neutral-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}
                    `}
                  >
                    <div className="bop-layer">
                      <div className="spin-layer">
                        <img 
                          src={`/avatars/${name}`} 
                          alt={name} 
                          className={`w-full h-full object-contain ${isSelected ? 'scale-110' : 'grayscale-[20%] hover:grayscale-0'}`} 
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}