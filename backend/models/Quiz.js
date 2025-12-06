const pool = require('../config/db');

// ดึงคำถามแบบสุ่ม 
exports.getRandomQuestionsByLevel = async (level, limit) => {
    const sql = `
        SELECT id, question_text, choice_a, choice_b, choice_c, choice_d, difficulty_level 
        FROM question_Structural 
        WHERE difficulty_level = ? 
        ORDER BY RAND() 
        LIMIT ?
    `;
    const [rows] = await pool.query(sql, [level, limit]);
    return rows;
};

// ดึงเฉลย
exports.getCorrectAnswers = async (questionIds) => {
    if (questionIds.length === 0) return [];
    
    // สร้าง string ?,?,? ตามจำนวน id
    const placeholders = questionIds.map(() => '?').join(',');
    const sql = `SELECT id, answer FROM question_Structural WHERE id IN (${placeholders})`;
    
    const [rows] = await pool.query(sql, questionIds);
    return rows;
};

// บันทึกผลสอบ 
exports.saveQuizResult = async (userId, score, total, percent ) => {
    // เก็บผลสอบ
    const sql = `
        INSERT INTO quiz_results (user_id, score, total_questions, score_percent, created_at)
        VALUES (?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.query(sql, [userId, score, total, percent]);
    return result.insertId;
};