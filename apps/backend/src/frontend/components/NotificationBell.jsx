"use client";
import React, { useState, useEffect } from 'react';

export default function NotificationBell() {
  const [invites, setInvites] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchInvites() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/invitations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvites(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInvites();
  }, []);

  async function handleResponse(id, action) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/invitations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        // Remove from list and potentially trigger a refresh
        setInvites(invites.filter(i => i.id_invitation !== id));
        if (action === 'accept') {
          // Optional: reload the page to show the new project in the list
          window.location.reload();
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal memproses undangan');
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="relative mr-4">
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-[var(--color-primary)] transition-colors rounded-full hover:bg-gray-100"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {invites.length > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Notifikasi</h3>
            <span className="text-xs bg-[var(--color-primary)] text-white px-2 py-0.5 rounded-full">{invites.length} Baru</span>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-sm">Memuat...</div>
            ) : invites.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">Tidak ada undangan baru</div>
            ) : (
              invites.map(inv => (
                <div key={inv.id_invitation} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <p className="text-sm text-gray-800 mb-2">
                    <span className="font-semibold">{inv.inviter_name}</span> mengundang Anda sebagai <span className="font-semibold text-[var(--color-primary)]">{inv.role === 'member' ? 'Anggota' : 'Penonton'}</span> di proyek <span className="font-semibold">{inv.project_name}</span>
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => handleResponse(inv.id_invitation, 'accept')}
                      className="flex-1 bg-[var(--color-primary)] text-white text-xs font-semibold py-1.5 rounded-full hover:bg-teal-500 transition-colors"
                    >
                      Terima
                    </button>
                    <button 
                      onClick={() => handleResponse(inv.id_invitation, 'reject')}
                      className="flex-1 bg-gray-100 text-gray-600 text-xs font-semibold py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
