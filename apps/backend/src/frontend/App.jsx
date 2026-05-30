"use client";
import React from 'react';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Board from './pages/Board';

import { getToken } from '@/frontend/utils/auth';

// Sudah login → tidak boleh akses /login atau /signup, redirect ke dashboard
function PublicRoute({ children }) {
  const token = getToken();
  return token ? <Navigate href="/dashboard" replace /> : children;
}

// Belum login → tidak boleh akses halaman protected, redirect ke login
function PrivateRoute({ children }) {
  const token = getToken();
  return token ? children : <Navigate href="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate href="/login" replace />} />
      <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/dashboard"        element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/projects"         element={<PrivateRoute><Projects /></PrivateRoute>} />
      <Route path="/board/:projectId" element={<PrivateRoute><Board /></PrivateRoute>} />
      {/* fallback redirect */}
      <Route path="/board" element={<Navigate href="/projects" replace />} />
    </Routes>
  );
}

export default App;