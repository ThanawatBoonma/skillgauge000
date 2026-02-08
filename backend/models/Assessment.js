const pool = require('../config/db');

// 1. ดึงคะแนนทฤษฎีที่ Weight มาแล้ว (70%) จากตารางผลประเมิน
exports.getTheoryScore = async (userId) => {
    try {
        const sql = 'SELECT theory_score FROM skill_assessment_results WHERE user_id = ? LIMIT 1';
        const [rows] = await pool.query(sql, [userId]);
        return rows[0]; 
    } catch (error) {
        throw new Error('Database Error in getTheoryScore: ' + error.message);
    }
};

// 2. อัปเดตผลการประเมินรวม (ทฤษฎี + ปฏิบัติ) และระดับ
exports.updateAssessmentResult = async (userId, theory, practical, total, levelLabel, comment) => {
    try {
        const sql = `
            UPDATE skill_assessment_results 
            SET theory_score = ?, 
                practical_score = ?, 
                assessment_total = ?, 
                skill_level = ?, 
                assessment_comment = ?,  -- ต้องมีบรรทัดนี้
                updated_at = NOW()
            WHERE user_id = ?
        `;
        
        return await pool.query(sql, [theory, practical, total, levelLabel, comment, userId]);
    } catch (error) {
        throw new Error('Database Error in updateAssessmentResult: ' + error.message);
    }
};

// 3. ฟังก์ชันสำหรับบันทึกคะแนนทฤษฎีครั้งแรก (หลังสอบเสร็จ)
exports.initTheoryScore = async (userId, weightedTheoryScore) => {
    const sql = `
        INSERT INTO skill_assessment_results (user_id, theory_score, skill_level)
        VALUES (?, ?, 'รอประเมินหน้างาน')
        ON DUPLICATE KEY UPDATE 
            theory_score = VALUES(theory_score),
            updated_at = NOW()
    `;
    return await pool.query(sql, [userId, weightedTheoryScore]);
};

exports.getPendingPracticalList = async () => {
    try {
        const sql = `
            SELECT 
                u.id as worker_id,
                u.full_name as name,
                u.technician_type as role_name,
                ta.t_a_id as task_id,
                ta.task_name,
                ta.submission_photo,
                ta.site_location,
                ta.description,
                ta.start_date,
                ta.end_date,
                ta.updated_at as submitted_at
            FROM skill_assessment_results sr
            JOIN task_assessment ta ON sr.user_id = ta.worker_id
            JOIN dbuser u ON sr.user_id = u.id
            WHERE sr.practical_score IS NULL       -- ยังไม่มีคะแนนภาคปฏิบัติ
              AND ta.submission_photo IS NOT NULL  -- ส่งรูปผลงานแล้ว
            ORDER BY ta.updated_at DESC
        `;
        const [rows] = await pool.query(sql);
        return rows;
    } catch (error) {
        throw new Error('Database Error in getPendingPracticalList: ' + error.message);
    }
};