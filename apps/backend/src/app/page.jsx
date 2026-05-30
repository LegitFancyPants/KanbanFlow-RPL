"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Both logged-in and unlogged-in users go to the dashboard now
    router.push('/dashboard');
  }, [router]);

  // Optionally return a subtle loading state while checking
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-slate-400 font-medium">Memuat...</div>
    </div>
  );
}