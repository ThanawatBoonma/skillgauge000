const pool = require('../config/db');
const bcrypt = require('bcryptjs'); //(อย่าลืม npm install bcryptjs)

// 1. ดึงรายชื่อทั้งหมด (ยกเว้น Admin)
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

      u.address_id_card,
      u.zip_code,
      u.experience_years,
      u.province_id,    
      u.district_id,
      u.subdistrict_id,
      
      u.address_current,      -- เพิ่ม address_current ด้วย
      u.card_issue_date,      -- เพิ่มวันออกบัตร
      u.card_expiry_date,     -- เพิ่มวันหมดอายุ

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
exports.update = async (id, userData) => {
  const {
    citizen_id, full_name, birth_date, age,
    address_id_card, subdistrict_id, district_id, province_id, zip_code,
    address_current, card_issue_date, card_expiry_date,
    role, technician_type, experience_years, email, phone,
    password 
  } = userData;

  // 1. สร้าง Array เก็บชื่อคอลัมน์ที่จะอัปเดต
  // (วิธีนี้ยืดหยุ่นกว่าเขียน SQL แข็งๆ เพราะถ้าค่าไหน undefined จะได้ไม่พัง)
  let updateFields = [];
  let updateValues = [];

  // Helper function เพื่อ push ค่าลง array (ช่วยให้โค้ดสะอาด)
  const addField = (field, value) => {
    // ถ้า value เป็น undefined หรือ null ให้เก็บเป็น null หรือค่าเดิมตามต้องการ
    // แต่ในเคสนี้เราจะถือว่า Frontend ส่งมาครบทุกฟิลด์ยกเว้น password
    updateFields.push(`${field} = ?`);
    updateValues.push(value);
  };

  addField('citizen_id', citizen_id);
  addField('full_name', full_name);
  addField('birth_date', birth_date);
  addField('age', age);
  addField('address_id_card', address_id_card);
  addField('subdistrict_id', subdistrict_id);
  addField('district_id', district_id);
  addField('province_id', province_id);
  addField('zip_code', zip_code);
  addField('address_current', address_current);
  addField('card_issue_date', card_issue_date);
  addField('card_expiry_date', card_expiry_date);
  addField('role', role);
  addField('technician_type', technician_type || 'ไม่มี');
  addField('experience_years', experience_years || 0);
  addField('email', email);
  addField('phone', phone);

  // --- ไฮไลท์สำคัญ: เช็ค Password ---
  if (password && password.trim() !== '') {
    // ถ้ามีการส่ง password มา และไม่ใช่ค่าว่าง -> ให้ Hash แล้วอัปเดต
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    updateFields.push('password = ?'); // เพิ่มคำสั่งอัปเดตรหัส
    updateValues.push(hashedPassword); // ใส่รหัสที่เข้ารหัสแล้ว
  }
  

  // if นี้ถ้าไม่มีอะไรให้อัปเดตเลย
  if (updateFields.length === 0) return true;

  // ประกอบร่าง SQL
  const sql = `UPDATE dbuser SET ${updateFields.join(', ')} WHERE id = ?`;
  updateValues.push(id); // ใส่ ID ปิดท้ายสำหรับ WHERE

  try {
    const [result] = await pool.query(sql, updateValues);
    return result.affectedRows > 0;
  } catch (err) {
    console.error('Model Update Error:', err);
    throw err;
  }
};

// 3. ลบ User (คงเดิม)
exports.delete = async (id) => {
  const sql = `DELETE FROM dbuser WHERE id = ?`;
  const [result] = await pool.query(sql, [id]);
  return result.affectedRows > 0;
};