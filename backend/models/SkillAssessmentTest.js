const pool = require('../config/db');

// ฟังก์ชันสุ่มข้อสอบ
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

// ฟังก์ชันดึงเฉลย 
exports.getCorrectAnswers = async (questionIds) => {
    if (questionIds.length === 0) return [];
    
    const placeholders = questionIds.map(() => '?').join(',');
    const sql = `SELECT id, answer FROM question_Structural WHERE id IN (${placeholders})`;
    
    const [rows] = await pool.query(sql, questionIds);
    return rows;
};

exports.saveAssessmentResult = async (userId, theoryScore) => {
    
    const sql = `
        INSERT INTO skill_assessment_results (user_id, theory_score, created_at)
        VALUES (?, ?, NOW())
    `;
    const [result] = await pool.query(sql, [userId, theoryScore]);
    return result.insertId;
};