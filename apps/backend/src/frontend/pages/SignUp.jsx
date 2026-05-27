"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registrasi gagal');
        return;
      }

      // Registrasi berhasil, arahkan ke halaman login
      router.push('/login');
    } catch {
      setError('Tidak dapat terhubung ke server. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg-surface)] min-h-screen flex items-center justify-center font-sans antialiased p-4 text-gray-900">
      <main className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8 sm:p-10 flex flex-col items-center">
        {/* Header Section */}
        <header className="flex flex-col items-center w-full mb-8">
          {/* Logo Placeholder */}
          <div className="w-20 h-20 border border-gray-300 flex items-center justify-center mb-6 relative">
            <svg className="w-full h-full text-gray-300 absolute inset-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 4l16 16m0-16L4 20"></path>
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-black tracking-wide uppercase text-center">
            Kanbanflow Sign-Up
          </h1>
        </header>

        {/* Error Message */}
        {error && (
          <div className="w-full mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form Section */}
        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-800 mb-1.5 ml-1" htmlFor="username">Username</label>
            <input
              className="w-full border border-gray-400 rounded-full py-2.5 px-4 text-gray-700 text-sm focus:ring-2 focus:ring-[var(--color-teal-flow)] focus:border-transparent transition-all duration-200 outline-none"
              id="username"
              name="username"
              required
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email Field */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-800 mb-1.5 ml-1" htmlFor="email">Email</label>
            <input
              className="w-full border border-gray-400 rounded-full py-2.5 px-4 text-gray-700 text-sm focus:ring-2 focus:ring-[var(--color-teal-flow)] focus:border-transparent transition-all duration-200 outline-none"
              id="email"
              name="email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-800 mb-1.5 ml-1" htmlFor="password">Password</label>
            <input
              className="w-full border border-gray-400 rounded-full py-2.5 px-4 text-gray-700 text-sm focus:ring-2 focus:ring-[var(--color-teal-flow)] focus:border-transparent transition-all duration-200 outline-none"
              id="password"
              name="password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-800 mb-1.5 ml-1" htmlFor="confirmPassword">Konfirmasi Password</label>
            <input
              className="w-full border border-gray-400 rounded-full py-2.5 px-4 text-gray-700 text-sm focus:ring-2 focus:ring-[var(--color-teal-flow)] focus:border-transparent transition-all duration-200 outline-none"
              id="confirmPassword"
              name="confirmPassword"
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            className="w-full bg-[var(--color-teal-flow)] hover:bg-[var(--color-teal-flow-hover)] text-white font-medium rounded-full py-3 mt-4 transition-colors duration-200 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Buat Akun'}
          </button>
        </form>

        {/* Footer Section */}
        <footer className="mt-6 text-center w-full">
          <p className="text-xs sm:text-sm text-gray-600">
            Sudah Punya Akun? <Link className="font-bold text-gray-900 hover:text-[var(--color-teal-flow)] transition-colors duration-200" href="/login">Masuk Sekarang</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}