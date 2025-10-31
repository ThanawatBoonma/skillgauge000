// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());
app.use(cors());

// create pool using env vars
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '1234',
  database: process.env.DB_NAME || 'dbweb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.post('/api/register', 
  // validation
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('username').notEmpty().withMessage('Username required'),
  body('role').isIn(['worker','foreman','project_manager']).withMessage('Invalid role'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { full_name, email, phone, role, username, password } = req.body;

    try {
      // Check duplicate email or username
      const [dupEmail] = await pool.query('SELECT id FROM dbuser WHERE email = ?', [email]);
      if (dupEmail.length) return res.status(409).json({ error: 'Email already registered' });

      const [dupUser] = await pool.query('SELECT id FROM dbuser WHERE username = ?', [username]);
      if (dupUser.length) return res.status(409).json({ error: 'Username already taken' });

      // Hash password
      const hash = await bcrypt.hash(password, 12);

      // Insert user into dbuser
      const sql = `INSERT INTO dbuser (name, email, phone, role, username, password) VALUES (?, ?, ?, ?, ?, ?)`;
      const [result] = await pool.query(sql, [full_name, email, phone, role, username, hash]);

      // return new user id (no password)
      res.status(201).json({ id: result.insertId, email, username, role });
    } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

app.get('/', (req, res) => res.send('API is running'));
