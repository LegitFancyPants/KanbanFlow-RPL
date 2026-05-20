import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Board() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isManageTaskModalOpen, setIsManageTaskModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-board-bg)] text-slate-800 font-sans flex flex-col">
      {/* BEGIN: Header (Full Width to match others) */}
      <nav className="bg-white shadow-sm px-6 lg:px-12 py-4 flex flex-col md:flex-row items-center justify-between w-full mb-8">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="bg-slate-200 w-12 h-12 rounded-full flex items-center justify-center text-slate-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Kanbanflow</h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex space-x-8 mb-4 md:mb-0 font-semibold text-lg">
          <Link className="text-slate-600 hover:text-slate-900 transition-colors" to="/dashboard">Beranda</Link>
          <Link className="text-[var(--color-primary)] hover:text-teal-500 transition-colors" to="/projects">Proyek Tim</Link>
        </nav>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-full transition-colors">
          <div className="bg-slate-300 w-8 h-8 rounded-full"></div>
          <span className="font-semibold text-slate-700 hidden sm:block">Safira Zahra Asshifa</span>
          <svg className="h-4 w-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path clipRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" fillRule="evenodd"></path>
          </svg>
        </div>
      </nav>
      {/* END: Header */}

      {/* BEGIN: Main Content Area */}
      <main className="max-w-[1600px] mx-auto w-full px-4 md:px-8 flex-1 flex flex-col">
        {/* BEGIN: Project Header */}
        <section className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-slate-300 pb-4">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-3xl font-extrabold mb-1">Sistem Monitoring Jaringan</h2>
            <p className="text-slate-600 text-sm">Pengembangan aplikasi internal untuk memantau trafik data antar kantor cabang.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsTeamModalOpen(true)} className="font-bold text-slate-700 text-sm hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
              Anggota Tim
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full border-2 border-white bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px] font-bold">SZ</div>
                <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">NG</div>
                <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">RN</div>
              </div>
            </button>
            <button className="bg-[var(--color-primary)] text-white font-semibold py-2 px-4 rounded-full flex items-center space-x-1 hover:bg-teal-500 transition-colors shadow-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              <span>Hapus</span>
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-[var(--color-primary)] text-white font-semibold py-2 px-5 rounded-full flex items-center space-x-1 hover:bg-teal-500 transition-colors shadow-sm">
              <span className="text-xl leading-none mr-1">+</span>
              <span>Tambah Kartu</span>
            </button>
          </div>
        </section>
        {/* END: Project Header */}

        {/* BEGIN: Kanban Board Container */}
        <section className="gap-6 pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 flex-1">
          {/* BEGIN: Column TO-DO */}
          <div className="bg-white rounded-[32px] p-6 flex-1 shadow-sm border border-slate-100 flex flex-col h-full min-w-0">
            <h3 className="text-center font-extrabold text-lg tracking-wide border-b-2 border-slate-800 pb-2 mb-6 uppercase">TO - DO</h3>
            <div className="space-y-4 flex-1">
              {[1, 2, 3].map((item) => (
                <div key={item} onClick={() => setIsManageTaskModalOpen(true)} className="border-2 border-[var(--color-primary)] rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-bold text-slate-800 mb-6">Finalisasi ERD Database</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Deadline : 24 - 11 - 2024</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                      <span className="text-slate-600 font-medium">Safira</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* END: Column TO-DO */}

          {/* BEGIN: Column DOING */}
          <div className="bg-white rounded-[32px] p-6 flex-1 shadow-sm border border-slate-100 flex flex-col h-full min-w-0">
            <h3 className="text-center font-extrabold text-lg tracking-wide border-b-2 border-slate-800 pb-2 mb-6 uppercase">DOING</h3>
            <div className="space-y-4 flex-1">
              {[1, 2, 3].map((item) => (
                <div key={item} onClick={() => setIsManageTaskModalOpen(true)} className="border-2 border-[var(--color-primary)] rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-bold text-slate-800 mb-6">Finalisasi ERD Database</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Deadline : 24 - 11 - 2024</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                      <span className="text-slate-600 font-medium">Safira</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* END: Column DOING */}

          {/* BEGIN: Column DONE */}
          <div className="bg-white rounded-[32px] p-6 flex-1 shadow-sm border border-slate-100 flex flex-col h-full min-w-0">
            <h3 className="text-center font-extrabold text-lg tracking-wide border-b-2 border-slate-800 pb-2 mb-6 uppercase">DONE</h3>
            <div className="space-y-4 flex-1">
              {[1, 2, 3].map((item) => (
                <div key={item} onClick={() => setIsManageTaskModalOpen(true)} className="border-2 border-[var(--color-primary)] rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-bold text-slate-800 mb-6">Finalisasi ERD Database</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Deadline : 24 - 11 - 2024</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                      <span className="text-slate-600 font-medium">Safira</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* END: Column DONE */}

          {/* BEGIN: Column OVERDUE */}
          <div className="bg-[var(--color-overdue-container)] rounded-[32px] p-6 flex-1 shadow-sm flex flex-col h-full min-w-0">
            <h3 className="text-center font-extrabold text-lg tracking-wide border-b-2 border-red-800/20 text-red-800 pb-2 mb-6 uppercase">OVERDUE</h3>
            <div className="space-y-4 flex-1">
              {[1, 2, 3].map((item) => (
                <div key={item} onClick={() => setIsManageTaskModalOpen(true)} className="bg-[var(--color-overdue-card)] rounded-xl p-4 shadow-sm text-white hover:shadow-md transition-shadow border border-white/20 cursor-pointer">
                  <h4 className="font-bold mb-6">Finalisasi ERD Database</h4>
                  <div className="flex justify-between items-center text-xs text-white/90">
                    <span>Deadline : 24 - 11 - 2024</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-white/50 rounded-full"></div>
                      <span className="font-medium">Safira</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* END: Column OVERDUE */}
        </section>
        {/* END: Kanban Board Container */}
      </main>
      {/* END: Main Content Area */}

      {/* BEGIN: Modal Overlay */}
      {isModalOpen && (
        <div aria-labelledby="modal-title" aria-modal="true" className="fixed inset-0 bg-slate-400/50 backdrop-blur-sm z-50 flex justify-center items-center" role="dialog">
          {/* BEGIN: Modal Content */}
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8 relative m-4">
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
              <h2 className="text-2xl font-bold mb-2" id="modal-title">Tambah Kartu Tugas</h2>
              <p className="text-[var(--color-on-surface-variant)] text-sm text-gray-600">Tambah tugas baru dan kelola kartu tugas</p>
            </div>
            
            {/* Form Section */}
            <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Left Column */}
                <div className="flex flex-col gap-6">
                  {/* Task Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="taskName">Nama Tugas</label>
                    <input 
                      className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm placeholder-gray-400" 
                      id="taskName" 
                      name="taskName" 
                      type="text" 
                      required
                    />
                  </div>
                  
                  {/* Task Description */}
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="taskDescription">Deskripsi</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm placeholder-gray-400 resize-none flex-1 min-h-[120px]" 
                      id="taskDescription" 
                      name="taskDescription" 
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">
                  {/* Assignee */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="assignee">Ditugaskan Ke</label>
                    <div className="relative">
                      <select 
                        className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm placeholder-gray-400 appearance-none bg-white" 
                        id="assignee" 
                        name="assignee"
                      >
                        <option value="" disabled selected hidden>Pilih User</option>
                        <option value="safira">Safira Zahra Asshifa</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="deadline">Batas Waktu</label>
                    <div className="relative">
                      <input 
                        className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm placeholder-gray-400" 
                        id="deadline" 
                        name="deadline" 
                        type="date" 
                        required
                      />
                    </div>
                  </div>

                  {/* Initial Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="initialStatus">Status Awal</label>
                    <div className="relative">
                      <select 
                        className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm placeholder-gray-400 appearance-none bg-white" 
                        id="initialStatus" 
                        name="initialStatus"
                      >
                        <option value="todo">TO - DO</option>
                        <option value="doing">DOING</option>
                        <option value="done">DONE</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center mt-8">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-40 py-3 px-6 rounded-full border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200" 
                  type="button"
                >
                  Batal
                </button>
                <button 
                  className="w-full sm:w-40 py-3 px-6 rounded-full bg-[var(--color-primary)] text-white font-semibold hover:bg-opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2" 
                  type="submit"
                >
                  Simpan Kartu
                </button>
              </div>
            </form>
          </div>
          {/* END: Modal Content */}
        </div>
      )}
      {/* BEGIN: Team Modal Overlay */}
      {isTeamModalOpen && (
        <div aria-labelledby="team-modal-title" aria-modal="true" className="fixed inset-0 bg-slate-400/50 backdrop-blur-sm z-50 flex justify-center items-center" role="dialog">
          {/* BEGIN: Team Modal Content */}
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-[600px] flex flex-col overflow-hidden relative m-4 max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1" id="team-modal-title">Anggota Tim</h2>
                <p className="text-sm text-gray-600">Daftar anggota tim yang bergabung ke dalam proyek</p>
              </div>
              <button 
                aria-label="Close modal" 
                onClick={() => setIsTeamModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
            </div>
            
            {/* Modal Content (Member List) */}
            <div className="p-6 flex-1 overflow-y-auto">
              <ul className="flex flex-col gap-4">
                {/* Member 1 (Owner) */}
                <li className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
                      SZ
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Safira Zahra Asshifa</h3>
                      <p className="text-sm text-gray-500">safirazzahra@gmail.com</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-full">Pemilik</span>
                </li>
                {/* Member 2 */}
                <li className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold">
                      NG
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Nugroho Gathfan Rajendra</h3>
                      <p className="text-sm text-gray-500">gartrarajendra@gmail.com</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">Anggota</span>
                </li>
                {/* Member 3 */}
                <li className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold">
                      RN
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Rafli Nurul Huda</h3>
                      <p className="text-sm text-gray-500">rafinurul@gmail.com</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">Anggota</span>
                </li>
              </ul>
            </div>
            
            {/* Modal Footer (Invite) */}
            <div className="p-6 bg-white border-t border-gray-200">
              <label className="block text-sm font-semibold text-gray-900 mb-3" htmlFor="invite-email">Undang Anggota Baru :</label>
              <form className="flex gap-4" onSubmit={(e) => { e.preventDefault(); /* mock invite */ }}>
                <input 
                  className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow" 
                  id="invite-email" 
                  placeholder="Masukkan Email" 
                  type="email" 
                  required
                />
                <button 
                  type="submit"
                  className="bg-[var(--color-primary)] hover:bg-teal-500 text-white font-semibold text-sm px-6 py-2 rounded-full transition-colors flex items-center justify-center whitespace-nowrap shadow-sm"
                >
                  Undang
                </button>
              </form>
            </div>
          </div>
          {/* END: Team Modal Content */}
        </div>
      )}
      {/* END: Team Modal Overlay */}

      {/* BEGIN: Manage Task Modal Overlay */}
      {isManageTaskModalOpen && (
        <div aria-labelledby="manage-modal-title" aria-modal="true" className="fixed inset-0 bg-slate-400/50 backdrop-blur-sm z-50 flex justify-center items-center" role="dialog">
          {/* BEGIN: Manage Task Modal Content */}
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden relative m-4 max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-200 relative">
              <h2 className="text-[28px] leading-tight font-bold text-gray-900 mb-1" id="manage-modal-title">Kartu Tugas</h2>
              <p className="text-base text-gray-600">Kelola Kartu Tugas Anda.</p>
              {/* Close Button */}
              <button 
                aria-label="Close modal" 
                onClick={() => setIsManageTaskModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" x2="6" y1="6" y2="18"></line>
                  <line x1="6" x2="18" y1="6" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {/* Form Section */}
            <div className="p-8 overflow-y-auto flex-1">
              <form id="manage-task-form" onSubmit={(e) => { e.preventDefault(); setIsManageTaskModalOpen(false); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Left Column */}
                  <div className="flex flex-col gap-6">
                    {/* Task Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="manage-taskName">Nama Tugas</label>
                      <input 
                        className="w-full px-5 py-3 rounded-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm placeholder-gray-400 bg-transparent" 
                        id="manage-taskName" 
                        name="taskName" 
                        type="text" 
                        defaultValue="Finalisasi ERD Database"
                        required
                      />
                    </div>
                    
                    {/* Task Description */}
                    <div className="flex-1 flex flex-col">
                      <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="manage-taskDescription">Deskripsi</label>
                      <textarea 
                        className="w-full px-5 py-3 rounded-3xl border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm placeholder-gray-400 resize-y flex-1 min-h-[120px] bg-transparent" 
                        id="manage-taskDescription" 
                        name="taskDescription" 
                        defaultValue="Melakukan uji testing apakah database sudah aman dan berjalan sesuai fungsinya."
                        required
                      ></textarea>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col gap-6">
                    {/* Assignee */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="manage-assignee">Ditugaskan Ke</label>
                      <div className="relative">
                        <select 
                          className="w-full px-5 py-3 rounded-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm bg-transparent appearance-none" 
                          id="manage-assignee" 
                          name="assignee"
                          defaultValue="safira"
                        >
                          <option value="safira">Safira</option>
                          <option value="budi">Budi</option>
                          <option value="siti">Siti</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>

                    {/* Deadline */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="manage-deadline">Deadline</label>
                      <div className="relative">
                        <input 
                          className="w-full px-5 py-3 rounded-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm bg-transparent" 
                          id="manage-deadline" 
                          name="deadline" 
                          type="date" 
                          defaultValue="2026-11-24"
                          required
                        />
                      </div>
                    </div>

                    {/* Initial Status */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="manage-status">Status Awal</label>
                      <div className="relative">
                        <select 
                          className="w-full px-5 py-3 rounded-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm bg-transparent appearance-none" 
                          id="manage-status" 
                          name="status"
                          defaultValue="todo"
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-gray-200 flex justify-end items-center gap-6">
              <button 
                type="button"
                className="text-[var(--color-primary)] font-semibold hover:text-teal-600 transition-colors px-2 py-2"
              >
                Edit
              </button>
              <button 
                type="submit"
                form="manage-task-form"
                className="bg-[var(--color-primary)] hover:bg-teal-500 text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-sm"
              >
                Simpan
              </button>
            </div>
          </div>
          {/* END: Manage Task Modal Content */}
        </div>
      )}
      {/* END: Manage Task Modal Overlay */}
    </div>
  );
}
