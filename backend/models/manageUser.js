const pool = require('../config/db');

// 1. ดึงรายชื่อทั้งหมด (ยกเว้น Admin)
// ใช้ JOIN เพื่อดึงชื่อจังหวัด/อำเภอ/ตำบล จาก ID
exports.findAllExceptAdmin = async () => {
  const sql = `
    SELECT 
      u.id, 
      u.citizen_id, 
      u.full_name, 
      u.role, 
      u.technician_type, 
      u.email, 
      u.birth_date, 
      u.age, 
      u.phone,
      p.name_th AS province,        
      a.name_th AS district,        
      d.name_th AS sub_district     
    FROM dbuser u
    LEFT JOIN provinces p ON u.province_id = p.id
    LEFT JOIN amphures a ON u.district_id = a.id
    LEFT JOIN districts d ON u.subdistrict_id = d.id
    WHERE u.role != 'admin'
    ORDER BY u.id DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
};

// 2. แก้ไขข้อมูล User
// ต้องเปลี่ยนชื่อฟิลด์ใน UPDATE ให้ตรงกับ DB จริง (province_id, district_id, subdistrict_id)
exports.update = async (id, userData) => {
  const {
    citizen_id, full_name, birth_date, age,
    address_id_card, subdistrict_id, district_id, province_id, zip_code,
    address_current, card_issue_date, card_expiry_date,
    role, technician_type, experience_years, email, phone
  } = userData;

  const sql = `
    UPDATE dbuser SET
      citizen_id=?, full_name=?, birth_date=?, age=?,
      address_id_card=?, subdistrict_id=?, district_id=?, province_id=?, zip_code=?,
      address_current=?, card_issue_date=?, card_expiry_date=?,
      role=?, technician_type=?, experience_years=?, email=?, phone=?
    WHERE id = ?
  `;

  // จัดการค่า Default
  const finalTechType = technician_type || 'ไม่มี';
  const finalExpYears = experience_years || 0;

  try {
    const [result] = await pool.query(sql, [
      citizen_id, full_name, birth_date, age,
      address_id_card, subdistrict_id, district_id, province_id, zip_code,
      address_current, card_issue_date, card_expiry_date,
      role, finalTechType, finalExpYears, email, phone,
      id
    ]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Update User Error: ", error);
    throw error;
  }
};

// 3. ลบ User
exports.delete = async (id) => {
  const sql = 'DELETE FROM dbuser WHERE id = ?';
  const [result] = await pool.query(sql, [id]);
  return result.affectedRows > 0;
};