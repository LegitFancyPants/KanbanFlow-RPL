const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

// Import routes
const usersRoute = require('./routes/users');
const projectsRoute = require('./routes/projects');
const tasksRoute = require('./routes/tasks');
const subtasksRoute = require('./routes/subtasks');
const membersRoute = require('./routes/members');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check & database connection test
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Database connected!',
      timestamp: result.rows[0],
      status: 'ok'
    });
  } catch (err) {
    res.status(500).json({ 
      error: err.message,
      status: 'error'
    });
  }
});

// Routes
app.use('/api/users', usersRoute);
app.use('/api/projects', projectsRoute);
app.use('/api/tasks', tasksRoute);
app.use('/api/subtasks', subtasksRoute);
app.use('/api/members', membersRoute);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`\n API Endpoints:`);
  console.log(`  - Users: /api/users`);
  console.log(`  - Projects: /api/projects`);
  console.log(`  - Tasks: /api/tasks`);
  console.log(`  - Subtasks: /api/subtasks`);
  console.log(`  - Members: /api/members`);
});
