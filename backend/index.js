// backend/index.js

require('dotenv').config();

const crypto = require('crypto');

const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const mysql = require('mysql2/promise');

app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '1234',
  database: process.env.DB_NAME || 'dbweb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; 

//  Register endpoint 
app.post('/api/register',
  // validation
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('username').notEmpty().withMessage('Username required'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { full_name, email, phone, username, password, birthday } = req.body;
    const role = 'worker'; // บังคับเป็น worker

    try {
      // Check duplicate email or username
      const [dupEmail] = await pool.query('SELECT id FROM dbuser WHERE email = ?', [email]);
      if (dupEmail.length) return res.status(409).json({ error: 'Email already registered' });

      const [dupUser] = await pool.query('SELECT id FROM dbuser WHERE username = ?', [username]);
      if (dupUser.length) return res.status(409).json({ error: 'Username already taken' });

      // Hash password
      const hash = bcrypt.hashSync(password, 12);

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

// Login (Email + Password only)
app.post('/api/auth/login',
  body('email').isEmail().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      // ค้นหา user ด้วย email
      const [rows] = await pool.query(
        'SELECT id, name, email, username, phone, role, password FROM dbuser WHERE email = ? LIMIT 1',
        [email]
      );

      if (!rows.length)
        return res.status(401).json({ error: 'Invalid email or password' });

      const user = rows[0];

      // ตรวจสอบ password
      const match = bcrypt.compareSync(password, user.password || '');
      if (!match)
        return res.status(401).json({ error: 'Invalid email or password' });

      // role เป็น string เดี่ยว เช่น "worker"
      // หรือถ้าเก็บเป็นหลาย role ด้วย comma ก็รองรับเหมือนเดิม
      let roles = [];
      if (user.role)
        roles = Array.isArray(user.role)
          ? user.role
          : String(user.role).split(',').map(r => r.trim()).filter(Boolean);

      // สร้าง JWT
      const payload = { 
        id: user.id,
        email: user.email,
        username: user.username,
        roles 
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      });

      // ส่งกลับข้อมูล user
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          phone: user.phone,
          roles
        }
      });

    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

//  Helpers 
function uuidHex() {
  return crypto.randomBytes(16).toString('hex'); // 32-char hex, ใช้เป็น session id
}

