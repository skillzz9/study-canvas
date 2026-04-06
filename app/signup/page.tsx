"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; 
// 1. IMPORT YOUR DATABASE SERVICE FUNCTION
import { createUserDocument } from "@/lib/userService";

export default function SignUpPage() {
  const router = useRouter();
  // 2. ADD A STATE FOR THE USERNAME
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Create the secure Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: CALL YOUR FUNCTION TO SAVE THEM TO FIRESTORE
      await createUserDocument(user.uid, user.email, username);

      // Step 3: Redirect to your study room
      router.push("/"); 
    } catch (err: any) {
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
            Create Account
          </h1>
          <p className="font-space text-neutral-500 mt-2">
            Join the room and start tracking your focus sessions.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 rounded-xl font-space text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          
          {/* 3. ADD THE USERNAME INPUT TO THE FORM */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-4 bg-neutral-100 border-4 border-neutral-800 rounded-2xl font-space focus:outline-none focus:bg-white transition-colors"
          />

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
            placeholder="Password (min. 6 characters)"
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
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <Link
          href="/login"
          className="font-space text-center text-neutral-600 hover:text-neutral-900 underline underline-offset-4 text-sm mt-2 block"
        >
          Already have an account? Log in
        </Link>

      </div>
    </main>
  );
}