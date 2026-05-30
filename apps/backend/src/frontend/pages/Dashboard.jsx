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

      <SharedNavbar />

      <main className="relative z-10 flex-grow w-full max-w-[1200px] mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col justify-center">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 w-full">
          
          {/* BEGIN: Hero Section */}
          <section className="w-full lg:w-[55%] flex flex-col py-4">
            
            <div className="mb-16 relative z-10">
              <h1 className="text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1.2] text-slate-900 tracking-tight">
                Kelola Pekerjaan<br />
                <span className="relative inline-block">
                  Menjadi Lebih Efisien
                  <svg className="absolute -bottom-[63px] left-0 w-full text-teal-200 -z-10" viewBox="0 0 400 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0,20 Q180,45 390,5 L375,0 M390,5 L385,15" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </h1>
            </div>
            
            <div className="flex flex-col gap-8">
              <p className="text-slate-600 text-base md:text-[17px] max-w-[500px] leading-relaxed font-medium">
                Tinggalkan kebingungan dalam memantau proyek. KanbanFlow membantu Anda memvisualisasikan alur kerja, melacak status tugas, dan berkolaborasi dalam satu papan digital yang terorganisir.
              </p>
              <div>
                <Link href="/projects" className="inline-flex items-center justify-center bg-[#2ecfb4] hover:bg-[#25b59d] border border-transparent text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-[0_4px_14px_rgba(46,207,180,0.4)] hover:shadow-[0_6px_20px_rgba(46,207,180,0.6)] transform hover:-translate-y-0.5 text-[15px]">
                  Lihat Proyek <span className="ml-2 text-lg leading-none">➔</span>
                </Link>
              </div>
            </div>

          </section>
          {/* END: Hero Section */}

          {/* BEGIN: Statistics Section (Unified Bento Box) */}
          <section className="w-full lg:w-[40%] flex justify-center lg:justify-end">
            <div 
              className="w-full max-w-[360px] bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden group/panel cursor-pointer hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1"
              onClick={handleProtectedAction}
            >
              {!isLoggedIn && <div className="absolute inset-0 z-10"></div>}
              
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2ecfb4] rounded-full blur-[80px] opacity-[0.07] pointer-events-none transition-opacity duration-500 group-hover/panel:opacity-[0.15]"></div>
              
              <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-8">Ringkasan Aktivitas</h3>

              <div className="flex flex-col space-y-6">
                
                {/* Stat 1 */}
                <div className="flex items-center justify-between group/stat">
                  <div className="flex items-center space-x-4">
                    <div className="w-[48px] h-[48px] bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-[#2ecfb4] group-hover/stat:scale-110 group-hover/stat:border-[#2ecfb4]/30 group-hover/stat:bg-[#2ecfb4]/10 transition-all duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span className="text-slate-600 font-semibold text-[15px]">Tugas Selesai</span>
                  </div>
                  <span className="text-3xl font-bold text-slate-800">{String(stats.completedTasks).padStart(2, "0")}</span>
                </div>

                <hr className="border-slate-100" />

                {/* Stat 2 */}
                <div className="flex items-center justify-between group/stat">
                  <div className="flex items-center space-x-4">
                    <div className="w-[48px] h-[48px] bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-[#2ecfb4] group-hover/stat:scale-110 group-hover/stat:border-[#2ecfb4]/30 group-hover/stat:bg-[#2ecfb4]/10 transition-all duration-300">
                      <svg className="w-5 h-5 transform rotate-45 -translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </div>
                    <span className="text-slate-600 font-semibold text-[15px]">Proyek Aktif</span>
                  </div>
                  <span className="text-3xl font-bold text-slate-800">{String(stats.activeProjects).padStart(2, "0")}</span>
                </div>

                <hr className="border-slate-100" />

                {/* Stat 3 */}
                <div className="flex items-center justify-between group/stat">
                  <div className="flex items-center space-x-4">
                    <div className="w-[48px] h-[48px] bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-red-500 group-hover/stat:scale-110 group-hover/stat:border-red-200 group-hover/stat:bg-red-50 transition-all duration-300">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm1 16h-2v-2h2v2zm0-4h-2V9h2v5z"/></svg>
                    </div>
                    <span className="text-red-400 font-semibold text-[15px]">Tugas Terlewat</span>
                  </div>
                  <span className="text-3xl font-bold text-red-500">{String(stats.overdueTasks).padStart(2, "0")}</span>
                </div>

              </div>
            </div>
          </section>
          {/* END: Statistics Section */}

        </div>
      </main>
      {/* END: Main Content Area */}

      {/* BEGIN: Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6">
        <div className="max-w-[1200px] w-full mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p className="font-semibold mb-4 md:mb-0">&copy; 2026 Kanbanflow. All rights reserved.</p>
          <div className="flex flex-wrap justify-center space-x-8 font-semibold">
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