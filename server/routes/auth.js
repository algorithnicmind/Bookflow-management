const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, createDefaultBalances } = require('../db/database');
const { authenticateToken, requireRole, JWT_SECRET, JWT_EXPIRES_IN } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM employees WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated. Contact your administrator.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/register
 * Register a new employee (Admin only)
 */
router.post('/register', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { name, email, password, role, department, manager_id } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    if (!['employee', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be employee, manager, or admin' });
    }

    const db = getDb();

    // Check duplicate email
    const existing = db.prepare('SELECT id FROM employees WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const result = db.prepare(`
      INSERT INTO employees (name, email, password_hash, role, manager_id, department)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, email, passwordHash, role, manager_id || null, department || 'General');

    // Create default leave balances
    createDefaultBalances(result.lastInsertRowid, new Date().getFullYear());

    res.status(201).json({
      message: 'Employee registered successfully',
      employee: {
        id: result.lastInsertRowid,
        name,
        email,
        role,
        department: department || 'General'
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
