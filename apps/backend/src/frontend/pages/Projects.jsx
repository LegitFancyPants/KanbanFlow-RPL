"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationBell from "@/frontend/components/NotificationBell";

const API = "";

function authHeaders() {
  const token = localStorage.getItem('token');
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
    <article onClick={() => onOpen(project.id_project)} className="bg-[var(--color-card)] rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden transition-transform hover:-translate-y-1 cursor-pointer">
      <div className="flex justify-between items-start mb-4 gap-4">
        <h3 className="text-xl font-bold leading-tight break-words flex-1">{project.name}</h3>
        <span className="bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
          {ROLE_LABEL[project.user_role] || 'Anggota'}
        </span>
      </div>

      <p className="text-sm text-[var(--color-textMuted)] mb-6 flex-1 line-clamp-3">
        {project.description || 'Tidak ada deskripsi.'}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">
            {getInitials(project.username)}
          </div>
          <span className="text-xs text-gray-500">{project.username}</span>
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
  const router = useRouter();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  async function fetchProjects() {
    try {
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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface-projects)] text-[var(--color-textMain)] font-sans relative">

      {/* Header */}
      <nav className="bg-white shadow-sm px-6 lg:px-12 py-4 flex items-center justify-between w-full mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
          <img src="/logo.png" alt="KanbanFlow Logo" className="h-8 w-auto object-contain" />
        </div>
        <div className="hidden md:flex items-center gap-8 font-medium">
          <Link className="text-[var(--color-textMuted)] hover:text-[var(--color-textMain)] transition-colors" href="/dashboard">Beranda</Link>
          <Link className="text-[var(--color-primary)]" href="/projects">Proyek Tim</Link>
        </div>
        <div className="flex items-center gap-2"><NotificationBell /><div className="relative">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-full transition-colors"
            onClick={() => setDropdownOpen(o => !o)}
          >
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {getInitials(user.username || '')}
            </div>
            <span className="font-medium hidden sm:block">{user.username || 'User'}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-500 font-semibold hover:bg-red-50 transition-colors"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
        </div>

      </nav>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 pb-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">Direktori Proyek Aktif</h2>
          <p className="text-[var(--color-textMuted)] max-w-2xl mx-auto">Kelola semua proyek dari berbagai sumber dalam satu dashboard terintegrasi.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Memuat proyek...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium mb-2">Belum ada proyek</p>
            <p className="text-sm">Klik tombol + untuk membuat proyek baru</p>
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
        onClick={() => { setError(''); setIsModalOpen(true); }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-black text-[var(--color-primary)] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p className="font-medium text-slate-600">&copy; 2026 Kanbanflow. All rights reserved.</p>
        </div>
      </footer>

      {/* Modal Buat Proyek */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-400/50 backdrop-blur-sm z-50 flex justify-center items-center" role="dialog">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 relative m-4">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="mb-8 border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-bold mb-2">Buat Proyek Baru</h2>
              <p className="text-sm text-gray-600">Kelola semua proyek baru dan tugas anda disini.</p>
            </div>
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
            )}
            <form onSubmit={handleCreate}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Nama Proyek</label>
                <input
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                  placeholder="Contoh : Website Lelangin Indonesia"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Deskripsi</label>
                <textarea
                  className="w-full px-4 py-3 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm resize-none"
                  placeholder="Jelaskan tujuan dan deskripsi proyek"
                  rows="4"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-6 rounded-full border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors">
                  Kembali
                </button>
                <button type="submit" disabled={creating} className="flex-1 py-3 px-6 rounded-full bg-[var(--color-primary)] text-white font-semibold hover:bg-teal-500 transition-colors disabled:opacity-60">
                  {creating ? 'Menyimpan...' : 'Simpan Proyek'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}