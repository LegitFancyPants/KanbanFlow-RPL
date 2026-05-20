const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all members
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id_member, m.status, u.id_user, u.username, p.id_project, p.name as project_name 
       FROM members m 
       JOIN users u ON m.id_user = u.id_user 
       JOIN projects p ON m.id_project = p.id_project`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET members by project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      `SELECT m.id_member, m.status, u.id_user, u.username, u.email 
       FROM members m 
       JOIN users u ON m.id_user = u.id_user 
       WHERE m.id_project = $1`,
      [projectId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET members by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT m.id_member, m.status, p.id_project, p.name as project_name 
       FROM members m 
       JOIN projects p ON m.id_project = p.id_project 
       WHERE m.id_user = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE member
router.post('/', async (req, res) => {
  try {
    const { id_user, id_project, status = 'member' } = req.body;
    const result = await pool.query(
      'INSERT INTO members (id_user, id_project, status) VALUES ($1, $2, $3) RETURNING *',
      [id_user, id_project, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE member
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE members SET status = $1 WHERE id_member = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM members WHERE id_member = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ message: 'Member deleted', member: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
