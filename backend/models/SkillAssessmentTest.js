const pool = require('../config/db');

// ฟังก์ชันสุ่มข้อสอบตามระดับความยาก
exports.getRandomQuestionsByLevel = async (level, limit) => {
    const sql = `
        SELECT id, question_text, choice_a, choice_b, choice_c, choice_d, difficulty_level, skill_type 
        FROM question_Structural 
        WHERE difficulty_level = ? 
        ORDER BY RAND() 
        LIMIT ?
    `;
    const [rows] = await pool.query(sql, [level, limit]);
    return rows;
};

// ฟังก์ชันดึงเฉลย (สำหรับตรวจคำตอบ ถ้าจำเป็นต้องแยก)
exports.getCorrectAnswers = async (questionIds) => {
    if (questionIds.length === 0) return [];
    
    const placeholders = questionIds.map(() => '?').join(',');
    const sql = `SELECT id, answer FROM question_Structural WHERE id IN (${placeholders})`;
    
    const [rows] = await pool.query(sql, questionIds);
    return rows;
};

// บันทึกผลสอบ (ถ้ามี)
exports.saveAssessmentResult = async (userId, score, total, percent) => {
    const sql = `
        INSERT INTO skill_assessment_results (user_id, score, total_questions, score_percent, created_at)
        VALUES (?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.query(sql, [userId, score, total, percent]);
    return result.insertId;
};