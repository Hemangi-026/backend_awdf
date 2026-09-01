const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// ==================== POST /register ====================
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required',
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'A user with that email already exists',
      });
    }

    // Never store the plain password — bcrypt hashes it with an automatic salt.
    // bcrypt is intentionally slow, which makes brute-forcing a leaked hash impractical.
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ email, password: hashedPassword });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { id: user._id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});
// ==================== END POST /register ====================

// ==================== POST /login ====================
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Same generic message as a wrong password — don't reveal which part was wrong
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
    });
  } catch (err) {
    next(err);
  }
});
// ==================== END POST /login ====================

// ==================== GET /me (supplementary) ====================
router.get('/me', auth, async (req, res, next) => {
  try {
    // req.user was set by the auth middleware after verifying the JWT
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});
// ==================== END GET /me ====================

module.exports = router;
