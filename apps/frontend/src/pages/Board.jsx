import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

function authHeaders() {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDeadline(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')} - ${String(d.getMonth() + 1).padStart(2, '0')} - ${d.getFullYear()}`;
}

function toInputDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
}

const STATUS_COLS = ['to do', 'doing', 'done', 'overdue'];
const STATUS_LABELS = { 'to do': 'TO - DO', doing: 'DOING', done: 'DONE', overdue: 'OVERDUE' };

// ── TaskCard ─────────────────────────────────────────────────────────────────
function TaskCard({ task, isOverdue, onClick }) {
  if (isOverdue) {
    return (
      <div
        onClick={onClick}
        className="bg-[var(--color-overdue-card)] rounded-xl p-4 shadow-sm text-white hover:shadow-md transition-shadow border border-white/20 cursor-pointer"
      >
        <h4 className="font-bold mb-6">{task.name}</h4>
        <div className="flex justify-between items-center text-xs text-white/90">
          <span>Deadline : {formatDeadline(task.deadline)}</span>
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 bg-white/50 rounded-full flex items-center justify-center text-[9px] font-bold text-red-700">
              {getInitials(task.username)}
            </div>
            <span className="font-medium">{task.username}</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      onClick={onClick}
      className="border-2 border-[var(--color-primary)] rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <h4 className="font-bold text-slate-800 mb-6">{task.name}</h4>
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-500">Deadline : {formatDeadline(task.deadline)}</span>
        <div className="flex items-center space-x-1">
          <div className="w-5 h-5 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-[9px] font-bold text-white">
            {getInitials(task.username)}
          </div>
          <span className="text-slate-600 font-medium">{task.username}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Board ────────────────────────────────────────────────────────────────
export default function Board() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [project, setProject]   = useState(null);
  const [tasks, setTasks]       = useState([]);
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Modal state
  const [isModalOpen,           setIsModalOpen]           = useState(false);
  const [isTeamModalOpen,       setIsTeamModalOpen]       = useState(false);
  const [isManageTaskModalOpen, setIsManageTaskModalOpen] = useState(false);
  const [isDeleteProjectOpen,   setIsDeleteProjectOpen]   = useState(false);

  // Selected task for manage modal
  const [selectedTask,  setSelectedTask]  = useState(null);
  const [subtasks,      setSubtasks]      = useState([]);
  const [editMode,      setEditMode]      = useState(false);

  // Add task form
  const [addForm,    setAddForm]    = useState({ name: '', description: '', id_user: '', deadline: '', status: 'to do' });
  const [addError,   setAddError]   = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Manage task form (edit)
  const [manageForm,  setManageForm]  = useState({});
  const [manageError, setManageError] = useState('');
  const [savingTask,  setSavingTask]  = useState(false);

  // Team invite
  const [inviteEmail,   setInviteEmail]   = useState('');
  const [inviteError,   setInviteError]   = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  // New subtask
  const [newSubtask,    setNewSubtask]    = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);

  // ── Helper: safe JSON parse ────────────────────────────────────────────────
  async function safeJson(res) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      console.error('[Board] Response bukan JSON:', text.slice(0, 300));
      throw new Error(
        res.status === 404
          ? `Endpoint tidak ditemukan (404): ${res.url}`
          : res.status === 500
          ? 'Server error (500) — cek log backend'
          : `Backend mengembalikan bukan JSON (status ${res.status}). Pastikan backend berjalan di ${API}`
      );
    }
  }

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!API) {
        throw new Error('VITE_API_URL belum diset di file .env frontend');
      }

      // Fetch project
      const projRes  = await fetch(`${API}/api/projects/${projectId}`, { headers: authHeaders() });
      if (projRes.status === 401) throw new Error('Sesi habis, silakan login ulang');
      const projData = await safeJson(projRes);
      if (!projRes.ok) throw new Error(projData?.error || 'Proyek tidak ditemukan');
      setProject(projData);

      // Fetch tasks
      const taskRes  = await fetch(`${API}/api/tasks/project/${projectId}`, { headers: authHeaders() });
      const taskData = await safeJson(taskRes);
      const taskArr  = Array.isArray(taskData) ? taskData : [];
      console.log('[Board] tasks:', taskArr.map(t => ({ id: t.id_task, name: t.name, status: t.status })));
      setTasks(taskArr);

      // Fetch members — opsional, gagal tidak crash board
      try {
        const memberRes  = await fetch(`${API}/api/members/project/${projectId}`, { headers: authHeaders() });
        const memberData = await safeJson(memberRes);
        setMembers(Array.isArray(memberData) ? memberData : []);
      } catch (e) {
        console.warn('[Board] Fetch members gagal (diabaikan):', e.message);
        setMembers([]);
      }

    } catch (e) {
      console.error('[Board] fetchAll error:', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Permissions ─────────────────────────────────────────────────────────────
  // FIX: Jika members kosong (endpoint belum ada / gagal), izinkan edit
  // agar fitur tambah kartu tetap bisa dipakai
  const myMembership = members.find(m => String(m.id_user) === String(user.id_user));
  const canEdit = members.length === 0
    ? true   // fallback: endpoint members belum tersedia → izinkan semua
    : (myMembership?.status === 'owner' || myMembership?.status === 'member');
  const isOwner = members.length === 0
    ? true
    : myMembership?.status === 'owner';

  // ── Add task ────────────────────────────────────────────────────────────────
  async function handleAddTask(e) {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      // Gunakan id_user dari form; jika kosong fallback ke user yang login
      const rawId = addForm.id_user || String(user.id_user || '');
      const targetUserId = Number(rawId);

      console.log('[Board] handleAddTask → id_user dipilih:', rawId, '→ Number:', targetUserId);
      console.log('[Board] user dari localStorage:', user);
      console.log('[Board] addForm:', addForm);

      if (!targetUserId || isNaN(targetUserId)) {
        throw new Error('Pilih anggota yang ditugaskan terlebih dahulu (id_user kosong)');
      }

      const payload = {
        name:        addForm.name,
        description: addForm.description,
        id_project:  Number(projectId),
        id_user:     targetUserId,
        status:      (addForm.status || 'to do').trim().toLowerCase(),
        deadline:    addForm.deadline || null,
      };
      console.log('[Board] POST /api/tasks payload:', payload);

      const res = await fetch(`${API}/api/tasks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      console.log('[Board] POST /api/tasks response:', res.status, data);
      if (!res.ok) throw new Error(data.error || 'Gagal menambah tugas');

      // Tutup modal dan reset form
      setIsModalOpen(false);
      setAddForm({ name: '', description: '', id_user: String(user.id_user || ''), deadline: '', status: 'to do' });

      // Optimistic update: langsung tambah ke state agar muncul seketika
      const normalizedStatus = (data.status || payload.status || 'to do').trim().toLowerCase();
      const newTask = {
        ...data,
        status: normalizedStatus,
        username: data.username
          || members.find(m => String(m.id_user) === String(targetUserId))?.username
          || user.username
          || 'Unknown',
      };
      console.log('[Board] newTask optimistic:', newTask);
      setTasks(prev => [newTask, ...prev]);

      // Re-fetch untuk sinkronisasi dari DB
      await fetchAll();
    } catch (e) {
      setAddError(e.message);
    } finally {
      setAddLoading(false);
    }
  }

  // ── Open modal tambah kartu ─────────────────────────────────────────────────
  function openAddModal() {
    setAddError('');
    // Pre-select user yang sedang login jika ada di daftar members
    const selfMember = members.find(m => String(m.id_user) === String(user.id_user));
    setAddForm({
      name: '',
      description: '',
      id_user: selfMember ? String(selfMember.id_user) : (user.id_user ? String(user.id_user) : ''),
      deadline: '',
      status: 'to do',
    });
    setIsModalOpen(true);
  }

  // ── Open manage modal ───────────────────────────────────────────────────────
  async function openManage(task) {
    setSelectedTask(task);
    setManageForm({
      name:        task.name,
      description: task.description || '',
      id_user:     String(task.id_user),
      deadline:    toInputDate(task.deadline),
      status:      task.status,
    });
    setManageError('');
    setEditMode(false);
    setNewSubtask('');
    setIsManageTaskModalOpen(true);
    try {
      const res  = await fetch(`${API}/api/subtasks/task/${task.id_task}`, { headers: authHeaders() });
      const data = await res.json();
      setSubtasks(Array.isArray(data) ? data : []);
    } catch {
      setSubtasks([]);
    }
  }

  // ── Save edited task ────────────────────────────────────────────────────────
  async function handleSaveTask(e) {
    e.preventDefault();
    setSavingTask(true);
    setManageError('');
    try {
      const res = await fetch(`${API}/api/tasks/${selectedTask.id_task}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          name:        manageForm.name,
          description: manageForm.description,
          id_user:     Number(manageForm.id_user),
          deadline:    manageForm.deadline || null,
          status:      manageForm.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
      setIsManageTaskModalOpen(false);
      await fetchAll();
    } catch (e) {
      setManageError(e.message);
    } finally {
      setSavingTask(false);
    }
  }

  // ── Delete task ─────────────────────────────────────────────────────────────
  async function handleDeleteTask() {
    try {
      await fetch(`${API}/api/tasks/${selectedTask.id_task}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      setIsManageTaskModalOpen(false);
      await fetchAll();
    } catch (e) {
      setManageError(e.message);
    }
  }

  // ── Delete project ──────────────────────────────────────────────────────────
  async function handleDeleteProject() {
    try {
      await fetch(`${API}/api/projects/${projectId}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      navigate('/projects');
    } catch (e) {
      setError(e.message);
    }
  }

  // ── Invite member ───────────────────────────────────────────────────────────
  async function handleInvite(e) {
    e.preventDefault();
    setInviteError('');
    setInviteLoading(true);
    try {
      const res = await fetch(`${API}/api/members`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email: inviteEmail, id_project: Number(projectId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengundang');
      setInviteEmail('');
      const mRes  = await fetch(`${API}/api/members/project/${projectId}`, { headers: authHeaders() });
      const mData = await mRes.json();
      setMembers(Array.isArray(mData) ? mData : []);
    } catch (e) {
      setInviteError(e.message);
    } finally {
      setInviteLoading(false);
    }
  }

  // ── Add subtask ─────────────────────────────────────────────────────────────
  async function handleAddSubtask(e) {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    setAddingSubtask(true);
    try {
      const res  = await fetch(`${API}/api/subtasks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: newSubtask, id_task: selectedTask.id_task }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubtasks(s => [...s, data]);
      setNewSubtask('');
    } catch (e) {
      console.error(e);
    } finally {
      setAddingSubtask(false);
    }
  }

  // ── Toggle subtask ──────────────────────────────────────────────────────────
  async function toggleSubtask(sub) {
    const newStatus = sub.status === 'done' ? 'doing' : 'done';
    try {
      const res  = await fetch(`${API}/api/subtasks/${sub.id_subtask}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      setSubtasks(s => s.map(x => x.id_subtask === sub.id_subtask ? data : x));
    } catch (e) {
      console.error(e);
    }
  }

  // ── Delete subtask ──────────────────────────────────────────────────────────
  async function deleteSubtask(id) {
    try {
      await fetch(`${API}/api/subtasks/${id}`, { method: 'DELETE', headers: authHeaders() });
      setSubtasks(s => s.filter(x => x.id_subtask !== id));
    } catch (e) {
      console.error(e);
    }
  }

  // ── Group tasks by status ───────────────────────────────────────────────────
  const grouped = STATUS_COLS.reduce((acc, s) => { acc[s] = []; return acc; }, {});
  tasks.forEach(t => {
    // Trim + lowercase untuk toleransi variasi dari DB (misal "To Do", " to do ", dll)
    const s = (t.status || '').trim().toLowerCase();
    if (grouped[s] !== undefined) {
      grouped[s].push(t);
    } else {
      // Status tidak dikenal → masuk TO-DO sebagai fallback
      console.warn('[Board] status tidak dikenal:', s, '→ dimasukkan ke TO-DO', t);
      grouped['to do'].push(t);
    }
  });

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat board...</div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--color-board-bg)] text-slate-800 font-sans flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <nav className="bg-white shadow-sm px-6 lg:px-12 py-4 flex flex-col md:flex-row items-center justify-between w-full mb-8">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="bg-slate-200 w-12 h-12 rounded-full flex items-center justify-center text-slate-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Kanbanflow</h1>
        </div>

        <nav className="flex space-x-8 mb-4 md:mb-0 font-semibold text-lg">
          <Link className="text-slate-600 hover:text-slate-900 transition-colors" to="/dashboard">Beranda</Link>
          <Link className="text-[var(--color-primary)] hover:text-teal-500 transition-colors" to="/projects">Proyek Tim</Link>
        </nav>

        <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-full transition-colors">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold">
            {getInitials(user.username || '')}
          </div>
          <span className="font-semibold text-slate-700 hidden sm:block">{user.username || 'User'}</span>
          <svg className="h-4 w-4 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
            <path clipRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" fillRule="evenodd" />
          </svg>
        </div>
      </nav>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="max-w-[1600px] mx-auto w-full px-4 md:px-8 flex-1 flex flex-col">

        {/* Project Header */}
        <section className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-slate-300 pb-4">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-3xl font-extrabold mb-1">{project?.name}</h2>
            <p className="text-slate-600 text-sm">{project?.description || ''}</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Anggota Tim */}
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="font-bold text-slate-700 text-sm hover:text-[var(--color-primary)] transition-colors flex items-center gap-2"
            >
              Anggota Tim
              <div className="flex -space-x-2">
                {members.slice(0, 4).map(m => (
                  <div key={m.id_member} title={m.username}
                    className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold
                      ${m.status === 'owner' ? 'bg-[var(--color-primary)] text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {getInitials(m.username)}
                  </div>
                ))}
              </div>
            </button>

            {/* Hapus Proyek */}
            {isOwner && (
              <button
                onClick={() => setIsDeleteProjectOpen(true)}
                className="bg-[var(--color-primary)] text-white font-semibold py-2 px-4 rounded-full flex items-center space-x-1 hover:bg-teal-500 transition-colors shadow-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Hapus</span>
              </button>
            )}

            {/* ── TAMBAH KARTU — selalu tampil jika canEdit ── */}
            {canEdit && (
              <button
                onClick={openAddModal}
                className="bg-[var(--color-primary)] text-white font-semibold py-2 px-5 rounded-full flex items-center space-x-1 hover:bg-teal-500 transition-colors shadow-sm"
              >
                <span className="text-xl leading-none mr-1">+</span>
                <span>Tambah Kartu</span>
              </button>
            )}
          </div>
        </section>

        {/* Kanban Board */}
        <section className="gap-6 pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 flex-1">
          {STATUS_COLS.map(status => {
            const isOver = status === 'overdue';
            return (
              <div key={status}
                className={`${isOver ? 'bg-[var(--color-overdue-container)]' : 'bg-white'} rounded-[32px] p-6 flex-1 shadow-sm border border-slate-100 flex flex-col h-full min-w-0`}>
                <h3 className={`text-center font-extrabold text-lg tracking-wide border-b-2 pb-2 mb-6 uppercase
                  ${isOver ? 'border-red-800/20 text-red-800' : 'border-slate-800'}`}>
                  {STATUS_LABELS[status]}
                </h3>
                <div className="space-y-4 flex-1">
                  {grouped[status].length === 0 ? (
                    <p className="text-center text-sm text-slate-400 mt-8">Tidak ada tugas</p>
                  ) : (
                    grouped[status].map(task => (
                      <TaskCard key={task.id_task} task={task} isOverdue={isOver} onClick={() => openManage(task)} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>

      </main>


      {/* ════════════════════════════════════════════════════
           MODAL: Tambah Kartu Tugas
         ════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div aria-modal="true" className="fixed inset-0 bg-slate-400/50 backdrop-blur-sm z-50 flex justify-center items-center" role="dialog">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8 relative m-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="mb-8 border-b border-[var(--color-outline-variant)] pb-6">
              <h2 className="text-2xl font-bold mb-2">Tambah Kartu Tugas</h2>
              <p className="text-sm text-gray-600">Tambah tugas baru dan kelola kartu tugas</p>
            </div>

            {addError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{addError}</div>
            )}

            <form onSubmit={handleAddTask}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Kiri */}
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Nama Tugas</label>
                    <input
                      className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm placeholder-gray-400"
                      placeholder="Nama tugas..."
                      value={addForm.name}
                      onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Deskripsi</label>
                    <textarea
                      className="w-full px-4 py-3 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm placeholder-gray-400 resize-none flex-1 min-h-[120px]"
                      placeholder="Deskripsi tugas..."
                      value={addForm.description}
                      onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Kanan */}
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Ditugaskan Ke</label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm appearance-none bg-white"
                        value={addForm.id_user}
                        onChange={e => setAddForm(f => ({ ...f, id_user: e.target.value }))}
                        required
                      >
                        <option value="" disabled>Pilih User</option>
                        {/* Jika members tersedia dari API, tampilkan; jika tidak, tampilkan user sendiri */}
                        {members.length > 0
                          ? members.map(m => (
                              <option key={m.id_user} value={m.id_user}>{m.username}</option>
                            ))
                          : (
                              <option value={user.id_user}>{user.username || 'Saya'}</option>
                            )
                        }
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Batas Waktu</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm"
                      value={addForm.deadline}
                      onChange={e => setAddForm(f => ({ ...f, deadline: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Status Awal</label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm appearance-none bg-white"
                        value={addForm.status}
                        onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}
                      >
                        <option value="to do">TO - DO</option>
                        <option value="doing">DOING</option>
                        <option value="done">DONE</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-40 py-3 px-6 rounded-full border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full sm:w-40 py-3 px-6 rounded-full bg-[var(--color-primary)] text-white font-semibold hover:bg-teal-500 transition-colors disabled:opacity-60"
                >
                  {addLoading ? 'Menyimpan...' : 'Simpan Kartu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════════════════
           MODAL: Anggota Tim
         ════════════════════════════════════════════════════ */}
      {isTeamModalOpen && (
        <div aria-modal="true" className="fixed inset-0 bg-slate-400/50 backdrop-blur-sm z-50 flex justify-center items-center" role="dialog">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-[600px] flex flex-col overflow-hidden relative m-4 max-h-[90vh]">
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Anggota Tim</h2>
                <p className="text-sm text-gray-600">Daftar anggota tim yang bergabung ke dalam proyek</p>
              </div>
              <button onClick={() => setIsTeamModalOpen(false)} className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {members.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">Belum ada data anggota</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {members.map(m => (
                    <li key={m.id_member} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                          ${m.status === 'owner' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {getInitials(m.username)}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{m.username}</h3>
                          <p className="text-sm text-gray-500">{m.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full
                        ${m.status === 'owner' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {m.status === 'owner' ? 'Pemilik' : m.status === 'member' ? 'Anggota' : 'Penonton'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {isOwner && (
              <div className="p-6 bg-white border-t border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Undang Anggota Baru :</label>
                {inviteError && <p className="text-red-500 text-sm mb-2">{inviteError}</p>}
                <form onSubmit={handleInvite} className="flex gap-4">
                  <input
                    className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                    placeholder="Masukkan Email"
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="bg-[var(--color-primary)] hover:bg-teal-500 text-white font-semibold text-sm px-6 py-2 rounded-full transition-colors whitespace-nowrap shadow-sm disabled:opacity-60"
                  >
                    {inviteLoading ? '...' : 'Undang'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════════════════
           MODAL: Kelola Kartu Tugas
         ════════════════════════════════════════════════════ */}
      {isManageTaskModalOpen && selectedTask && (
        <div aria-modal="true" className="fixed inset-0 bg-slate-400/50 backdrop-blur-sm z-50 flex justify-center items-center" role="dialog">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden relative m-4 max-h-[90vh]">

            <div className="px-8 pt-8 pb-6 border-b border-gray-200 relative">
              <h2 className="text-[28px] leading-tight font-bold text-gray-900 mb-1">Kartu Tugas</h2>
              <p className="text-base text-gray-600">Kelola Kartu Tugas Anda.</p>
              <button
                onClick={() => setIsManageTaskModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              {manageError && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{manageError}</div>
              )}

              <form id="manage-task-form" onSubmit={handleSaveTask}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Nama Tugas</label>
                      <input
                        className={`w-full px-5 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm bg-transparent
                          ${editMode ? 'border-gray-400' : 'border-gray-200 bg-gray-50'}`}
                        value={manageForm.name || ''}
                        onChange={e => setManageForm(f => ({ ...f, name: e.target.value }))}
                        readOnly={!editMode}
                        required
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Deskripsi</label>
                      <textarea
                        className={`w-full px-5 py-3 rounded-3xl border focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm resize-y flex-1 min-h-[100px] bg-transparent
                          ${editMode ? 'border-gray-400' : 'border-gray-200 bg-gray-50'}`}
                        value={manageForm.description || ''}
                        onChange={e => setManageForm(f => ({ ...f, description: e.target.value }))}
                        readOnly={!editMode}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Ditugaskan Ke</label>
                      <div className="relative">
                        <select
                          className={`w-full px-5 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm bg-transparent appearance-none
                            ${editMode ? 'border-gray-400' : 'border-gray-200 bg-gray-50'}`}
                          value={manageForm.id_user || ''}
                          onChange={e => setManageForm(f => ({ ...f, id_user: e.target.value }))}
                          disabled={!editMode}
                        >
                          {members.length > 0
                            ? members.map(m => (
                                <option key={m.id_user} value={m.id_user}>{m.username}</option>
                              ))
                            : <option value={selectedTask.id_user}>{selectedTask.username}</option>
                          }
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                          <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Deadline</label>
                      <input
                        type="date"
                        className={`w-full px-5 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm bg-transparent
                          ${editMode ? 'border-gray-400' : 'border-gray-200 bg-gray-50'}`}
                        value={manageForm.deadline || ''}
                        onChange={e => setManageForm(f => ({ ...f, deadline: e.target.value }))}
                        readOnly={!editMode}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Status Awal</label>
                      <div className="relative">
                        <select
                          className={`w-full px-5 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow text-sm bg-transparent appearance-none
                            ${editMode ? 'border-gray-400' : 'border-gray-200 bg-gray-50'}`}
                          value={manageForm.status || 'to do'}
                          onChange={e => setManageForm(f => ({ ...f, status: e.target.value }))}
                          disabled={!editMode}
                        >
                          <option value="to do">To Do</option>
                          <option value="doing">Doing</option>
                          <option value="done">Done</option>
                          <option value="overdue">Overdue</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                          <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtask */}
                {canEdit && (
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Subtask</h3>
                    <ul className="space-y-2 mb-3">
                      {subtasks.map(sub => (
                        <li key={sub.id_subtask} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleSubtask(sub)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                              ${sub.status === 'done' ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-gray-300'}`}
                          >
                            {sub.status === 'done' && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                          <span className={`flex-1 text-sm ${sub.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {sub.name}
                          </span>
                          <button type="button" onClick={() => deleteSubtask(sub.id_subtask)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <form onSubmit={handleAddSubtask} className="flex gap-2">
                      <input
                        className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                        placeholder="Tambah subtask..."
                        value={newSubtask}
                        onChange={e => setNewSubtask(e.target.value)}
                        disabled={addingSubtask}
                      />
                      <button
                        type="submit"
                        disabled={addingSubtask || !newSubtask.trim()}
                        className="px-4 py-2 rounded-full bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-teal-500 disabled:opacity-50 transition-colors"
                      >
                        +
                      </button>
                    </form>
                  </div>
                )}
              </form>
            </div>

            <div className="px-8 py-6 border-t border-gray-200 flex justify-between items-center">
              {canEdit ? (
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  className="text-red-500 font-semibold hover:text-red-700 transition-colors px-2 py-2 text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Hapus Tugas
                </button>
              ) : <div />}

              <div className="flex items-center gap-4">
                {canEdit && !editMode && (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="text-[var(--color-primary)] font-semibold hover:text-teal-600 transition-colors px-2 py-2"
                  >
                    Edit
                  </button>
                )}
                {editMode && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="text-gray-500 font-semibold hover:text-gray-700 transition-colors px-2 py-2"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      form="manage-task-form"
                      disabled={savingTask}
                      className="bg-[var(--color-primary)] hover:bg-teal-500 text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-sm disabled:opacity-60"
                    >
                      {savingTask ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════════════════
           MODAL: Konfirmasi Hapus Proyek
         ════════════════════════════════════════════════════ */}
      {isDeleteProjectOpen && (
        <div aria-modal="true" className="fixed inset-0 bg-slate-400/50 backdrop-blur-sm z-50 flex justify-center items-center" role="dialog">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 m-4 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Hapus Proyek?</h2>
            <p className="text-gray-600 text-sm mb-8">
              Tindakan ini akan menghapus proyek "<strong>{project?.name}</strong>" beserta semua tugas dan subtask di dalamnya secara permanen.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setIsDeleteProjectOpen(false)}
                className="w-36 py-3 px-6 rounded-full border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteProject}
                className="w-36 py-3 px-6 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}