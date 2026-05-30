"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationBell from "@/frontend/components/NotificationBell";
import LoginModal from "@/frontend/components/LoginModal";
import SharedNavbar from "@/frontend/components/SharedNavbar";
import { getToken, getUser, clearAuth } from "@/frontend/utils/auth";

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Dashboard() {
  const router = useRouter();
  const user = getUser();
  const username = user.username || 'Pengunjung';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stats, setStats] = useState({ activeProjects: 0, completedTasks: 0, overdueTasks: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = getToken();
        if (!token) {
          setIsLoggedIn(false);
          return;
        }
        setIsLoggedIn(true);
        const res = await fetch('/api/dashboard/stats', {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    }
    fetchStats();
  }, []);

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }
  
  function handleProtectedAction(e) {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  }

  return (
    <div className="bg-animated-gradient-dashboard text-slate-800 font-sans min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Overlay for depth */}
      <div className="absolute inset-0 bg-white/20 z-0 pointer-events-none"></div>

      <SharedNavbar />

      {/* BEGIN: Main Content Area */}
      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          
          {/* BEGIN: Hero Section */}
          <section className="lg:col-span-6 xl:col-span-5 flex">
            <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/60 p-8 md:p-10 flex flex-col justify-between w-full shadow-xl">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-slate-900 tracking-tight">
                  Alur Kerja Lebih<br />Terukur dan Presisi
                </h1>
                <p className="text-slate-700 text-lg md:text-xl font-medium max-w-md mt-4">
                  Selamat datang kembali, {username}. Kamu memiliki {stats.overdueTasks} tugas terlewat yang perlu ditinjau.
                </p>
              </div>
              <div className="mt-12 lg:mt-16">
                <Link href="/projects" className="inline-block bg-[var(--color-primary)] hover:bg-teal-500 border border-transparent text-white px-8 py-4 rounded-full font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-lg">
                  Lihat Proyek Tim
                </Link>
              </div>
            </div>
          </section>
          {/* END: Hero Section */}

          {/* BEGIN: Statistics Section */}
          <section className="lg:col-span-6 xl:col-span-7 flex flex-col space-y-6 justify-center">
            
            {/* Stat Card 1 */}
            <article className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 p-6 md:p-8 shadow-md hover:shadow-lg hover:bg-white/80 transition-all flex items-center space-x-6 relative group cursor-pointer" onClick={handleProtectedAction}>
              {!isLoggedIn && <div className="absolute inset-0 z-10"></div>}
              <div className="flex flex-col min-w-[120px]">
                <span className="text-5xl font-black text-[var(--color-primary)] leading-none">{String(stats.completedTasks).padStart(2, "0")}</span>
                <span className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-wider">Tugas Selesai</span>
              </div>
              <p className="text-slate-700 font-medium text-sm md:text-base border-l-2 border-slate-300 pl-6 py-2">
                Tugas yang telah diselesaikan terus meningkat setiap harinya.
              </p>
            </article>

            {/* Stat Card 2 */}
            <article className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 p-6 md:p-8 shadow-md hover:shadow-lg hover:bg-white/80 transition-all flex items-center space-x-6 relative group cursor-pointer" onClick={handleProtectedAction}>
              {!isLoggedIn && <div className="absolute inset-0 z-10"></div>}
              <div className="flex flex-col min-w-[120px]">
                <span className="text-5xl font-black text-[var(--color-primary)] leading-none">{String(stats.activeProjects).padStart(2, "0")}</span>
                <span className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-wider">Proyek Aktif</span>
              </div>
              <p className="text-slate-700 font-medium text-sm md:text-base border-l-2 border-slate-300 pl-6 py-2">
                Pantau perkembangan seluruh proyek aktif secara real-time.
              </p>
            </article>

            {/* Stat Card 3 (Warning) */}
            <article className="bg-red-50/80 backdrop-blur-xl rounded-3xl border border-red-200 p-6 md:p-8 shadow-md hover:shadow-lg hover:bg-red-100/90 transition-all flex items-center space-x-6 relative group cursor-pointer" onClick={handleProtectedAction}>
              {!isLoggedIn && <div className="absolute inset-0 z-10"></div>}
              <div className="flex flex-col min-w-[120px]">
                <span className="text-5xl font-black text-red-500 leading-none">{String(stats.overdueTasks).padStart(2, "0")}</span>
                <span className="text-red-400 font-bold text-sm mt-1 uppercase tracking-wider">Tugas Terlewat</span>
              </div>
              <p className="text-red-600 font-medium text-sm md:text-base border-l-2 border-red-300 pl-6 py-2">
                Terdapat beberapa tugas yang melewati batas waktu pengerjaan.
              </p>
            </article>

          </section>
          {/* END: Statistics Section */}

        </div>
      </main>
      {/* END: Main Content Area */}

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
      
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}