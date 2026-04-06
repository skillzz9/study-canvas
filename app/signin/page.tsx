"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
// IMPORTANT: Update this path to wherever your firebase.ts file lives!
import { auth } from "@/lib/firebase"; 

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Log in an existing user
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/"); // Redirect to your study room
      } else {
        // Sign up a brand new user
        await createUserWithEmailAndPassword(auth, email, password);
        router.push("/"); // Redirect to your study room
      }
    } catch (err: any) {
      // Firebase throws specific error messages we can display
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white p-8 rounded-3xl border-4 border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
        
        <div className="text-center">
          <h1 className="font-space text-3xl font-bold text-neutral-800 uppercase tracking-widest">
            {isLogin ? "Welcome Back" : "Join the Room"}
          </h1>
          <p className="font-space text-neutral-500 mt-2">
            {isLogin ? "Log in to continue your focus session." : "Create an account to track your progress."}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 rounded-xl font-space text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-4 bg-neutral-100 border-4 border-neutral-800 rounded-2xl font-space focus:outline-none focus:bg-white transition-colors"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full p-4 bg-neutral-100 border-4 border-neutral-800 rounded-2xl font-space focus:outline-none focus:bg-white transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 border-4 border-neutral-800 font-space rounded-2xl font-bold uppercase transition-all bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
          className="font-space text-neutral-600 hover:text-neutral-900 underline underline-offset-4 text-sm mt-2"
        >
          {isLogin 
            ? "Don't have an account? Sign up" 
            : "Already have an account? Log in"}
        </button>

      </div>
    </main>
  );
}