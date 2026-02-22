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

// 2. (แก้ไข) อัปเดตผลการประเมินรวม + fm_id
exports.updateAssessmentResult = async (userId, theory, practical, total, levelLabel, comment, fmId) => {
    try {
        const sql = `
            UPDATE skill_assessment_results 
            SET theory_score = ?, 
                practical_score = ?, 
                assessment_total = ?, 
                skill_level = ?, 
                assessment_comment = ?,
                fm_id = ?,          -- ✅ เพิ่ม fm_id
                updated_at = NOW()
            WHERE user_id = ? 
            -- (อาจจะต้องมีเงื่อนไขเลือกแถวล่าสุด หรือ task_id ถ้ามี แต่เบื้องต้นใช้ user_id ตามระบบเดิม)
        `;
        return await pool.query(sql, [theory, practical, total, levelLabel, comment, fmId, userId]);
    } catch (error) {
        throw new Error('Database Error in updateAssessmentResult: ' + error.message);
    }
};

// 3. (ใหม่) ดึงระดับปัจจุบันจาก worker_level
exports.getCurrentWorkerLevel = async (userId) => {
    try {
        const sql = 'SELECT LV FROM worker_level WHERE user_id = ?';
        const [rows] = await pool.query(sql, [userId]);
        return rows[0] ? parseInt(rows[0].LV) : 0; // ถ้าไม่มีข้อมูลถือเป็น Level 0
    } catch (error) {
        throw new Error('Database Error in getCurrentWorkerLevel: ' + error.message);
    }
};

// 4. (ใหม่) อัปเดตระดับใหม่ลง worker_level
exports.updateWorkerLevel = async (userId, newLevel) => {
    try {
        const levelStr = String(newLevel); // แปลงเป็น string เพื่อให้ตรง ENUM
        const sql = `
            INSERT INTO worker_level (user_id, LV) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE LV = VALUES(LV), updated_at = NOW()
        `;
        return await pool.query(sql, [userId, levelStr]);
    } catch (error) {
        throw new Error('Database Error in updateWorkerLevel: ' + error.message);
    }
};

// 5. ฟังก์ชันสำหรับบันทึกคะแนนทฤษฎีครั้งแรก (หลังสอบเสร็จ)
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

exports.getCompletedAssessments = async () => {
    try {
        const sql = `
            SELECT 
                sr.assessment_id,
                sr.user_id,
                u.full_name as name,
                u.technician_type as role_name,
                sr.theory_score,
                sr.practical_score,
                sr.assessment_total,
                sr.skill_level,
                sr.assessment_comment,
                sr.updated_at,
                sr.fm_id,
                f.full_name as foreman_name,
                -- ใช้ Subquery ดึงข้อมูลงานล่าสุดของช่างคนนั้น
                (SELECT submission_photo FROM task_assessment WHERE worker_id = sr.user_id ORDER BY updated_at DESC LIMIT 1) as submission_photo,
                (SELECT task_name FROM task_assessment WHERE worker_id = sr.user_id ORDER BY updated_at DESC LIMIT 1) as task_name
            FROM skill_assessment_results sr
            JOIN dbuser u ON sr.user_id = u.id
            LEFT JOIN dbuser f ON sr.fm_id = f.id
            WHERE sr.practical_score IS NOT NULL 
            ORDER BY sr.updated_at DESC
        `;
        const [rows] = await pool.query(sql);
        return rows;
    } catch (error) {
        throw new Error('Database Error in getCompletedAssessments: ' + error.message);
    }
};