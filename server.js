require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Task = require('./models/Tasks');
const authRoutes = require('./routes/auth');
const auth = require('./middleware/auth');
const validateTaskInput = require('./middleware/validateTaskInput');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ================================
// 1. DATABASE CONNECTION
// ================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.error('MongoDB Connection Error:', err.message));

// ================================
// 2. AUTH ROUTES (public — no token needed to register/login)
// ================================
app.use('/', authRoutes); // exposes POST /register, POST /login, GET /me

// ================================
// 3. TASK ROUTES (protected — auth middleware runs first on every one)
// ================================

// GET /tasks - Fetch all tasks
app.get('/tasks', auth, async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id - Fetch single task
app.get('/tasks/:id', auth, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// POST /tasks - Create a new task
app.post('/tasks', auth, validateTaskInput, async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id - Update a task
app.put('/tasks/:id', auth, validateTaskInput, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', auth, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ================================
// 4. ERROR HANDLER (must stay last)
// ================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid task ID format' });
  }
  res.status(500).json({ success: false, message: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
