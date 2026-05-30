import React from 'react';
import Link from 'next/link';

export default function LoginModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-center items-center" role="dialog">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 relative m-4 text-center">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 transition-colors">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-slate-900">Akses Ditolak</h2>
        <p className="text-slate-600 mb-8">
          Anda harus login terlebih dahulu untuk menggunakan fitur ini. Silakan masuk atau daftar jika belum memiliki akun.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/login" className="w-full py-3 px-6 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold transition-colors">
            Masuk ke Akun
          </Link>
          <button onClick={onClose} className="w-full py-3 px-6 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
