const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // เพิ่ม bcrypt เข้ามาเพื่อใช้เช็ค Password ตอน Login

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// --- Login (ใช้หน้าเดียวกันทุก Role) ---
exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // 1. ค้นหา User จาก Email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 2. ตรวจสอบรหัสผ่าน
    // ใช้ User.comparePassword ถ้าใน Model มี หรือใช้ bcrypt ตรงๆ ก็ได้
    // กรณีนี้เรียกใช้จาก Model ที่เราเขียนไว้
    const isMatch = User.comparePassword(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3. สร้าง Token
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // 4. ส่ง Response กลับ (นี่คือจุดที่ Postman รออยู่)
    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- Register (Admin เป็นคนกด Submit) ---
exports.registerUser = async (req, res) => {
  // Validation Check
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { citizen_id, email } = req.body;

    // 1. เช็ค Citizen ID ซ้ำ
    const existingCitizen = await User.findByCitizenId(citizen_id);
    if (existingCitizen) {
      return res.status(409).json({ error: 'Citizen ID already exists' });
    }

    // 2. เช็ค Email ซ้ำ
    if (email) {
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already registered' });
      }
    }

    // 3. บันทึกลงฐานข้อมูล
    const userId = await User.create(req.body);

    // 4. ส่ง Response กลับ (สำคัญมาก ห้ามลืม!)
    res.status(201).json({ 
      message: 'User created successfully', 
      userId,
      full_name: req.body.full_name
    });

  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// --- Update Role (ถ้ายังใช้อยู่) ---
exports.updateUserRole = async (req, res) => {
  // ... โค้ดเดิม ถ้ามี ...
  // ถ้าไม่มี ให้ใส่ไว้แบบนี้ก็ได้เพื่อกัน Error
  res.status(501).json({ message: "Not Implemented yet" });
};