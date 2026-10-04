// backend/server.js
const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON bodies from frontend

// --- ROUTES ---

// 1. GET all projects
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error fetching projects' });
  }
});

// 2. POST a new project
app.post('/api/projects', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Using parameterized queries ($1, $2) prevents SQL Injection attacks!
    const newProject = await pool.query(
      'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );

    res.status(201).json(newProject.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error creating project' });
  }
});

// 5. PUT (Update) an issue's status
app.put('/api/issues/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects 'TODO', 'IN_PROGRESS', or 'DONE'

    const updatedIssue = await pool.query(
      'UPDATE issues SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (updatedIssue.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json(updatedIssue.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error updating issue' });
  }
});
// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// --- ISSUE ROUTES ---

// 3. GET all issues for a specific project
app.get('/api/projects/:projectId/issues', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      'SELECT * FROM issues WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error fetching issues' });
  }
});

// 4. POST a new issue to a project
app.post('/api/projects/:projectId/issues', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description } = req.body;
    
    // We default the status to 'TODO' when a new ticket is created
    const newIssue = await pool.query(
      'INSERT INTO issues (title, description, project_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description || '', projectId, 'TODO']
    );

    res.status(201).json(newIssue.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error creating issue' });
  }
});