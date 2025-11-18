const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// ค้นหา User ด้วย Email
exports.findByEmail = async (email) => {
  try {
    // เลือกทุกฟิลด์ที่จำเป็น (รวมถึง password เพื่อเอาไปเช็ค Login)
    const sql = `
      SELECT 
        id, prefix, first_name, last_name, citizen_id, technician_type,
        phone_number, birth_date, address_details, zip_code, sub_district, province,
        email, password, role
      FROM dbuser 
      WHERE email = ? 
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [email]);
    return rows[0];
  } catch (err) {
    console.error('Error finding user by email:', err);
    throw err;
  }
};

// สร้าง User ใหม่
exports.create = async (userData) => {
  const {
    prefix, first_name, last_name, citizen_id, technician_type,
    phone_number, birth_date, address_details, zip_code, sub_district, province,
    email, password, role
  } = userData;

  try {
    const hash = bcrypt.hashSync(password, 12);

    const sql = `
      INSERT INTO dbuser (
        prefix, first_name, last_name, citizen_id, technician_type,
        phone_number, birth_date, address_details, zip_code, sub_district, province,
        email, password, role
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // กำหนดค่า default ให้ technician_type ถ้าไม่ได้ส่งมา
    const finalTechType = technician_type || 'ไม่มี';
    // กำหนดค่า default ให้ role ถ้าไม่ได้ส่งมา (เป็น worker)
    const finalRole = role || 'worker';

    const [result] = await pool.query(sql, [
      prefix, first_name, last_name, citizen_id, finalTechType,
      phone_number, birth_date, address_details, zip_code, sub_district, province,
      email, hash, finalRole
    ]);

    return {
      id: result.insertId,
      ...userData,
      role: finalRole,
      technician_type: finalTechType,
      password: undefined // ไม่ส่งรหัสผ่านกลับไป
    };
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  }
};

exports.comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash || '');
};