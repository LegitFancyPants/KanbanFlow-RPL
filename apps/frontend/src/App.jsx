import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Board from './pages/Board';

// Sudah login → tidak boleh akses /login atau /signup, redirect ke dashboard
function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
}

// Belum login → tidak boleh akses halaman protected, redirect ke login
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/dashboard"        element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/projects"         element={<PrivateRoute><Projects /></PrivateRoute>} />
      <Route path="/board/:projectId" element={<PrivateRoute><Board /></PrivateRoute>} />
      {/* fallback redirect */}
      <Route path="/board" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}

export default App;