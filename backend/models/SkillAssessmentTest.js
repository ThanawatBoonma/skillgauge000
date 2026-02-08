const pool = require('../config/db');

// ดึง Config ของ Level ที่ระบุ (ไม่ใช่ดึงมั่วๆ LIMIT 1 แล้ว)
exports.getExamStructureConfigByLevel = async (level) => {
    const sql = 'SELECT * FROM Exam_structure_set WHERE level = ? LIMIT 1';
    const [rows] = await pool.query(sql, [level]);
    return rows[0];
};

// ฟังก์ชันสุ่มข้อสอบแบบเจาะจง Level และหมวดหมู่ (Category)
exports.getRandomQuestionsByLevelAndCategory = async (level, category, limit) => {
    const sql = `
        SELECT id, question_text, choice_a, choice_b, choice_c, choice_d, difficulty_level, skill_type 
        FROM question_Structural 
        WHERE difficulty_level = ? AND skill_type = ?
        ORDER BY RAND() 
        LIMIT ?
    `;
    
    const [rows] = await pool.query(sql, [level, category, limit]); 
    return rows;
};

// (ของเดิม) สำหรับตรวจคำตอบ
exports.getCorrectAnswers = async (questionIds) => {
    if (questionIds.length === 0) return [];
    const placeholders = questionIds.map(() => '?').join(',');
    const sql = `SELECT id, answer FROM question_Structural WHERE id IN (${placeholders})`;
    const [rows] = await pool.query(sql, questionIds);
    return rows;
};

// (ของเดิม) บันทึกผล
exports.saveAssessmentResult = async (userId, theoryScore, level) => {
    // เพิ่มการบันทึกว่าสอบ Level ไหน (ถ้าตาราง results รองรับ) หรือบันทึกปกติ
    const sql = `INSERT INTO skill_assessment_results (user_id, theory_score, skill_level, created_at) VALUES (?, ?, ?, NOW())`;
    const [result] = await pool.query(sql, [userId, theoryScore, level]);
    return result.insertId;
};