// questions structural
app.get('/api/questions/structural', async (req, res) => {
  try {
    const set_no = parseInt(req.query.set_no, 10) || 1;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const per_page = Math.max(1, parseInt(req.query.per_page, 10) || 20);
    const sessionId = req.query.sessionId || null;

    // if sessionId not provided -> create one and pick 60 random questions
    let session = null;
    if (!sessionId) {
      // select 60 random ids from question_Structural for set_no
      const [rows] = await pool.query(
        'SELECT id FROM question_Structural WHERE set_no = ? ORDER BY RAND() LIMIT 60',
        [set_no]
      );
      if (!rows.length) return res.status(404).json({ error: 'No questions found for set_no' });

      const qids = rows.map(r => r.id);
      const newSessionId = uuidHex();
      await pool.query(
        'INSERT INTO exam_sessions (id, set_no, question_ids) VALUES (?, ?, ?)',
        [newSessionId, set_no, JSON.stringify(qids)]
      );
      session = { id: newSessionId, question_ids: qids };
    } else {
      // load session from DB
      const [sessRows] = await pool.query('SELECT id, question_ids FROM exam_sessions WHERE id = ? LIMIT 1', [sessionId]);
      if (!sessRows.length) return res.status(404).json({ error: 'Session not found' });
      session = sessRows[0];
      // ensure question_ids parsed array
      try {
        session.question_ids = typeof session.question_ids === 'string' ? JSON.parse(session.question_ids) : session.question_ids;
      } catch (e) {
        return res.status(500).json({ error: 'Invalid session data' });
      }
    }

    const total = session.question_ids.length;
    const totalPages = Math.max(1, Math.ceil(total / per_page));
    const pageIndex = Math.min(totalPages, page) - 1;
    const start = pageIndex * per_page;
    const end = Math.min(total, start + per_page);
    const pageIds = session.question_ids.slice(start, end);

    if (!pageIds.length) {
      return res.json({
        sessionId: session.id,
        page,
        per_page,
        total,
        totalPages,
        questions: []
      });
    }

    // ดึงคำถามจาก DB
    const placeholders = pageIds.map(() => '?').join(',');
    const [qrows] = await pool.query(
      `SELECT id, question_text, choice_a, choice_b, choice_c, choice_d
         FROM question_Structural WHERE id IN (${placeholders})`,
      pageIds
    );

    // map rows by id
    const qmap = {};
    qrows.forEach(r => {
      qmap[r.id] = r;
    });

    const questions = pageIds.map((id, idx) => {
      const r = qmap[id];
      return {
        id: r.id,
        question_no: start + idx + 1,
        text: r.question_text,
        choices: [r.choice_a, r.choice_b, r.choice_c, r.choice_d]
      };
    });

    res.json({
      sessionId: session.id,
      page,
      per_page,
      total,
      totalPages,
      questions
    });

  } catch (err) {
    console.error('GET /api/questions/structural error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST submit quiz
app.post('/api/quiz/submit', async (req, res) => {
  try {
    const { sessionId, answers, user_id } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
    if (!answers || typeof answers !== 'object') return res.status(400).json({ error: 'answers required' });

    // load session
    const [sessRows] = await pool.query('SELECT id, question_ids FROM exam_sessions WHERE id = ? LIMIT 1', [sessionId]);
    if (!sessRows.length) return res.status(404).json({ error: 'Session not found' });
    let qids;
    try {
      qids = typeof sessRows[0].question_ids === 'string' ? JSON.parse(sessRows[0].question_ids) : sessRows[0].question_ids;
    } catch (e) {
      return res.status(500).json({ error: 'Invalid session data' });
    }

    if (!Array.isArray(qids) || qids.length === 0) return res.status(400).json({ error: 'No questions in session' });

    // ตรวจคำตอบ
    const placeholders = qids.map(() => '?').join(',');
    const [qrows] = await pool.query(
      `SELECT id, answer FROM question_Structural WHERE id IN (${placeholders})`,
      qids
    );
    const answerMap = {};
    qrows.forEach(r => { answerMap[r.id] = (r.answer || '').trim().toUpperCase(); });

    let correct = 0;

    const normalizedAnswers = {};
    for (const qid of qids) {
      const raw = answers[qid];
      if (raw === undefined || raw === null) {
        normalizedAnswers[qid] = null;
        continue;
      }
      let ansLetter = null;
      if (typeof raw === 'number') {
        
        const map = ['A','B','C','D'];
        ansLetter = map[raw] || null;
      } else if (typeof raw === 'string') {
        const trimmed = raw.trim().toUpperCase();
        if (['A','B','C','D'].includes(trimmed)) ansLetter = trimmed;
        else {
          
          const idx = parseInt(trimmed, 10);
          if (!isNaN(idx) && idx >=0 && idx <=3) ansLetter = ['A','B','C','D'][idx];
        }
      }
      normalizedAnswers[qid] = ansLetter;
      if (ansLetter && answerMap[qid] && ansLetter === answerMap[qid]) correct += 1;
    }

    const total = qids.length;
    const percent = Math.round((correct / total) * 100);

    // ระดับคะแนน
    
    let level = 1;
    if (percent > 84) level = 3;
    else if (percent > 64) level = 2;
    else  level = 1;
    

    // Save result
    const [ins] = await pool.query(
      `INSERT INTO quiz_results
         (session_id, user_id, total_questions, correct, score_percent, level, answers)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, user_id || null, total, correct, percent, level, JSON.stringify(normalizedAnswers)]
    );

    const resultId = ins.insertId;

    res.json({
      id: resultId,
      sessionId,
      total,
      correct,
      scorePercent: percent,
      level
    });

  } catch (err) {
    console.error('POST /api/quiz/submit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET quiz result by id ดึงผลสอบย้อนหลัง
app.get('/api/quiz/result/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const [rows] = await pool.query('SELECT * FROM quiz_results WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Result not found' });
    const row = rows[0];
    
    try { row.answers = typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers; } catch(e){ }
    res.json(row);
  } catch (err) {
    console.error('GET /api/quiz/result error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

app.get('/', (req, res) => res.send('API is running'));
