import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ProjectCard = () => (
  <article className="bg-[var(--color-card)] rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden transition-transform hover:-translate-y-1">
    <div className="flex justify-between items-start mb-4">
      <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      </div>
      <span className="bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Aktif</span>
    </div>
    
    <h3 className="text-xl font-bold mb-2 leading-tight">Sistem Monitoring<br />Jaringan</h3>
    <p className="text-sm text-[var(--color-textMuted)] mb-6 flex-1">Pengembangan aplikasi internal untuk memantau trafik data antar kantor cabang.</p>
    
    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
      <div className="flex -space-x-2">
        <div className="w-8 h-8 rounded-full border-2 border-white bg-[var(--color-avatarBg1)]"></div>
        <div className="w-8 h-8 rounded-full border-2 border-white bg-[var(--color-avatarBg2)]"></div>
        <div className="w-8 h-8 rounded-full border-2 border-white bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">S</div>
      </div>
      <Link className="text-[var(--color-primary)] font-medium flex items-center gap-1 hover:underline text-sm" to="/board">
        Kelola Board
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      </Link>
    </div>
  </article>
);

export default function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface-projects)] text-[var(--color-textMain)] font-sans relative">
      
      {/* BEGIN: Header (Full Width to match Dashboard) */}
      <nav className="bg-white shadow-sm px-6 lg:px-12 py-4 flex items-center justify-between w-full mb-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          <h1 className="font-bold text-xl">Kanbanflow</h1>
        </div>
        
        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          <Link className="text-[var(--color-textMuted)] hover:text-[var(--color-textMain)] transition-colors" to="/dashboard">Beranda</Link>
          <Link className="text-[var(--color-primary)]" to="/projects">Proyek Tim</Link>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-full transition-colors">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <span className="font-medium hidden sm:block">Safira Zahra Asshifa</span>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </div>
      </nav>
      {/* END: Header */}

      {/* BEGIN: Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 pb-12">
        {/* Page Title & Description */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">Direktori Proyek Aktif</h2>
          <p className="text-[var(--color-textMuted)] max-w-2xl mx-auto">Kelola semua proyek dari berbagai sumber dalam satu dashboar terintegrasi.</p>
        </div>
        
        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCard />
          <ProjectCard />
          <ProjectCard />
          <ProjectCard />
          <ProjectCard />
          <ProjectCard />
        </div>
      </main>
      {/* END: Main Content */}

      {/* BEGIN: Floating Action Button */}
      <button 
        aria-label="Add new project" 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-black text-[var(--color-primary)] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      </button>
      {/* END: Floating Action Button */}

      {/* BEGIN: Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p className="font-medium text-slate-600">&copy; 2026 Kanbanflow. All rights reserved.</p>
          <div className="flex flex-wrap justify-center space-x-6 mt-4 md:mt-0 font-medium">
            <Link to="/projects" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</Link>
            <Link to="/projects" className="hover:text-[var(--color-primary)] transition-colors">Terms of Service</Link>
            <Link to="/projects" className="hover:text-[var(--color-primary)] transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
      {/* END: Footer */}

      {/* BEGIN: Modal Overlay */}
      {isModalOpen && (
        <div aria-labelledby="modal-title" aria-modal="true" className="fixed inset-0 bg-slate-400/50 backdrop-blur-sm z-50 flex justify-center items-center" role="dialog">
          {/* BEGIN: Modal Content */}
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 relative m-4">
            {/* Close Button */}
            <button 
              aria-label="Close modal" 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
            
            {/* Modal Header */}
            <div className="mb-8 border-b border-[var(--color-outline-variant)] pb-6">
              <h2 className="text-2xl font-bold mb-2" id="modal-title">Buat Proyek Baru</h2>
              <p className="text-[var(--color-on-surface-variant)] text-sm text-gray-600">Kelola semua proyek baru dan tugas anda disini.</p>
            </div>
            
            {/* Form Section */}
            <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); navigate('/board'); }}>
              {/* Project Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="projectName">Nama Proyek</label>
                <input 
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm placeholder-gray-400" 
                  id="projectName" 
                  name="projectName" 
                  placeholder="Contoh : Website Lelangin Indonesia" 
                  type="text" 
                  required
                />
              </div>
              
              {/* Project Description Textarea */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="projectDescription">Deskripsi</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm placeholder-gray-400 resize-none" 
                  id="projectDescription" 
                  name="projectDescription" 
                  placeholder="Jelaskan tujuan dan deskripsi proyek" 
                  rows="4"
                  required
                ></textarea>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-6 rounded-full border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200" 
                  type="button"
                >
                  Kembali
                </button>
                <button 
                  className="flex-1 py-3 px-6 rounded-full bg-[var(--color-primary)] text-white font-semibold hover:bg-opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2" 
                  type="submit"
                >
                  Simpan Proyek
                </button>
              </div>
            </form>
          </div>
          {/* END: Modal Content */}
        </div>
      )}
      {/* END: Modal Overlay */}
    </div>
  );
}
