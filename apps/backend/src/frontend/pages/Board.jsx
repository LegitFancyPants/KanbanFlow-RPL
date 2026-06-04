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
          className={`border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow transition-colors cursor-pointer bg-white ${
            snapshot.isDragging ? 'opacity-90 z-50 shadow-2xl' : ''
          } ${
            isOverdue
              ? 'border-red-200 hover:border-red-300'
              : 'border-slate-200 hover:border-[#2ecfb4]/50'
          }`}
          style={{ ...provided.draggableProps.style }}
        >
          <h4 className={`font-bold mb-6 ${isOverdue ? 'text-red-500' : 'text-slate-900'}`}>{task.name}</h4>
          <div className={`flex justify-between items-center text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
            <span>Deadline : {formatDeadline(task.deadline)}</span>
            <div className="flex items-center space-x-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${isOverdue ? 'bg-red-100 text-red-500' : 'bg-[#2ecfb4]/10 text-[#2ecfb4]'}`}>
                {getInitials(task.username)}
              </div>
              <span className="font-semibold">{task.username}</span>
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
  const [isPermissionAlertOpen, setIsPermissionAlertOpen] = useState(false);
  const [permissionAlertMessage, setPermissionAlertMessage] = useState('');
  const [isLeaveProjectOpen,    setIsLeaveProjectOpen]    = useState(false);
  const [leavingProject,        setLeavingProject]        = useState(false);

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
  const [inviteRoleDropdownOpen, setInviteRoleDropdownOpen] = useState(false);
  const [inviteError,   setInviteError]   = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  // New subtask
  const [newSubtask,    setNewSubtask]    = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

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
  const isOwner = members.length === 0
    ? true
    : myMembership?.status === 'owner';
  const canEdit = members.length === 0
    ? true   // fallback: endpoint members belum tersedia → izinkan semua
    : isOwner;

  const canDragTask = (task) => {
    if (members.length === 0) return true;
    if (isOwner) return true;
    if (myMembership?.status === 'member' && String(task.id_user) === String(user.id_user)) return true;
    return false;
  };

  // ── Add task ────────────────────────────────────────────────────────────────
  async function handleAddTask(e) {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      // Gunakan id_user dari form, jika kosong berarti unassigned
      const targetUserId = addForm.id_user ? Number(addForm.id_user) : null;

      console.log('[Board] handleAddTask → id_user dipilih:', addForm.id_user, '→ Number:', targetUserId);
      console.log('[Board] user dari localStorage:', user);
      console.log('[Board] addForm:', addForm);

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
      setAddForm({ name: '', description: '', id_user: '', deadline: '', status: 'to do' });

      // Optimistic update: langsung tambah ke state agar muncul seketika
      const normalizedStatus = (data.status || payload.status || 'to do').trim().toLowerCase();
      const newTask = {
        ...data,
        status: normalizedStatus,
        username: data.username
          || (targetUserId ? members.find(m => String(m.id_user) === String(targetUserId))?.username : 'Unassigned')
          || 'Unassigned',
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
    if (!canEdit) {
      setPermissionAlertMessage("Hanya Owner yang dapat menambahkan tugas baru.");
      setIsPermissionAlertOpen(true);
      return;
    }
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
      id_user:     task.id_user ? String(task.id_user) : '',
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
          id_user:     manageForm.id_user ? Number(manageForm.id_user) : null,
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

  // ── Manage member ───────────────────────────────────────────────────────────
  async function handleUpdateMemberStatus(id_member, newStatus) {
    try {
      const res = await fetch(`/api/members/${id_member}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengubah role');
      }
      setMembers(members.map(m => m.id_member === id_member ? { ...m, status: newStatus } : m));
    } catch (e) {
      alert(e.message);
    }
  }

  async function confirmRemoveMember() {
    if (!memberToRemove) return;
    try {
      const res = await fetch(`/api/members/${memberToRemove.id_member}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus anggota');
      }
      
      const removedUserId = memberToRemove.id_user;
      
      setMembers(members.filter(m => m.id_member !== memberToRemove.id_member));
      
      // Optimistically unassign tasks for the removed member
      setTasks(prevTasks => prevTasks.map(t => 
        String(t.id_user) === String(removedUserId) 
          ? { ...t, id_user: null, username: 'Unassigned' } 
          : t
      ));

      setMemberToRemove(null);
    } catch (e) {
      alert(e.message);
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

  // ── Leave Project ───────────────────────────────────────────────────────────
  async function handleLeaveProject() {
    if (!myMembership) return;
    
    setLeavingProject(true);
    try {
      const res = await fetch(`/api/members/${myMembership.id_member}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Gagal keluar dari proyek');
      
      router.push('/dashboard');
    } catch (e) {
      alert(e.message);
      setLeavingProject(false);
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

    // Check drag permissions
    const taskToMoveCheck = tasks.find(t => String(t.id_task) === draggableId);
    if (taskToMoveCheck && !canDragTask(taskToMoveCheck)) {
      setPermissionAlertMessage('Anda tidak memiliki izin untuk memindahkan tugas ini karena tugas ini ditugaskan kepada anggota lain.');
      setIsPermissionAlertOpen(true);
      return;
    }

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
    <div className="bg-white text-slate-800 font-sans min-h-screen flex flex-col relative overflow-hidden">
      {/* BEGIN: Background Elements (Orbs + Dot Grid) */}
      <div className="absolute top-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#2ecfb4] opacity-[0.08] blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400 opacity-[0.04] blur-[120px] pointer-events-none z-0"></div>
      
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(148, 163, 184, 0.25) 1.5px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      ></div>
      {/* END: Background Elements */}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <SharedNavbar />

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-[1600px] mx-auto w-full px-4 md:px-8 pt-10 flex-1 flex flex-col">

        {/* Project Header */}
        <section className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-slate-200 pb-4">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-3xl font-bold mb-1 text-slate-900 tracking-tight">{project?.name}</h2>
            <p className="text-slate-700 text-sm font-medium">{project?.description || ''}</p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Anggota Tim */}
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="bg-white border border-slate-200 hover:border-[#2ecfb4]/50 hover:bg-slate-50 text-slate-700 font-bold py-2 px-5 rounded-full flex items-center gap-3 transition-all shadow-sm"
            >
              <span className="text-sm">Anggota Tim</span>
              <div className="flex -space-x-2">
                {members.slice(0, 4).map(m => (
                  <div key={m.id_member} title={m.username}
                    className={`w-6 h-6 rounded-full border border-white flex items-center justify-center text-[10px] font-bold shadow-sm
                      ${m.status === 'owner' ? 'bg-[#2ecfb4]/20 text-[#2ecfb4]' : 'bg-slate-200 text-slate-600'}`}>
                    {getInitials(m.username)}
                  </div>
                ))}
              </div>
            </button>

            {/* ── TAMBAH KARTU ── */}
            <button
              onClick={openAddModal}
              className={`border border-transparent font-bold py-2 px-6 rounded-full flex items-center gap-2 transition-all shadow-[0_4px_14px_rgba(46,207,180,0.3)] transform 
                ${canEdit 
                  ? 'bg-[#2ecfb4] hover:bg-[#25b59d] text-white hover:shadow-[0_6px_20px_rgba(46,207,180,0.4)] hover:-translate-y-0.5' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'}`}
            >
              <span className="text-lg leading-none font-medium">+</span>
              <span className="text-sm">Tambah Kartu</span>
            </button>
          </div>
        </section>

        {/* Kanban Board */}
        <section className="gap-6 pb-8 flex overflow-x-auto snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible lg:snap-none flex-1 -mx-4 px-4 md:-mx-8 md:px-8">
          <DragDropContext onDragEnd={onDragEnd}>
          {STATUS_COLS.map(status => {
            const isOver = status === 'overdue';
            return (
              <div key={status}
                className={`${isOver ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-100'} rounded-[24px] p-5 shrink-0 w-[85vw] sm:w-[320px] lg:w-auto snap-center shadow-sm border flex flex-col h-full min-w-0`}>
                <h3 className={`font-bold text-sm tracking-widest pb-3 mb-4 uppercase
                  ${isOver ? 'border-red-200 text-red-500' : 'border-slate-200 text-slate-600'}`}>
                  {STATUS_LABELS[status]}
                </h3>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col gap-3 flex-1 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'ring-2 ring-slate-200 bg-slate-100/50' : ''}`}
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
                            isDragDisabled={isOver}
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

      {/* FAB Hapus Proyek */}
      <button
        aria-label="Hapus Proyek"
        onClick={() => setIsDeleteProjectOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-white border border-red-100 hover:border-red-200 hover:bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgb(0,0,0,0.05)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.08)] transition-all z-40 group"
        title="Hapus Proyek"
      >
        <svg className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>


      {/* ════════════════════════════════════════════════════
           MODAL: Tambah Kartu Tugas
         ════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div aria-modal="true" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex justify-center items-center p-4" role="dialog">
          <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl w-full max-w-[500px] flex flex-col relative max-h-[90vh] overflow-hidden">
            
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tambah Kartu</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Buat tugas baru untuk proyek ini</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-8 overflow-y-auto">
              {addError && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {addError}
                </div>
              )}

              <form onSubmit={handleAddTask} className="flex flex-col gap-6">
                
                {/* Nama Tugas */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Nama Tugas</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2ecfb4]/50 focus:border-[#2ecfb4] text-slate-800 placeholder-slate-300 transition-all duration-200 text-sm font-semibold shadow-sm"
                    placeholder="Contoh: Desain halaman login..."
                    value={addForm.name}
                    onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Deskripsi</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2ecfb4]/50 focus:border-[#2ecfb4] text-slate-800 placeholder-slate-300 transition-all duration-200 text-sm font-medium resize-none min-h-[100px] shadow-sm"
                    placeholder="Tambahkan detail tugas..."
                    value={addForm.description}
                    onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                {/* Ditugaskan Ke */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Ditugaskan Ke</label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2ecfb4]/50 focus:border-[#2ecfb4] text-slate-800 transition-all duration-200 text-sm font-bold appearance-none shadow-sm cursor-pointer"
                      value={addForm.id_user}
                      onChange={e => setAddForm(f => ({ ...f, id_user: e.target.value }))}
                    >
                      <option value="" className="text-slate-400">-- Unassigned --</option>
                      {members.length > 0
                        ? members.map(m => (
                            <option key={m.id_user} value={m.id_user}>{m.username}</option>
                          ))
                        : (
                            <option value={user.id_user}>{user.username || 'Saya'}</option>
                          )
                      }
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                  </div>
                </div>

                {/* Batas Waktu & Status (Grid 2 column) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Batas Waktu</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2ecfb4]/50 focus:border-[#2ecfb4] text-slate-800 transition-all duration-200 text-sm font-bold shadow-sm cursor-pointer"
                      value={addForm.deadline}
                      onChange={e => setAddForm(f => ({ ...f, deadline: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Status Awal</label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#2ecfb4]/50 focus:border-[#2ecfb4] text-slate-800 transition-all duration-200 text-sm font-bold appearance-none shadow-sm cursor-pointer"
                        value={addForm.status}
                        onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}
                      >
                        <option value="to do">TO-DO</option>
                        <option value="doing">DOING</option>
                        <option value="done">DONE</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-6 mt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold transition-colors text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="px-6 py-2.5 rounded-xl bg-[#2ecfb4] hover:bg-[#25b59d] text-white font-bold transition-all duration-200 shadow-[0_4px_14px_rgba(46,207,180,0.3)] hover:shadow-[0_6px_20px_rgba(46,207,180,0.4)] disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                  >
                    {addLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Tugas'
                    )}
                  </button>
                </div>
              </form>
            </div>
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
                      <div className="flex items-center gap-2">
                        {isOwner && m.status !== 'owner' ? (
                          <>
                            <div className="relative">
                              <select
                                value={m.status}
                                onChange={(e) => handleUpdateMemberStatus(m.id_member, e.target.value)}
                                className="px-4 py-1.5 pr-8 text-xs font-bold rounded-full border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#2ecfb4] focus:border-[#2ecfb4] cursor-pointer appearance-none transition-colors hover:bg-slate-50"
                              >
                                <option value="member">Anggota</option>
                                <option value="viewer">Penonton</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                              </div>
                            </div>
                            <button
                              onClick={() => setMemberToRemove(m)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-red-500 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                              title="Hapus Anggota"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        ) : (
                          <span className={`px-4 py-1.5 text-xs font-bold rounded-full border shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center min-w-[80px]
                            ${m.status === 'owner' ? 'bg-[#2ecfb4] border-[#25b59d] text-white' : 'bg-white/80 border-slate-200 text-slate-700'}`}>
                            {m.status === 'owner' ? 'Pemilik' : m.status === 'member' ? 'Anggota' : 'Penonton'}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              
              {/* Keluar dari Proyek (hanya untuk non-owner) */}
              {!isOwner && myMembership && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setIsLeaveProjectOpen(true)}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold py-2.5 px-6 rounded-full flex items-center transition-all shadow-sm text-sm"
                  >
                    Keluar Proyek
                  </button>
                </div>
              )}
            </div>

            {isOwner && (
              <div className="p-6 bg-white/60 border-t border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Undang Anggota Baru :</label>
                {inviteError && <p className="text-red-500 text-sm mb-2 font-bold">{inviteError}</p>}
                <form onSubmit={handleInvite} className="flex flex-row w-full items-stretch bg-white border border-slate-200 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus-within:ring-2 focus-within:ring-[#2ecfb4]/50 focus-within:border-[#2ecfb4] transition-all duration-300">
                  
                  {/* 65% Email Input */}
                  <div className="w-[65%] flex items-center relative">
                    <input
                      className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium rounded-l-xl"
                      placeholder="Masukkan Email..."
                      type="email"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      required
                    />
                    {/* Vertical Divider inside input container to keep percentages clean */}
                    <div className="absolute right-0 h-6 w-px bg-slate-200"></div>
                  </div>

                  {/* 25% Role Select */}
                  <div className="w-[25%] flex items-center pr-2 relative">
                    <button
                      type="button"
                      onClick={() => setInviteRoleDropdownOpen(!inviteRoleDropdownOpen)}
                      className="w-full flex items-center justify-between px-2 py-3 bg-transparent border-none focus:outline-none text-slate-700 text-sm font-bold cursor-pointer hover:text-[#2ecfb4] transition-colors"
                    >
                      <div className="flex items-center space-x-1.5 min-w-0">
                        {inviteRole === 'member' ? (
                          <svg className="w-4 h-4 flex-shrink-0 text-[#2ecfb4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        ) : (
                          <svg className="w-4 h-4 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                        <span className="truncate">{inviteRole === 'member' ? 'Anggota' : 'Penonton'}</span>
                      </div>
                      <svg className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${inviteRoleDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {/* Dropdown Menu */}
                    {inviteRoleDropdownOpen && (
                      <div className="absolute bottom-[115%] left-0 w-[180px] bg-white border border-slate-100 rounded-xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-2 z-50 overflow-hidden transform opacity-100 scale-100 origin-bottom-left transition-all">
                        <button
                          type="button"
                          onClick={() => { setInviteRole('member'); setInviteRoleDropdownOpen(false); }}
                          className={`w-full flex items-center px-4 py-3 text-sm font-bold transition-colors ${inviteRole === 'member' ? 'bg-teal-50 text-[#2ecfb4]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                          <svg className={`w-4 h-4 mr-3 flex-shrink-0 ${inviteRole === 'member' ? 'text-[#2ecfb4]' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                          Anggota
                        </button>
                        <button
                          type="button"
                          onClick={() => { setInviteRole('viewer'); setInviteRoleDropdownOpen(false); }}
                          className={`w-full flex items-center px-4 py-3 text-sm font-bold transition-colors ${inviteRole === 'viewer' ? 'bg-teal-50 text-[#2ecfb4]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                          <svg className={`w-4 h-4 mr-3 flex-shrink-0 ${inviteRole === 'viewer' ? 'text-[#2ecfb4]' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          Penonton
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 10% Paper Plane Button */}
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="w-[10%] flex items-center justify-center bg-[#2ecfb4] hover:bg-[#25b59d] text-white transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed group p-0 rounded-r-xl"
                  >
                    {inviteLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 flex-shrink-0 transform rotate-90 group-hover:translate-x-1 transition-transform duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                      </svg>
                    )}
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
                          <option value="">-- Unassigned --</option>
                          {members.length > 0
                            ? members.map(m => (
                                <option key={m.id_user} value={m.id_user} className="text-gray-900">{m.username}</option>
                              ))
                            : selectedTask.id_user && <option value={selectedTask.id_user} className="text-gray-900">{selectedTask.username}</option>
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
                              onClick={() => canEdit && toggleSubtask(sub)}
                              className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors shadow-sm
                                ${sub.status === 'done' ? 'bg-[var(--color-primary)] border-teal-500' : 'border-slate-300 bg-white'}
                                ${!canEdit ? 'cursor-default' : ''}`}
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
                            {canEdit && (
                              <button type="button" onClick={() => deleteSubtask(sub.id_subtask)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {canEdit && (
                      subtasks.length < 5 ? (
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
                      )
                    )}
                  </div>
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
          <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden transform transition-all relative">
            
            {/* Top Accent Pattern */}
            <div className="h-32 bg-red-50/60 w-full absolute top-0 left-0 rounded-t-[2rem]"></div>

            <div className="p-8 pb-6 text-center relative mt-4 z-10">
              {/* Icon Container with glowing effect */}
              <div className="w-16 h-16 bg-red-100 border-4 border-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_15px_rgba(239,68,68,0.15)] relative">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Hapus Proyek?</h2>
              
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Proyek "<strong className="text-slate-700">{project?.name}</strong>" beserta semua tugas dan subtask akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="px-6 py-5 flex flex-col sm:flex-row gap-3 justify-center items-center bg-slate-50/80 border-t border-slate-100 relative z-10">
              <button
                onClick={() => setIsDeleteProjectOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 font-bold transition-colors text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteProject}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] border border-transparent text-sm"
              >
                Hapus Proyek
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
           MODAL: Konfirmasi Hapus Anggota
         ════════════════════════════════════════════════════ */}
      {memberToRemove && (
        <div aria-modal="true" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex justify-center items-center p-4" role="dialog">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden transform transition-all relative">
            
            {/* Top Accent Pattern */}
            <div className="h-32 bg-red-50/60 w-full absolute top-0 left-0 rounded-t-[2rem]"></div>

            <div className="p-8 pb-6 text-center relative mt-4 z-10">
              {/* Icon Container with glowing effect */}
              <div className="w-16 h-16 bg-red-100 border-4 border-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_15px_rgba(239,68,68,0.15)] relative">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Hapus Anggota?</h2>
              
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Apakah Anda yakin ingin menghapus <strong className="text-slate-700">{memberToRemove.username}</strong> dari proyek ini?
              </p>
            </div>

            <div className="px-6 py-5 flex flex-col sm:flex-row gap-3 justify-center items-center bg-slate-50/80 border-t border-slate-100 relative z-10">
              <button
                onClick={() => setMemberToRemove(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 font-bold transition-colors text-sm"
              >
                Batal
              </button>
              <button
                onClick={confirmRemoveMember}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] border border-transparent text-sm"
              >
                Hapus Anggota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
           MODAL: Permission Alert (Drag & Drop)
         ════════════════════════════════════════════════════ */}
      {isPermissionAlertOpen && (
        <div aria-modal="true" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex justify-center items-center p-4" role="dialog">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden transform transition-all relative">
            
            <div className="h-32 bg-amber-50/60 w-full absolute top-0 left-0 rounded-t-[2rem]"></div>

            <div className="p-8 pb-6 text-center relative mt-4 z-10">
              <div className="w-16 h-16 bg-amber-100 border-4 border-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_15px_rgba(245,158,11,0.15)] relative">
                <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Akses Ditolak</h2>
              
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                {permissionAlertMessage}
              </p>
            </div>

            <div className="px-6 py-5 flex justify-center items-center bg-slate-50/80 border-t border-slate-100 relative z-10">
              <button
                onClick={() => setIsPermissionAlertOpen(false)}
                className="w-full px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-[0_4px_14px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] border border-transparent text-sm"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
           MODAL: Konfirmasi Keluar Proyek
         ════════════════════════════════════════════════════ */}
      {isLeaveProjectOpen && (
        <div aria-modal="true" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex justify-center items-center p-4" role="dialog">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden transform transition-all relative">
            
            <div className="h-32 bg-red-50/60 w-full absolute top-0 left-0 rounded-t-[2rem]"></div>

            <div className="p-8 pb-6 text-center relative mt-4 z-10">
              <div className="w-16 h-16 bg-red-100 border-4 border-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_15px_rgba(239,68,68,0.15)] relative">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Keluar Proyek?</h2>
              
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Apakah Anda yakin ingin keluar dari proyek <strong className="text-slate-700">{project?.name}</strong>?
              </p>
            </div>

            <div className="px-6 py-5 flex flex-col sm:flex-row gap-3 justify-center items-center bg-slate-50/80 border-t border-slate-100 relative z-10">
              <button
                onClick={() => setIsLeaveProjectOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 font-bold transition-colors text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleLeaveProject}
                disabled={leavingProject}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] border border-transparent disabled:opacity-50 text-sm"
              >
                {leavingProject ? 'Keluar...' : 'Keluar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}