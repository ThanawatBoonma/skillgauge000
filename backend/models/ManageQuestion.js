// models/ManageQuestion.js
const pool = require('../config/db');

// 1. ดึงข้อสอบทั้งหมด
exports.findAll = async () => {
  const sql = 'SELECT * FROM question_Structural ORDER BY id DESC';
  const [rows] = await pool.query(sql);
  return rows;
};

// 2. เพิ่มข้อสอบหลายข้อพร้อมกัน (Bulk Insert)
// รับค่าเป็น Array ของ Array values [[text, a, b, ...], [text, a, b, ...]]
exports.createBulk = async (questionsValues) => {
  const sql = `
    INSERT INTO question_Structural 
    (question_text, choice_a, choice_b, choice_c, choice_d, answer, difficulty_level, skill_type) 
    VALUES ?
  `;
  // syntax ของ mysql2 สำหรับ bulk insert คือส่ง [ [array1], [array2] ] ไปใน query
  const [result] = await pool.query(sql, [questionsValues]);
  return result;
};

// 3. แก้ไขข้อสอบ
exports.update = async (id, data) => {
  const {
    question_text, choice_a, choice_b, choice_c, choice_d,
    answer, difficulty_level, skill_type
  } = data;

  const sql = `
    UPDATE question_Structural SET
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
exports.delete = async (id) => {
  const sql = 'DELETE FROM question_Structural WHERE id = ?';
  const [result] = await pool.query(sql, [id]);
  return result.affectedRows > 0;
};