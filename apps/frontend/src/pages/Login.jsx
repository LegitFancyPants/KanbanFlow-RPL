import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
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

        {/* Form Section */}
        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          {/* Email / Username Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800" htmlFor="username">
              Email / Username
            </label>
            <input
              className="w-full px-4 py-3 rounded-full border border-gray-400 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal focus:ring-opacity-50 transition-colors duration-200 focus:outline-none"
              id="username"
              name="username"
              placeholder=""
              required
              type="text"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-3 rounded-full border border-gray-400 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal focus:ring-opacity-50 transition-colors duration-200 focus:outline-none"
              id="password"
              name="password"
              placeholder=""
              required
              type="password"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              className="w-full bg-brand-teal hover:bg-brand-tealHover text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 shadow-md"
              type="submit"
            >
              Masuk
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-sm text-center">
          <span className="text-gray-600">Belum Punya Akun? </span>
          <Link className="font-bold text-gray-800 hover:text-brand-teal transition-colors duration-200" to="/signup">
            Daftar Sekarang
          </Link>
        </div>
      </main>
    </div>
  );
}
