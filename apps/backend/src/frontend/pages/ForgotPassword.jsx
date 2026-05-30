"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SharedNavbar from '@/frontend/components/SharedNavbar';
import { useRouter } from "next/navigation";
import { getToken } from "@/frontend/utils/auth";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Simulate API call since there's no actual backend route specified for this yet
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Jika email terdaftar, tautan reset akan dikirimkan.');
    } catch {
      setError('Tidak dapat terhubung ke server. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-animated-gradient-dashboard text-slate-800 font-sans min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-white/20 z-0 pointer-events-none"></div>
      {/* Navbar exactly like Dashboard but for unauthenticated users */}
      <SharedNavbar />

      <main className="relative z-10 flex-grow flex items-center justify-center p-4">
        {/* Bright Glassmorphism Card */}
        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl p-10 flex flex-col items-center">
          <header className="flex flex-col items-center w-full mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-wide text-center">
              Forgot Password
            </h1>
            <p className="text-slate-600 text-sm mt-2 font-semibold text-center">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </header>

          {error && (
            <div className="w-full mb-4 px-4 py-3 rounded-xl bg-red-100/90 backdrop-blur-sm border border-red-200 text-red-600 font-medium text-sm text-center">
              {error}
            </div>
          )}
          
          {success && (
            <div className="w-full mb-4 px-4 py-3 rounded-xl bg-teal-100/90 backdrop-blur-sm border border-teal-200 text-teal-800 font-medium text-sm text-center">
              {success}
            </div>
          )}

          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5 relative">
              <label className="block text-sm font-bold text-slate-700 ml-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 focus:border-[var(--color-primary)] focus:bg-white/80 text-slate-800 placeholder-slate-400 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
                <svg className="w-5 h-5 absolute right-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
            </div>

            <div className="pt-4">
              <button
                className="w-full bg-[var(--color-primary)] hover:bg-teal-500 text-white font-bold py-3.5 px-6 rounded-xl transition-colors duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Reset Password'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-sm text-center text-slate-700 font-medium">
            <span>Remembered your password? </span>
            <Link className="font-bold text-[var(--color-primary)] hover:text-teal-600 transition-colors duration-200" href="/login">
              Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
