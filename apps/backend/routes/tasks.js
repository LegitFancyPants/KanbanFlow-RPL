const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id_task, t.name, t.status, t.created_at, t.id_project, u.username 
       FROM tasks t 
       JOIN users u ON t.id_user = u.id_user 
       ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET task by ID with subtasks
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await pool.query(
      `SELECT t.id_task, t.name, t.status, t.created_at, t.id_project, u.username, u.id_user 
       FROM tasks t 
       JOIN users u ON t.id_user = u.id_user 
       WHERE t.id_task = $1`,
      [id]
    );
    
    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const subtasks = await pool.query(
      'SELECT id_subtask, name, status FROM subtasks WHERE id_task = $1',
      [id]
    );
    
    res.json({
      task: task.rows[0],
      subtasks: subtasks.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET tasks by project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      `SELECT t.id_task, t.name, t.status, t.created_at, u.username 
       FROM tasks t 
       JOIN users u ON t.id_user = u.id_user 
       WHERE t.id_project = $1 
       ORDER BY t.created_at DESC`,
      [projectId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE task
router.post('/', async (req, res) => {
  try {
    const { name, id_project, id_user, status = 'to do' } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (name, id_project, id_user, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, id_project, id_user, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    const result = await pool.query(
      'UPDATE tasks SET name = $1, status = $2 WHERE id_task = $3 RETURNING *',
      [name, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id_task = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted', task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
