const pool = require('../db');

// Middleware untuk verifikasi authorization berdasarkan role
const authorizeProjectAccess = async (req, res, next) => {
  try {
    const { id_project } = req.params || req.body;
    const id_user = req.user.id_user;
    
    if (!id_project) {
      return res.status(400).json({ error: 'Project ID tidak ditemukan' });
    }
    
    // Check apakah user adalah owner atau member dari project
    const memberResult = await pool.query(
      `SELECT status FROM members WHERE id_user = $1 AND id_project = $2`,
      [id_user, id_project]
    );
    
    const projectResult = await pool.query(
      `SELECT created_by FROM projects WHERE id_project = $1`,
      [id_project]
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project tidak ditemukan' });
    }
    
    const isOwner = projectResult.rows[0].created_by === id_user;
    const isMember = memberResult.rows.length > 0;
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke project ini' });
    }
    
    // Simpan role di req untuk digunakan di route handler
    if (isMember) {
      req.userRole = memberResult.rows[0].status;
    } else {
      req.userRole = 'owner';
    }
    
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Middleware untuk verifikasi apakah user adalah owner atau member (dapat manage)
const authorizeTaskManagement = async (req, res, next) => {
  try {
    const { id_project } = req.params;
    const id_user = req.user.id_user;
    
    if (!id_project) {
      return res.status(400).json({ error: 'Project ID tidak ditemukan' });
    }
    
    // Check role
    const memberResult = await pool.query(
      `SELECT status FROM members WHERE id_user = $1 AND id_project = $2`,
      [id_user, id_project]
    );
    
    const projectResult = await pool.query(
      `SELECT created_by FROM projects WHERE id_project = $1`,
      [id_project]
    );
    
    const isOwner = projectResult.rows[0]?.created_by === id_user;
    const role = memberResult.rows[0]?.status;
    
    // Hanya owner dan member yang dapat manage task
    if (!isOwner && role !== 'member') {
      return res.status(403).json({ error: 'Anda tidak memiliki izin untuk mengelola task di project ini' });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  authorizeProjectAccess,
  authorizeTaskManagement
};
