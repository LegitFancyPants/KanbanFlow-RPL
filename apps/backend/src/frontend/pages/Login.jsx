"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      // Simpan token ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/dashboard');
    } catch {
      setError('Tidak dapat terhubung ke server. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-text)] flex items-center justify-center p-4">
      <main className="w-full max-w-md bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center">
        {/* Logo Placeholder */}
        <div className="mb-6 border-2 border-gray-800 p-2 w-24 h-24 flex items-center justify-center relative">
          <div className="absolute w-full h-full border-t border-gray-800 transform rotate-45"></div>
          <div className="absolute w-full h-full border-t border-gray-800 transform -rotate-45"></div>
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold tracking-wide uppercase mb-10 text-center">
          Kanbanflow Login
        </h1>

        {/* Error Message */}
        {error && (
          <div className="w-full mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-4 py-3 rounded-full border border-gray-400 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal focus:ring-opacity-50 transition-colors duration-200 focus:outline-none"
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-3 rounded-full border border-gray-400 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal focus:ring-opacity-50 transition-colors duration-200 focus:outline-none"
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <button
              className="w-full bg-brand-teal hover:bg-brand-tealHover text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Memuat...' : 'Masuk'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-sm text-center">
          <span className="text-gray-600">Belum Punya Akun? </span>
          <Link className="font-bold text-gray-800 hover:text-brand-teal transition-colors duration-200" href="/signup">
            Daftar Sekarang
          </Link>
        </div>
      </main>
    </div>
  );
}