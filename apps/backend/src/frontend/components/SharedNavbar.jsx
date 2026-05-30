"use client";
import React, { useState, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import NotificationBell from "@/frontend/components/NotificationBell";
import { getUser, clearAuth, getToken } from "@/frontend/utils/auth";

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function SharedNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize auth state safely on the client
  useEffect(() => {
    setUser(getUser());
    setIsLoggedIn(!!getToken());
  }, []);

  const username = user.username || 'Pengunjung';

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  // ── Sliding Indicator Logic ──
  const [activeIndex, setActiveIndex] = useState(null); // start null to prevent SSR mismatch
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Determine the true active index based on current path
    let targetIndex = -1;
    if (pathname.startsWith('/dashboard')) targetIndex = 0;
    else if (pathname.startsWith('/projects') || pathname.startsWith('/board')) targetIndex = 1;

    if (targetIndex === -1) {
      setActiveIndex(-1);
      return;
    }

    // FAKE TRANSITION TRICK:
    const prevIndexStr = sessionStorage.getItem('navIndicatorIndex');
    const prevIndex = prevIndexStr !== null ? parseInt(prevIndexStr, 10) : targetIndex;
    
    // If we came from a different index, render that first without animation, then animate
    if (prevIndex !== targetIndex && prevIndex !== -1) {
      setIsAnimating(false);
      setActiveIndex(prevIndex);
      
      // Request animation frame ensures the initial 'old' position is rendered to the DOM
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
          setActiveIndex(targetIndex);
          sessionStorage.setItem('navIndicatorIndex', targetIndex);
        });
      });
    } else {
      // Just set it directly if no transition needed
      setIsAnimating(true);
      setActiveIndex(targetIndex);
      sessionStorage.setItem('navIndicatorIndex', targetIndex);
    }
  }, [pathname]);

  // If we are on a page with no active tab (like login), we don't show the indicator
  const showTabs = pathname.startsWith('/dashboard') || pathname.startsWith('/projects') || pathname.startsWith('/board');

  return (
    <nav className="relative z-[60] px-6 lg:px-12 py-4 flex flex-col md:flex-row items-center justify-between w-full">
      <div className="flex items-center justify-between md:justify-start w-full md:w-1/3 mb-4 md:mb-0">
        <img src="/logo.png" alt="KanbanFlow Logo" className="h-10 w-auto object-contain" />
      </div>

      {/* Centered symmetrically - Only show tabs on protected pages */}
      <div className="w-full md:w-1/3 flex justify-center mb-4 md:mb-0">
        {showTabs && (
          <div className="relative flex items-center h-10">
            {/* Sliding Indicator Block */}
            {activeIndex !== -1 && activeIndex !== null && (
              <div 
                className={`absolute bottom-0 h-[2px] bg-[var(--color-primary)] ${isAnimating ? 'transition-transform duration-300 ease-in-out' : ''}`}
                style={{
                  width: '100px',
                  transform: `translateX(${activeIndex * 100}%)`
                }}
              />
            )}
            
            <Link 
              className={`w-[100px] relative z-10 text-center font-semibold text-[15px] transition-colors duration-300 ${activeIndex === 0 ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`} 
              href="/dashboard"
            >
              Beranda
            </Link>
            <Link 
              className={`w-[100px] relative z-10 text-center font-semibold text-[15px] transition-colors duration-300 ${activeIndex === 1 ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`} 
              href="/projects"
            >
              Proyek Tim
            </Link>
          </div>
        )}
      </div>

      {/* User Profile / Login */}
      <div className="flex items-center justify-end w-full md:w-1/3 gap-2">
        {isLoggedIn ? (
          <>
            <div className="mr-2">
              <NotificationBell />
            </div>
            <div className="relative">
              <div
                className={`flex items-center space-x-3 cursor-pointer backdrop-blur-md border border-white/50 px-3 py-1.5 transition-colors shadow-sm ${
                  dropdownOpen ? 'bg-white/90 rounded-t-2xl rounded-b-none border-b-0 pb-[7px]' : 'bg-white/60 hover:bg-white/80 rounded-full'
                }`}
                onClick={() => setDropdownOpen(o => !o)}
              >
                <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xs font-bold border border-white/40 shadow-sm">
                  {getInitials(username)}
                </div>
                <span className="text-sm font-bold text-slate-800 hidden sm:block">{username} <span className="text-slate-500 ml-1">▼</span></span>
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 top-full w-full bg-white/90 backdrop-blur-xl rounded-b-2xl shadow-xl border border-white/50 border-t-0 overflow-hidden z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm text-red-500 font-bold hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="relative">
             <Link href="/login" className="flex items-center space-x-3 bg-white/60 hover:bg-white/80 backdrop-blur-md border border-white/50 px-8 py-1.5 rounded-full transition-colors text-slate-800 font-bold text-sm shadow-sm text-center justify-center">
                Login
             </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
