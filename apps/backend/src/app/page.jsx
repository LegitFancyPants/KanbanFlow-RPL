"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is already logged in by looking for the token in localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // If they have a token, they are still logged in, so send them to their dashboard
      router.push('/dashboard');
    } else {
      // If there is no token, they need to log in first
      router.push('/login');
    }
  }, [router]);

  // Optionally return a subtle loading state while checking
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-slate-400 font-medium">Memuat...</div>
    </div>
  );
}