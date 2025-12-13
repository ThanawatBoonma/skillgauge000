const pool = require('../config/db');

// 1. ดึงรายชื่อทั้งหมด (ยกเว้น Admin)
exports.findAllExceptAdmin = async () => {
  const sql = `
    SELECT id, citizen_id, full_name, role, technician_type, 
           email, birth_date, age, province
    FROM dbuser 
    WHERE role != 'admin'
    ORDER BY id DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
};

// 2. แก้ไขข้อมูล User
exports.update = async (id, userData) => {
  const {
    citizen_id, full_name, birth_date, age,
    address_id_card, sub_district, district, province, zip_code,
    address_current, card_issue_date, card_expiry_date,
    role, technician_type, experience_years, email
  } = userData;

  const sql = `
    UPDATE dbuser SET
      citizen_id=?, full_name=?, birth_date=?, age=?,
      address_id_card=?, sub_district=?, district=?, province=?, zip_code=?,
      address_current=?, card_issue_date=?, card_expiry_date=?,
      role=?, technician_type=?, experience_years=?, email=?
    WHERE id = ?
  `;

  // จัดการค่า Default
  const finalTechType = technician_type || 'ไม่มี';
  const finalExpYears = experience_years || 0;

  const [result] = await pool.query(sql, [
    citizen_id, full_name, birth_date, age,
    address_id_card, sub_district, district, province, zip_code,
    address_current, card_issue_date, card_expiry_date,
    role, finalTechType, finalExpYears, email,
    id
  ]);
  
  return result.affectedRows > 0;
};

// 3. ลบ User
exports.delete = async (id) => {
  const sql = 'DELETE FROM dbuser WHERE id = ?';
  const [result] = await pool.query(sql, [id]);
  return result.affectedRows > 0;
};