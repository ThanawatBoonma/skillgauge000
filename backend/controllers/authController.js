const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); 

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

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

    // 4. ส่ง Response กลับ 
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

// Register
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    let userData = {};

    // เช็คว่าข้อมูลมาจากหน้า AdminWorkerRegistration หรือไม่ (ถ้ามี key 'personal' แสดงว่าใช่)
    if (req.body.personal) {
      const { personal, address, employment, identity, credentials } = req.body;
      
      // 1. แกะข้อมูลจาก Frontend มาใส่ตัวแปรให้ตรงกับ Database
      userData = {
        citizen_id: personal.nationalId,
        full_name: personal.fullName,
        birth_date: personal.birthDate,
        
        // ดึง phone จาก address มาใส่ที่นี่
        phone: address.phone, 
        
        address_id_card: address.addressOnId,
        province_id: address.province_id,
        district_id: address.district_id,
        subdistrict_id: address.subdistrict_id,
        zip_code: address.postalCode,
        address_current: address.currentAddress,
        
        role: employment.role,
        technician_type: employment.tradeType,
        experience_years: employment.experienceYears,
        
        card_issue_date: identity.issueDate,
        card_expiry_date: identity.expiryDate,
        
        email: credentials.email,
        password: credentials.password
      };
    } else {
      // กรณี Register ปกติ (ไม่ได้มาจากหน้า Admin)
      userData = req.body;
    }

    // 2. เช็ค ID ซ้ำ
    const existingCitizen = await User.findByCitizenId(userData.citizen_id);
    if (existingCitizen) {
      return res.status(409).json({ error: 'Citizen ID already exists' });
    }

    // 3. เช็ค Email ซ้ำ
    if (userData.email) {
      const existingEmail = await User.findByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already registered' });
      }
    }

    // 4. บันทึกลงฐานข้อมูล
    const userId = await User.create(userData);

    res.status(201).json({ 
      message: 'User created successfully', 
      userId,
      full_name: userData.full_name
    });

  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};
