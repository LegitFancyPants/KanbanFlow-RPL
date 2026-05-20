const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all subtasks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subtasks');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET subtask by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM subtasks WHERE id_subtask = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subtask not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET subtasks by task
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await pool.query('SELECT * FROM subtasks WHERE id_task = $1', [taskId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE subtask
router.post('/', async (req, res) => {
  try {
    const { name, id_task, status = 'doing' } = req.body;
    const result = await pool.query(
      'INSERT INTO subtasks (name, id_task, status) VALUES ($1, $2, $3) RETURNING *',
      [name, id_task, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE subtask
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    const result = await pool.query(
      'UPDATE subtasks SET name = $1, status = $2 WHERE id_subtask = $3 RETURNING *',
      [name, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subtask not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE subtask
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM subtasks WHERE id_subtask = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subtask not found' });
    }
    res.json({ message: 'Subtask deleted', subtask: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
