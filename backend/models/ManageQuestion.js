// models/ManageQuestion.js
const pool = require('../config/db');
// Map ชื่อหมวดหมู่ -> ชื่อตารางใน Database
const TABLE_MAP = {
  structure: 'question_Structural',
  electric: 'question_Electric',
  plumbing: 'question_Plumbing',
  masonry: 'question_Masonry',
  aluminum: 'question_Aluminum',
  ceiling: 'question_Ceiling',
  roofing: 'question_Roofing',
  tiling: 'question_Tiling'
};

// Helper: หาชื่อตารางจาก category
const getTableName = (category) => TABLE_MAP[category] || 'question_Structural';

// 1. ดึงข้อสอบทั้งหมด (รับ category เข้ามา)
exports.findAll = async (category) => {
  const tableName = getTableName(category);
  const sql = `SELECT * FROM ${tableName} ORDER BY id DESC`;
  const [rows] = await pool.query(sql);
  return rows;
};

// 2. เพิ่มข้อสอบ (Bulk Insert)
exports.createBulk = async (questionsValues, category) => {
  const tableName = getTableName(category);
  const sql = `
    INSERT INTO ${tableName} 
    (question_text, choice_a, choice_b, choice_c, choice_d, answer, difficulty_level, skill_type) 
    VALUES ?
  `;
  const [result] = await pool.query(sql, [questionsValues]);
  return result;
};

// 3. แก้ไขข้อสอบ
exports.update = async (id, data, category) => {
  const tableName = getTableName(category);
  const {
    question_text, choice_a, choice_b, choice_c, choice_d,
    answer, difficulty_level, skill_type
  } = data;

  const sql = `
    UPDATE ${tableName} SET
      question_text=?, choice_a=?, choice_b=?, choice_c=?, choice_d=?,
      answer=?, difficulty_level=?, skill_type=?
    WHERE id = ?
  `;
  const [result] = await pool.query(sql, [
    question_text, choice_a, choice_b, choice_c, choice_d,
    answer, difficulty_level, skill_type, id
  ]);
  return result.affectedRows > 0;
};

// 4. ลบข้อสอบ
exports.delete = async (id, category) => {
  const tableName = getTableName(category);
  const sql = `DELETE FROM ${tableName} WHERE id = ?`;
  const [result] = await pool.query(sql, [id]);
  return result.affectedRows > 0;
};

// 5. ดึงค่า Setting ตามระดับความยาก
exports.getSettingByLevel = async (level) => {
  const sql = 'SELECT * FROM exam_settings WHERE difficulty_level = ?';
  const [rows] = await pool.query(sql, [level]);
  return rows[0] || null; // ถ้าไม่มีส่ง null
};

// 6. บันทึก Setting (Upsert: ถ้ามี update ถ้าไม่มี insert)
exports.saveSetting = async (data) => {
  const { difficulty_level, passing_score, question_count, duration_minutes } = data;
  const sql = `
    INSERT INTO exam_settings (difficulty_level, passing_score, question_count, duration_minutes)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    passing_score = VALUES(passing_score),
    question_count = VALUES(question_count),
    duration_minutes = VALUES(duration_minutes)
  `;
  const [result] = await pool.query(sql, [difficulty_level, passing_score, question_count, duration_minutes]);
  return result;
};

// 7. ดึงค่าเวลา timewait
exports.getTimeWait = async () => {
  const sql = 'SELECT time_days FROM timewait WHERE id = 1';
  const [rows] = await pool.query(sql);
  return rows[0] ? rows[0].time_days : 30; // คืนค่าเริ่มต้น 30 ถ้าหาไม่เจอ
};

// 8. อัปเดตเวลา timewait (ใช้ Upsert กันพลาด)
exports.updateTimeWait = async (days) => {
  const sql = `
    INSERT INTO timewait (id, time_days) VALUES (1, ?)
    ON DUPLICATE KEY UPDATE time_days = VALUES(time_days)
  `;
  const [result] = await pool.query(sql, [days]);
  return result;
};