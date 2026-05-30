"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SharedNavbar from '@/frontend/components/SharedNavbar';
import { useRouter } from "next/navigation";
import { setAuth, getToken } from "@/frontend/utils/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.replace('/dashboard');
      return;
    }

    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login gagal');
        return;
      }

      setAuth(data.token, data.user, rememberMe);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      router.push('/dashboard');
    } catch {
      setError('Tidak dapat terhubung ke server. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-slate-800 font-sans min-h-screen flex flex-col relative overflow-hidden">
      {/* BEGIN: Background Elements (Orbs + Dot Grid) */}
      <div className="absolute top-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#2ecfb4] opacity-[0.08] blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400 opacity-[0.04] blur-[120px] pointer-events-none z-0"></div>
      
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(148, 163, 184, 0.25) 1.5px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      ></div>
      {/* END: Background Elements */}
      {/* Navbar exactly like Dashboard but for unauthenticated users */}
      <SharedNavbar />

      <main className="relative z-10 flex-grow flex items-center justify-center p-4">
        {/* Minimalist Solid Card */}
        <div className="w-full max-w-md bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 flex flex-col items-center">
          <header className="flex flex-col items-center w-full mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-wide text-center">
              Welcome back :)
            </h1>
            <p className="text-slate-600 text-sm mt-2 font-semibold text-center">
              Please enter your details to sign in and continue your projects.
            </p>
          </header>

          {error && (
            <div className="w-full mb-4 px-4 py-3 rounded-xl bg-red-100/90 backdrop-blur-sm border border-red-200 text-red-600 font-medium text-sm text-center">
              {error}
            </div>
          )}

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2 relative">
              <label className="block text-sm font-bold text-slate-700" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2ecfb4] focus:bg-white text-slate-800 placeholder-slate-400 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-[#2ecfb4]"
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                />
                <svg className="w-5 h-5 absolute right-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="block text-sm font-bold text-slate-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#2ecfb4] focus:bg-white text-slate-800 placeholder-slate-400 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-[#2ecfb4]"
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                />
                <svg className="w-5 h-5 absolute right-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-700 font-semibold">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded bg-slate-50 border-slate-300 text-[#2ecfb4] focus:ring-[#2ecfb4] cursor-pointer" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" className="hover:text-[#2ecfb4] hover:underline transition-colors">
                Forgot Password?
              </Link>
            </div>

            <div className="pt-2">
              <button
                className="w-full bg-[#2ecfb4] hover:bg-[#25b59d] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(46,207,180,0.3)] hover:shadow-[0_6px_20px_rgba(46,207,180,0.4)] transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Memuat...' : 'Login'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-sm text-center text-slate-700 font-medium">
            <span>Don't have an account? </span>
            <Link className="font-bold text-[#2ecfb4] hover:text-teal-600 transition-colors duration-200" href="/signup">
              Register
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}