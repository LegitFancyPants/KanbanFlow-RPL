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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <nav className="relative z-[60] px-6 lg:px-12 py-4 w-full">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center justify-start w-1/2 md:w-1/3">
          <img src="/logo.png" alt="KanbanFlow Logo" className="h-10 w-auto object-contain" />
        </div>

        {/* Hamburger Icon for Mobile */}
        <div className="flex md:hidden items-center justify-end w-1/2">
          {isLoggedIn && (
            <div className="mr-4">
              <NotificationBell />
            </div>
          )}
          <button 
            className="text-slate-600 focus:outline-none p-2 rounded-lg bg-slate-50 border border-slate-200" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              ) : (
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              )}
            </svg>
          </button>
        </div>

        {/* Centered symmetrically - Desktop Only */}
        <div className="hidden md:flex w-1/3 justify-center">
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
        </div>

        {/* User Profile / Login - Desktop Only */}
        <div className="hidden md:flex items-center justify-end w-1/3 gap-2">
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
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col mt-4 bg-white/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-100 shadow-lg space-y-4">
          <Link href="/dashboard" className={`font-semibold px-4 py-2 rounded-xl transition-colors ${pathname.startsWith('/dashboard') ? 'bg-[#2ecfb4]/10 text-[#2ecfb4]' : 'text-slate-600 hover:bg-slate-50'}`}>
            Beranda
          </Link>
          <Link href="/projects" className={`font-semibold px-4 py-2 rounded-xl transition-colors ${pathname.startsWith('/projects') || pathname.startsWith('/board') ? 'bg-[#2ecfb4]/10 text-[#2ecfb4]' : 'text-slate-600 hover:bg-slate-50'}`}>
            Proyek Tim
          </Link>
          
          <div className="border-t border-slate-100 pt-4 mt-2">
            {isLoggedIn ? (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {getInitials(username)}
                  </div>
                  <span className="font-bold text-slate-800">{username}</span>
                </div>
                <button onClick={handleLogout} className="text-red-500 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl">
                  Keluar
                </button>
              </div>
            ) : (
              <Link href="/login" className="block text-center w-full bg-[#2ecfb4] text-white font-bold py-3 rounded-xl shadow-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
