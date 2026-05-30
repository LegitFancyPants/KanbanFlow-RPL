"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import NotificationBell from "@/frontend/components/NotificationBell";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getToken, getUser, clearAuth } from "@/frontend/utils/auth";
import SharedNavbar from "@/frontend/components/SharedNavbar";
const API = "";

function authHeaders() {
  const token = getToken();
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
function TaskCard({ task, isOverdue, onClick, index, isDragDisabled }) {
  return (
    <Draggable draggableId={String(task.id_task)} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer backdrop-blur-md ${
            snapshot.isDragging ? 'opacity-90 z-50 shadow-2xl scale-105 bg-white/80' : ''
          } ${
            isOverdue
              ? 'bg-red-50/80 text-red-600 border-red-200 hover:bg-red-100/90'
              : 'border-white/60 bg-white/60 hover:bg-white/80 text-slate-800'
          }`}
          style={{ ...provided.draggableProps.style }}
        >
          <h4 className={`font-bold mb-6 text-slate-900`}>{task.name}</h4>
          <div className={`flex justify-between items-center text-xs text-slate-600`}>
            <span>Deadline : {formatDeadline(task.deadline)}</span>
            <div className="flex items-center space-x-1">
              <div className={`w-5 h-5 rounded-full border border-white/50 flex items-center justify-center text-[9px] font-bold shadow-sm bg-[var(--color-primary)] text-white`}>
                {getInitials(task.username)}
              </div>
              <span className="font-bold">{task.username}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ── Main Board ────────────────────────────────────────────────────────────────
export default function Board() {
  const { projectId } = useParams();
  const router = useRouter();
  const user = getUser();

  const [project, setProject]   = useState(null);
  const [tasks, setTasks]       = useState([]);
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

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
  const [inviteRole,    setInviteRole]    = useState('member');
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
          : `Backend mengembalikan bukan JSON (status ${res.status}). Pastikan backend berjalan di `
      );
    }
  }

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      setError('');

      // No API check needed for Next.js internal routes

      // Fetch project
      const projRes  = await fetch(`/api/projects/${projectId}`, { headers: authHeaders() });
      if (projRes.status === 401) throw new Error('Sesi habis, silakan login ulang');
      const projData = await safeJson(projRes);
      if (!projRes.ok) throw new Error(projData?.error || 'Proyek tidak ditemukan');
      setProject(projData);

      // Fetch tasks
      const taskRes  = await fetch(`/api/tasks/project/${projectId}`, { headers: authHeaders() });
      const taskData = await safeJson(taskRes);
      const taskArr  = Array.isArray(taskData) ? taskData : [];
      console.log('[Board] tasks:', taskArr.map(t => ({ id: t.id_task, name: t.name, status: t.status })));
      setTasks(taskArr);

      // Fetch members — opsional, gagal tidak crash board
      try {
        const memberRes  = await fetch(`/api/members/project/${projectId}`, { headers: authHeaders() });
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
      if (!quiet) setLoading(false);
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

      const res = await fetch(`/api/tasks`, {
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
      await fetchAll(true);
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
      const res  = await fetch(`/api/subtasks/task/${task.id_task}`, { headers: authHeaders() });
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
      const res = await fetch(`/api/tasks/${selectedTask.id_task}`, {
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
      await fetchAll(true);
    } catch (e) {
      setManageError(e.message);
    } finally {
      setSavingTask(false);
    }
  }

  // ── Delete task ─────────────────────────────────────────────────────────────
  async function handleDeleteTask() {
    try {
      await fetch(`/api/tasks/${selectedTask.id_task}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      setIsManageTaskModalOpen(false);
      await fetchAll(true);
    } catch (e) {
      setManageError(e.message);
    }
  }

  // ── Delete project ──────────────────────────────────────────────────────────
  async function handleDeleteProject() {
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      router.push('/projects');
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
      const res = await fetch(`/api/invitations`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email: inviteEmail, id_project: Number(projectId), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengundang');
      setInviteEmail('');
      const mRes  = await fetch(`/api/members/project/${projectId}`, { headers: authHeaders() });
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
    if (e) e.preventDefault();
    if (!newSubtask.trim() || subtasks.length >= 5) return;
    setAddingSubtask(true);
    try {
      const res  = await fetch(`/api/subtasks`, {
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
      const res  = await fetch(`/api/subtasks/${sub.id_subtask}`, {
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
      await fetch(`/api/subtasks/${id}`, { method: 'DELETE', headers: authHeaders() });
      setSubtasks(s => s.filter(x => x.id_subtask !== id));
    } catch (e) {
      console.error(e);
    }
  }

  // ── Group tasks by status ───────────────────────────────────────────────────
  // Helper: cek apakah deadline sudah lewat (bandingkan tanggal saja, tanpa jam)
  function isDeadlinePassed(deadlineStr) {
    if (!deadlineStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0);
    return deadline < today;
  }

  const grouped = STATUS_COLS.reduce((acc, s) => { acc[s] = []; return acc; }, {});
  tasks.forEach(t => {
    const s = (t.status || '').trim().toLowerCase();

    // Tugas yang bukan 'done' dan deadline-nya sudah lewat → paksa masuk overdue
    if (s !== 'done' && isDeadlinePassed(t.deadline)) {
      grouped['overdue'].push(t);
      return;
    }

    if (grouped[s] !== undefined) {
      grouped[s].push(t);
    } else {
      // Status tidak dikenal → masuk TO-DO sebagai fallback
      console.warn('[Board] status tidak dikenal:', s, '→ dimasukkan ke TO-DO', t);
      grouped['to do'].push(t);
    }
  });

  // ── Drag and Drop ───────────────────────────────────────────────────────────
  async function onDragEnd(result) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    // Prevent moving into overdue or moving out of overdue
    if (source.droppableId === 'overdue' || destination.droppableId === 'overdue') return;

    // Optimistic UI update with proper order preservation
    setTasks(prev => {
      const taskIndex = prev.findIndex(t => String(t.id_task) === draggableId);
      if (taskIndex === -1) return prev;
      
      const taskToMove = { ...prev[taskIndex], status: destination.droppableId };
      const newTasks = prev.filter((_, idx) => idx !== taskIndex);
      
      let destCount = 0;
      let insertIndex = newTasks.length;
      
      for (let i = 0; i < newTasks.length; i++) {
        const s = (newTasks[i].status || '').trim().toLowerCase();
        if (s === destination.droppableId) {
          if (destCount === destination.index) {
            insertIndex = i;
            break;
          }
          destCount++;
        }
      }
      
      newTasks.splice(insertIndex, 0, taskToMove);
      return newTasks;
    });

    // If dropped in the same column, we only need local reorder. No API call needed.
    if (source.droppableId === destination.droppableId) return;

    // API Call for status change across columns
    try {
      const res = await fetch(`/api/tasks/${draggableId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: destination.droppableId })
      });
      if (!res.ok) throw new Error('Failed to update status');
      // Intentionally not calling fetchAll(true) here to preserve the user's custom local order
    } catch (e) {
      console.error(e);
      fetchAll(true); // Revert on failure
    }
  }

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat board...</div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  );

  return (
    <div className="min-h-screen bg-static-gradient-board text-slate-800 font-sans flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-white/20 z-0 pointer-events-none"></div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <SharedNavbar />

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-[1600px] mx-auto w-full px-4 md:px-8 pt-10 flex-1 flex flex-col">

        {/* Project Header */}
        <section className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-slate-200 pb-4">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-3xl font-black mb-1 text-slate-900 tracking-tight">{project?.name}</h2>
            <p className="text-slate-700 text-sm font-medium">{project?.description || ''}</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Anggota Tim */}
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="font-bold text-slate-700 text-sm hover:text-slate-900 transition-colors flex items-center gap-2"
            >
              Anggota Tim
              <div className="flex -space-x-2">
                {members.slice(0, 4).map(m => (
                  <div key={m.id_member} title={m.username}
                    className={`w-6 h-6 rounded-full border border-white/60 flex items-center justify-center text-[10px] font-bold shadow-sm
                      ${m.status === 'owner' ? 'bg-[var(--color-primary)] text-white' : 'bg-white/80 text-slate-800'}`}>
                    {getInitials(m.username)}
                  </div>
                ))}
              </div>
            </button>

            {/* Hapus Proyek */}
            <button
              onClick={() => setIsDeleteProjectOpen(true)}
              className="bg-red-50 hover:bg-red-100 backdrop-blur-sm border border-red-200 text-red-600 font-bold py-2 px-4 rounded-full flex items-center space-x-1 transition-colors shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Hapus</span>
            </button>

            {/* ── TAMBAH KARTU ── */}
            {canEdit && (
              <button
                onClick={openAddModal}
                className="bg-[var(--color-primary)] hover:bg-teal-500 backdrop-blur-sm border border-teal-400 text-white font-bold py-2 px-5 rounded-full flex items-center space-x-1 transition-colors shadow-md"
              >
                <span className="text-xl leading-none mr-1">+</span>
                <span>Tambah Kartu</span>
              </button>
            )}
          </div>
        </section>

        {/* Kanban Board */}
        <section className="gap-6 pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 flex-1">
          <DragDropContext onDragEnd={onDragEnd}>
          {STATUS_COLS.map(status => {
            const isOver = status === 'overdue';
            return (
              <div key={status}
                className={`${isOver ? 'bg-red-50/80 border-red-200' : 'bg-white/70 border-white/60'} rounded-[32px] p-6 flex-1 shadow-md border flex flex-col h-full min-w-0`}>
                <h3 className={`text-center font-black text-lg tracking-wide border-b pb-2 mb-6 uppercase
                  ${isOver ? 'border-red-200 text-red-500' : 'border-slate-300 text-slate-800'}`}>
                  {STATUS_LABELS[status]}
                </h3>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col gap-4 flex-1 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'ring-2 ring-white/60 bg-white/40' : ''}`}
                    >
                      {grouped[status].length === 0 ? (
                        <p className="text-center text-sm text-slate-500 mt-8 font-bold">Tidak ada tugas</p>
                      ) : (
                        grouped[status].map((task, index) => (
                          <TaskCard 
                            key={task.id_task} 
                            task={task} 
                            isOverdue={isOver} 
                            onClick={() => openManage(task)} 
                            index={index}
                            isDragDisabled={!canEdit || isOver}
                          />
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
          </DragDropContext>
        </section>

      </main>


      {/* ════════════════════════════════════════════════════
           MODAL: Tambah Kartu Tugas
         ════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div aria-modal="true" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex justify-center items-center p-4" role="dialog">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="mb-8 border-b border-slate-200 pb-6">
              <h2 className="text-2xl font-black mb-2 text-slate-800">Tambah Kartu Tugas</h2>
              <p className="text-sm text-slate-600 font-semibold">Tambah tugas baru dan kelola kartu tugas</p>
            </div>

            {addError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-100/90 backdrop-blur-sm border border-red-200 text-red-600 font-medium text-sm text-center">{addError}</div>
            )}

            <form onSubmit={handleAddTask}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Kiri */}
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nama Tugas</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:bg-white/80 text-slate-800 placeholder-slate-400 transition-colors duration-200 text-sm font-medium"
                      placeholder="Nama tugas..."
                      value={addForm.name}
                      onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Deskripsi</label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:bg-white/80 text-slate-800 placeholder-slate-400 transition-colors duration-200 text-sm font-medium resize-none flex-1 min-h-[120px]"
                      placeholder="Deskripsi tugas..."
                      value={addForm.description}
                      onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Kanan */}
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Ditugaskan Ke</label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:bg-white/80 text-slate-800 transition-colors duration-200 text-sm appearance-none font-medium"
                        value={addForm.id_user}
                        onChange={e => setAddForm(f => ({ ...f, id_user: e.target.value }))}
                        required
                      >
                        <option value="" disabled className="text-gray-900">Pilih User</option>
                        {members.length > 0
                          ? members.map(m => (
                              <option key={m.id_user} value={m.id_user} className="text-gray-900">{m.username}</option>
                            ))
                          : (
                              <option value={user.id_user} className="text-gray-900">{user.username || 'Saya'}</option>
                            )
                        }
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Batas Waktu</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:bg-white/80 text-slate-800 transition-colors duration-200 text-sm font-medium"
                      value={addForm.deadline}
                      onChange={e => setAddForm(f => ({ ...f, deadline: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Status Awal</label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:bg-white/80 text-slate-800 transition-colors duration-200 text-sm appearance-none font-medium"
                        value={addForm.status}
                        onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}
                      >
                        <option value="to do" className="text-gray-900">TO - DO</option>
                        <option value="doing" className="text-gray-900">DOING</option>
                        <option value="done" className="text-gray-900">DONE</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
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
                  className="w-full sm:w-40 py-3.5 px-6 rounded-xl bg-white/60 hover:bg-white/80 border border-slate-300 text-slate-700 font-bold transition-colors shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full sm:w-40 py-3.5 px-6 rounded-xl bg-[var(--color-primary)] hover:bg-teal-500 text-white font-bold transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
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
        <div aria-modal="true" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex justify-center items-center p-4" role="dialog">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl w-full max-w-[600px] flex flex-col overflow-hidden relative max-h-[90vh]">
            <div className="flex items-start justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-black text-slate-800 mb-1">Anggota Tim</h2>
                <p className="text-sm text-slate-600 font-semibold">Daftar anggota tim yang bergabung ke dalam proyek</p>
              </div>
              <button onClick={() => setIsTeamModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {members.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8 font-bold">Belum ada data anggota</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {members.map(m => (
                    <li key={m.id_member} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full border border-white/60 flex items-center justify-center text-sm font-bold shadow-sm
                          ${m.status === 'owner' ? 'bg-[var(--color-primary)] text-white' : 'bg-white/80 text-slate-800'}`}>
                          {getInitials(m.username)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">{m.username}</h3>
                          <p className="text-sm text-slate-600 font-medium">{m.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border shadow-sm
                        ${m.status === 'owner' ? 'bg-[var(--color-primary)] border-teal-400 text-white' : 'bg-white/80 border-slate-300 text-slate-700'}`}>
                        {m.status === 'owner' ? 'Pemilik' : m.status === 'member' ? 'Anggota' : 'Penonton'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {isOwner && (
              <div className="p-6 bg-white/60 border-t border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Undang Anggota Baru :</label>
                {inviteError && <p className="text-red-500 text-sm mb-2 font-bold">{inviteError}</p>}
                <form onSubmit={handleInvite} className="flex gap-4">
                  <input
                    className="flex-1 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:bg-white/80 text-slate-800 placeholder-slate-400 transition-colors duration-200 text-sm font-medium"
                    placeholder="Masukkan Email"
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                  />
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:bg-white/80 text-slate-800 transition-colors duration-200 text-sm appearance-none font-medium"
                  >
                    <option value="member" className="text-gray-900">Anggota</option>
                    <option value="viewer" className="text-gray-900">Penonton</option>
                  </select>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="bg-[var(--color-primary)] hover:bg-teal-500 text-white font-bold text-sm px-6 py-2 rounded-xl transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
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
        <div aria-modal="true" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex justify-center items-center p-4" role="dialog">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden relative max-h-[90vh]">

            <div className="px-8 pt-8 pb-6 border-b border-slate-200 relative">
              <h2 className="text-[28px] leading-tight font-black text-slate-800 mb-1">Kartu Tugas</h2>
              <p className="text-sm text-slate-600 font-semibold">Kelola Kartu Tugas Anda.</p>
              <button
                onClick={() => setIsManageTaskModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              {manageError && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-100/90 backdrop-blur-sm border border-red-200 text-red-600 font-medium text-sm text-center">{manageError}</div>
              )}

              <form id="manage-task-form" onSubmit={handleSaveTask}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nama Tugas</label>
                      <input
                        className={`w-full px-4 py-3 rounded-xl backdrop-blur-sm border focus:outline-none transition-colors text-sm font-medium
                          ${editMode ? 'bg-white/60 border-slate-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white/80 text-slate-800 placeholder-slate-400' : 'bg-transparent border-transparent text-slate-900 cursor-default'}`}
                        value={manageForm.name || ''}
                        onChange={e => setManageForm(f => ({ ...f, name: e.target.value }))}
                        readOnly={!editMode}
                        required
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Deskripsi</label>
                      <textarea
                        className={`w-full px-4 py-3 rounded-xl backdrop-blur-sm border focus:outline-none transition-colors text-sm resize-y flex-1 min-h-[100px] font-medium
                          ${editMode ? 'bg-white/60 border-slate-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white/80 text-slate-800 placeholder-slate-400' : 'bg-transparent border-transparent text-slate-700 cursor-default'}`}
                        value={manageForm.description || ''}
                        onChange={e => setManageForm(f => ({ ...f, description: e.target.value }))}
                        readOnly={!editMode}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Ditugaskan Ke</label>
                      <div className="relative">
                        <select
                          className={`w-full px-4 py-3 rounded-xl backdrop-blur-sm border focus:outline-none transition-colors text-sm appearance-none font-medium
                            ${editMode ? 'bg-white/60 border-slate-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white/80 text-slate-800' : 'bg-transparent border-transparent text-slate-900 cursor-default'}`}
                          value={manageForm.id_user || ''}
                          onChange={e => setManageForm(f => ({ ...f, id_user: e.target.value }))}
                          disabled={!editMode}
                        >
                          {members.length > 0
                            ? members.map(m => (
                                <option key={m.id_user} value={m.id_user} className="text-gray-900">{m.username}</option>
                              ))
                            : <option value={selectedTask.id_user} className="text-gray-900">{selectedTask.username}</option>
                          }
                        </select>
                        {editMode && (
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Deadline</label>
                      <input
                        type="date"
                        className={`w-full px-4 py-3 rounded-xl backdrop-blur-sm border focus:outline-none transition-colors text-sm font-medium
                          ${editMode ? 'bg-white/60 border-slate-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white/80 text-slate-800' : 'bg-transparent border-transparent text-slate-900 cursor-default'}`}
                        value={manageForm.deadline || ''}
                        onChange={e => setManageForm(f => ({ ...f, deadline: e.target.value }))}
                        readOnly={!editMode}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Status Awal</label>
                      <div className="relative">
                        <select
                          className={`w-full px-4 py-3 rounded-xl backdrop-blur-sm border focus:outline-none transition-colors text-sm appearance-none font-medium
                            ${editMode ? 'bg-white/60 border-slate-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:bg-white/80 text-slate-800' : 'bg-transparent border-transparent text-slate-900 cursor-default'}`}
                          value={manageForm.status || 'to do'}
                          onChange={e => setManageForm(f => ({ ...f, status: e.target.value }))}
                          disabled={!editMode}
                        >
                          <option value="to do" className="text-gray-900">To Do</option>
                          <option value="doing" className="text-gray-900">Doing</option>
                          <option value="done" className="text-gray-900">Done</option>
                          <option value="overdue" className="text-gray-900">Overdue</option>
                        </select>
                        {editMode && (
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtask */}
                {canEdit && (
                  <div className="mt-6 border-t border-slate-200 pt-6">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">
                      Subtask <span className="text-slate-400 font-normal ml-2">({subtasks.length}/5)</span>
                    </h3>
                    
                    {subtasks.length > 0 && (
                      <ul className="space-y-2 mb-4">
                        {subtasks.map(sub => (
                          <li key={sub.id_subtask} className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleSubtask(sub)}
                              className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors shadow-sm
                                ${sub.status === 'done' ? 'bg-[var(--color-primary)] border-teal-500' : 'border-slate-300 bg-white'}`}
                            >
                              {sub.status === 'done' && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                            <span className={`flex-1 text-sm font-medium ${sub.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {sub.name}
                            </span>
                            <button type="button" onClick={() => deleteSubtask(sub.id_subtask)} className="text-slate-400 hover:text-red-500 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {subtasks.length < 5 ? (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          className="flex-1 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:bg-white/80 text-slate-800 placeholder-slate-400 transition-colors duration-200 text-sm font-medium"
                          placeholder="Tambah subtask..."
                          value={newSubtask}
                          onChange={e => setNewSubtask(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubtask(e);
                            }
                          }}
                          disabled={addingSubtask}
                        />
                        <button
                          type="button"
                          onClick={handleAddSubtask}
                          disabled={addingSubtask || !newSubtask.trim()}
                          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-teal-500 border border-transparent text-white text-sm font-bold shadow-sm disabled:opacity-50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-600 font-medium bg-amber-50 px-3 py-2 rounded-lg mt-2 border border-amber-200 text-center shadow-sm">
                        Batas maksimal 5 subtask telah tercapai.
                      </p>
                    )}
                  </div>
                )}
              </form>
            </div>

            <div className="px-8 py-6 border-t border-slate-200 flex justify-between items-center">
              {canEdit ? (
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  className="text-red-500 font-bold hover:text-red-600 transition-colors px-2 py-2 text-sm flex items-center gap-1"
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
                    className="text-slate-600 font-bold hover:text-slate-800 transition-colors px-2 py-2"
                  >
                    Edit
                  </button>
                )}
                {editMode && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="text-slate-500 font-bold hover:text-slate-700 transition-colors px-2 py-2"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      form="manage-task-form"
                      disabled={savingTask}
                      className="bg-[var(--color-primary)] hover:bg-teal-500 text-white font-bold py-2.5 px-8 rounded-xl transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
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
        <div aria-modal="true" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex justify-center items-center p-4" role="dialog">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl w-full max-w-md p-8 text-center relative">
            <div className="w-16 h-16 bg-red-100 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-2xl font-black mb-2 text-slate-800">Hapus Proyek?</h2>
            <p className="text-slate-600 text-sm mb-8 font-semibold">
              Tindakan ini akan menghapus proyek "<strong>{project?.name}</strong>" beserta semua tugas dan subtask di dalamnya secara permanen.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setIsDeleteProjectOpen(false)}
                className="w-36 py-3.5 px-6 rounded-xl bg-white/60 hover:bg-white/80 border border-slate-300 text-slate-700 font-bold transition-colors shadow-sm"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteProject}
                className="w-36 py-3.5 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-md border border-transparent"
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