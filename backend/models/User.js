const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// ค้นหา User ด้วย Email (ใช้ตอน Login)
exports.findByEmail = async (email) => {
  const sql = 'SELECT * FROM dbuser WHERE email = ? LIMIT 1';
  const [rows] = await pool.query(sql, [email]);
  return rows[0];
};

// ค้นหา User ด้วย Citizen ID (เช็คซ้ำ)
exports.findByCitizenId = async (citizenId) => {
  const sql = 'SELECT id FROM dbuser WHERE citizen_id = ? LIMIT 1';
  const [rows] = await pool.query(sql, [citizenId]);
  return rows[0];
};

// สร้าง User ใหม่ (รับค่าก้อนใหญ่จากหน้า 3)
exports.create = async (userData) => {
  const {
    citizen_id, full_name, birth_date, age,
    address_id_card, province_id, district_id, subdistrict_id, zip_code,
    address_current, card_issue_date, card_expiry_date,
    role, technician_type, experience_years,
    email, password, phone
  } = userData;

  // Hash Password
  const hash = bcrypt.hashSync(password, 12);

const sql = `
    INSERT INTO dbuser (
      citizen_id, full_name, birth_date, age,
      address_id_card, province_id, district_id, subdistrict_id, zip_code,
      address_current, card_issue_date, card_expiry_date,
      role, technician_type, experience_years,
      email, password, phone 
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // ใส่ค่า Default ให้ technician_type กับ experience_years ถ้าไม่ได้ส่งมา
  const finalTechType = technician_type || 'ไม่มี';
  const finalExpYears = experience_years || 0;

const [result] = await pool.query(sql, [
    citizen_id, full_name, birth_date, age,
    address_id_card, province_id, district_id, subdistrict_id,, zip_code,
    address_current, card_issue_date, card_expiry_date,
    role, finalTechType, finalExpYears,
    email, hash, phone 
  ]);

  return result.insertId;
};

exports.comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash || '');
};