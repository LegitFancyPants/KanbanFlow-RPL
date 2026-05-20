const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all projects
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id_project, p.name, p.created_by, u.username 
       FROM projects p 
       JOIN users u ON p.created_by = u.id_user`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET project by ID with members and tasks
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await pool.query(
      `SELECT p.id_project, p.name, p.created_by, u.username 
       FROM projects p 
       JOIN users u ON p.created_by = u.id_user 
       WHERE p.id_project = $1`,
      [id]
    );
    
    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const members = await pool.query(
      `SELECT m.id_member, m.status, u.id_user, u.username 
       FROM members m 
       JOIN users u ON m.id_user = u.id_user 
       WHERE m.id_project = $1`,
      [id]
    );
    
    const tasks = await pool.query(
      `SELECT id_task, name, status, created_at 
       FROM tasks 
       WHERE id_project = $1`,
      [id]
    );
    
    res.json({
      project: project.rows[0],
      members: members.rows,
      tasks: tasks.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE project
router.post('/', async (req, res) => {
  try {
    const { name, created_by } = req.body;
    const result = await pool.query(
      'INSERT INTO projects (name, created_by) VALUES ($1, $2) RETURNING *',
      [name, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query(
      'UPDATE projects SET name = $1 WHERE id_project = $2 RETURNING *',
      [name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM projects WHERE id_project = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted', project: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
