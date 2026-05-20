import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="bg-[var(--color-surface)] text-slate-800 font-sans min-h-screen flex flex-col">
      {/* BEGIN: Navigation Bar (Full Width) */}
      <nav className="bg-white shadow-sm px-6 lg:px-12 py-4 flex items-center justify-between w-full">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
          </div>
          <span className="font-bold text-xl text-slate-900">Kanbanflow</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link className="text-[var(--color-teal-400)] font-semibold hover:text-[var(--color-teal-500)] transition-colors" to="/dashboard">Beranda</Link>
          <Link className="text-slate-600 font-medium hover:text-[var(--color-teal-400)] transition-colors" to="/projects">Proyek Tim</Link>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-full transition-colors">
          <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
          <span className="text-sm font-semibold text-slate-700 hidden sm:block">Safira Zahra Asshifa <span className="text-slate-400 ml-1">▼</span></span>
        </div>
      </nav>
      {/* END: Navigation Bar */}

      {/* BEGIN: Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          
          {/* BEGIN: Hero Section */}
          <section className="lg:col-span-6 xl:col-span-5 flex">
            <div className="bg-[image:var(--background-image-teal-gradient)] rounded-[2rem] p-8 md:p-10 flex flex-col justify-between w-full shadow-lg text-white">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-slate-900">
                  Alur Kerja Lebih<br />Terukur dan Presisi
                </h1>
                <p className="text-white/90 text-lg md:text-xl font-medium max-w-md mt-4">
                  Selamat datang kembali, Safira. Kamu memiliki 2 tugas prioritas tinggi yang perlu ditinjau.
                </p>
              </div>
              <div className="mt-12 lg:mt-16">
                <Link to="/projects" className="inline-block bg-[var(--color-teal-700)] hover:bg-[var(--color-teal-600)] text-white px-8 py-4 rounded-full font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-lg">
                  Lihat Proyek Tim
                </Link>
              </div>
            </div>
          </section>
          {/* END: Hero Section */}

          {/* BEGIN: Statistics Section */}
          <section className="lg:col-span-6 xl:col-span-7 flex flex-col space-y-6 justify-center">
            
            {/* Stat Card 1 */}
            <article className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-6">
              <div className="flex flex-col min-w-[120px]">
                <span className="text-5xl font-black text-slate-900 leading-none">21</span>
                <span className="text-slate-400 font-semibold text-sm mt-1 uppercase tracking-wider">Tugas Selesai</span>
              </div>
              <p className="text-slate-500 font-medium text-sm md:text-base border-l-2 border-slate-100 pl-6 py-2">
                Tugas yang telah diselesaikan terus meningkat setiap harinya.
              </p>
            </article>

            {/* Stat Card 2 */}
            <article className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-6">
              <div className="flex flex-col min-w-[120px]">
                <span className="text-5xl font-black text-slate-900 leading-none">03</span>
                <span className="text-slate-400 font-semibold text-sm mt-1 uppercase tracking-wider">Proyek Aktif</span>
              </div>
              <p className="text-slate-500 font-medium text-sm md:text-base border-l-2 border-slate-100 pl-6 py-2">
                Pantau perkembangan seluruh proyek aktif secara real-time.
              </p>
            </article>

            {/* Stat Card 3 (Warning) */}
            <article className="bg-[var(--color-coral-100)] rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-6">
              <div className="flex flex-col min-w-[120px]">
                <span className="text-5xl font-black text-white leading-none drop-shadow-sm">02</span>
                <span className="text-white/80 font-bold text-sm mt-1 uppercase tracking-wider">Tugas Terlewat</span>
              </div>
              <p className="text-white/90 font-medium text-sm md:text-base border-l-2 border-white/30 pl-6 py-2">
                Terdapat beberapa tugas yang melewati batas waktu pengerjaan.
              </p>
            </article>

          </section>
          {/* END: Statistics Section */}

        </div>
      </main>
      {/* END: Main Content Area */}

      {/* BEGIN: Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p className="font-medium text-slate-600">&copy; 2026 Kanbanflow. All rights reserved.</p>
          <div className="flex flex-wrap justify-center space-x-6 mt-4 md:mt-0 font-medium">
            <Link to="/dashboard" className="hover:text-[var(--color-teal-500)] transition-colors">Privacy Policy</Link>
            <Link to="/dashboard" className="hover:text-[var(--color-teal-500)] transition-colors">Terms of Service</Link>
            <Link to="/dashboard" className="hover:text-[var(--color-teal-500)] transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
      {/* END: Footer */}
    </div>
  );
}
