"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationBell from "@/frontend/components/NotificationBell";
import LoginModal from "@/frontend/components/LoginModal";
import { getToken, getUser, clearAuth } from "@/frontend/utils/auth";
import SharedNavbar from "@/frontend/components/SharedNavbar";

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const ROLE_LABEL = { owner: 'Pemilik', member: 'Anggota', viewer: 'Penonton' };

function ProjectCard({ project, onOpen }) {
  return (
    <article onClick={() => onOpen(project.id_project)} className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-md border border-white/60 flex flex-col relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:bg-white/80 cursor-pointer text-slate-800">
      <div className="flex justify-between items-start mb-4 gap-4">
        <h3 className="text-xl font-bold leading-tight break-words flex-1 text-slate-900">{project.name}</h3>
        <span className="bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap shadow-sm">
          {ROLE_LABEL[project.user_role] || 'Anggota'}
        </span>
      </div>

      <p className="text-sm text-slate-600 mb-6 flex-1 line-clamp-3 font-medium">
        {project.description || 'Tidak ada deskripsi.'}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] border border-white/50 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {getInitials(project.username)}
          </div>
          <span className="text-xs text-slate-600 font-bold">{project.username}</span>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  const user = getUser();
  const username = user.username || 'Pengunjung';

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  async function fetchProjects() {
    const token = getToken();
    if (!token) {
      setIsLoggedIn(false);
      setProjects([]);
      return;
    }
    try {
      setIsLoggedIn(true);
      const res = await fetch(`/api/projects`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Gagal memuat proyek');
      const data = await res.json();
      setProjects(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProjects(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch(`/api/projects`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...form, created_by: user.id_user }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat proyek');
      setIsModalOpen(false);
      setForm({ name: '', description: '' });
      router.push(`/board/${data.id_project}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }
  
  function handleFabClick() {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      setError('');
      setIsModalOpen(true);
    }
  }

  return (
    <div className="bg-animated-gradient-dashboard text-slate-800 font-sans min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-white/20 z-0 pointer-events-none"></div>

      {/* BEGIN: Navigation Bar */}
      <SharedNavbar />
      {/* END: Navigation Bar */}

      {/* Main */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 pt-10 pb-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 tracking-tight">Direktori Proyek Aktif</h2>
          <p className="text-slate-700 text-lg font-medium max-w-2xl mx-auto">Kelola semua proyek dari berbagai sumber dalam satu dashboard terintegrasi.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-600 font-bold text-lg">Memuat proyek...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-md max-w-xl mx-auto">
            <p className="text-xl font-black mb-2 text-slate-800">{isLoggedIn ? 'Belum ada proyek' : 'Anda belum login'}</p>
            <p className="text-slate-600 font-medium">{isLoggedIn ? 'Klik tombol + di kanan bawah untuk membuat proyek baru' : 'Silakan login untuk melihat dan membuat proyek'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => (
              <ProjectCard key={p.id_project} project={p} onOpen={(id) => router.push(`/board/${id}`)} />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        aria-label="Buat proyek baru"
        onClick={handleFabClick}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[var(--color-primary)] hover:bg-teal-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all z-40 border border-teal-400"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* BEGIN: Footer */}
      <footer className="relative z-10 mt-auto bg-white/40 backdrop-blur-md border-t border-white/50">
        <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-600">
          <p className="font-semibold">&copy; 2026 Kanbanflow. All rights reserved.</p>
          <div className="flex flex-wrap justify-center space-x-6 mt-4 md:mt-0 font-semibold">
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
      {/* END: Footer */}

      {/* Modal Buat Proyek */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex justify-center items-center p-4" role="dialog">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl w-full max-w-lg p-8 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="mb-8 border-b border-slate-200 pb-6">
              <h2 className="text-2xl font-black mb-2 text-slate-800">Buat Proyek Baru</h2>
              <p className="text-sm text-slate-600 font-semibold">Kelola semua proyek baru dan tugas anda disini.</p>
            </div>
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-100/90 backdrop-blur-sm border border-red-200 text-red-600 font-medium text-sm text-center">{error}</div>
            )}
            <form onSubmit={handleCreate}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nama Proyek</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:bg-white/80 text-slate-800 placeholder-slate-400 transition-colors duration-200 text-sm font-medium"
                  placeholder="Contoh : Website Lelangin Indonesia"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Deskripsi</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:bg-white/80 text-slate-800 placeholder-slate-400 transition-colors duration-200 text-sm font-medium resize-none"
                  placeholder="Jelaskan tujuan dan deskripsi proyek"
                  rows="4"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 px-6 rounded-xl bg-white/60 hover:bg-white/80 border border-slate-300 text-slate-700 font-bold transition-colors shadow-sm">
                  Batal
                </button>
                <button type="submit" disabled={creating} className="flex-1 py-3.5 px-6 rounded-xl bg-[var(--color-primary)] hover:bg-teal-500 text-white font-bold transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                  {creating ? 'Menyimpan...' : 'Simpan Proyek'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}