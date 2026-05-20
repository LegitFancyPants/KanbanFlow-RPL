const pool = require('../db');

// Get user role dalam project tertentu
async function getUserRoleInProject(id_user, id_project) {
  try {
    const result = await pool.query(
      `SELECT status FROM members 
       WHERE id_user = $1 AND id_project = $2`,
      [id_user, id_project]
    );
    
    return result.rows.length > 0 ? result.rows[0].status : null;
  } catch (err) {
    throw err;
  }
}

// Check apakah user adalah owner dari project
async function isProjectOwner(id_user, id_project) {
  try {
    const result = await pool.query(
      `SELECT created_by FROM projects WHERE id_project = $1`,
      [id_project]
    );
    
    if (result.rows.length === 0) return false;
    return result.rows[0].created_by === id_user;
  } catch (err) {
    throw err;
  }
}

// Check apakah user memiliki akses terhadap project
async function hasProjectAccess(id_user, id_project) {
  try {
    const role = await getUserRoleInProject(id_user, id_project);
    const isOwner = await isProjectOwner(id_user, id_project);
    
    return role !== null || isOwner;
  } catch (err) {
    throw err;
  }
}

// Check apakah user dapat create/edit task di project
async function canManageTask(id_user, id_project) {
  try {
    const isOwner = await isProjectOwner(id_user, id_project);
    const role = await getUserRoleInProject(id_user, id_project);
    
    // Owner dan Member dapat manage task
    return isOwner || role === 'member';
  } catch (err) {
    throw err;
  }
}

// Check apakah user adalah Viewer
async function isViewer(id_user, id_project) {
  try {
    const role = await getUserRoleInProject(id_user, id_project);
    return role === 'viewer';
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getUserRoleInProject,
  isProjectOwner,
  hasProjectAccess,
  canManageTask,
  isViewer
};
