const pool = require('../config/db');

// ดึงข้อมูลโปรไฟล์
exports.findById = async (userId) => {
    const sql = 'SELECT id, full_name, role, email, phone, technician_type, experience_years FROM dbuser WHERE id = ?';
    const [rows] = await pool.query(sql, [userId]);
    return rows[0];
};

// ดึงรหัสผ่านเก่า (เพื่อเอามาตรวจสอบ)
exports.findPasswordById = async (userId) => {
    const sql = 'SELECT password FROM dbuser WHERE id = ?';
    const [rows] = await pool.query(sql, [userId]);
    return rows[0];
};

// อัปเดตรหัสผ่านใหม่
exports.updatePassword = async (userId, hashedPassword) => {
    const sql = 'UPDATE dbuser SET password = ? WHERE id = ?';
    const [result] = await pool.query(sql, [hashedPassword, userId]);
    return result.affectedRows > 0;
};