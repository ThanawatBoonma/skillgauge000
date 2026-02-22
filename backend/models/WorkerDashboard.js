const pool = require('../config/db');

//exports.getAssignedTask = async (userId) => {
//    const sql = `
//        SELECT t.task_name, p.project_name, p.site_location, ptw.status, ptw.assigned_at,
 //              u.full_name as foreman_name
//        FROM project_task_workers ptw
//        JOIN project_tasks t ON ptw.pj_t_id = t.pj_t_id
//        JOIN projects p ON t.pj_id = p.pj_id
//        LEFT JOIN dbuser u ON p.manager_id = u.id 
//        WHERE ptw.user_id = ? AND ptw.status IN ('assigned', 'accepted')
//        ORDER BY ptw.assigned_at DESC LIMIT 1
//    `;
//    const [rows] = await pool.query(sql, [userId]);
//    return rows[0];
//};

exports.getAssignedTask = async (userId) => {
    //  แก้ไข SQL ให้ดึงจาก task_assessment
    // Join กับ dbuser เพื่อเอาชื่อ PM (manager_id) มาแสดงเป็น "หัวหน้างาน"
    const sql = `
        SELECT 
            ta.t_a_id as id,
            ta.task_name,
            ta.task_type as project_name, 
            ta.site_location,
            ta.description,
            ta.status,
            ta.start_date,
            ta.end_date,
            u.full_name as foreman_name 
        FROM task_assessment ta
        LEFT JOIN dbuser u ON ta.manager_id = u.id
        WHERE ta.worker_id = ? AND ta.status = 'กำลังดำเนินการ'
        LIMIT 1
    `;
    const [rows] = await pool.query(sql, [userId]);
    return rows[0];
};

exports.getSkillLevel = async (userId) => {
    const sql = `
        SELECT LV FROM worker_level 
        WHERE user_id = ?
    `;
    const [rows] = await pool.query(sql, [userId]);
    return rows[0]; // จะได้ object เช่น { LV: '1' }
};

// ✅ 2. เพิ่มใหม่: ดึงประวัติการประเมินจาก skill_assessment_results
exports.getAssessmentHistory = async (userId) => {
    const sql = `
        SELECT 
            sar.assessment_id,
            sar.user_id,
            sar.theory_score,
            sar.practical_score,
            sar.assessment_total,
            sar.skill_level,
            sar.created_at,
            sar.updated_at,
            sar.assessment_comment,
            sar.fm_id,
            u.full_name as assessor_name -- Join เพื่อเอาชื่อคนประเมินมาโชว์ด้วย (Optional)
        FROM skill_assessment_results sar
        LEFT JOIN dbuser u ON sar.fm_id = u.id
        WHERE sar.user_id = ?
        ORDER BY sar.created_at DESC
    `;
    const [rows] = await pool.query(sql, [userId]);
    return rows;
};

// ฟังก์ชันสำหรับอัปเดตงานเมื่อส่งมอบ
exports.updateTaskSubmission = async (taskId, filename) => {
    const sql = `
        UPDATE task_assessment 
        SET status = 'เสร็จสิ้น', 
            submission_photo = ?, 
            updated_at = NOW() 
        WHERE t_a_id = ?
    `;
    const [result] = await pool.query(sql, [filename, taskId]);
    return result;
};

// ✅ ฟังก์ชันใหม่: ดึงประวัติงานที่เสร็จแล้ว (เฉพาะของช่างคนนั้น)
exports.getWorkerTaskHistory = async (userId) => {
    const sql = `
        SELECT 
            ta.t_a_id,
            ta.task_name,
            ta.task_type, -- หรือ project_name
            ta.site_location,
            ta.description,
            ta.start_date,
            ta.end_date,
            ta.status,
            ta.submission_photo,
            ta.updated_at,
            pm.full_name as manager_name -- ชื่อ PM ผู้มอบหมาย
        FROM task_assessment ta
        LEFT JOIN dbuser pm ON ta.manager_id = pm.id
        WHERE ta.worker_id = ? 
          AND ta.status = 'เสร็จสิ้น' -- เอาเฉพาะงานที่เสร็จแล้ว
        ORDER BY ta.updated_at DESC
    `;
    const [rows] = await pool.query(sql, [userId]);
    return rows;
};

// ✅ 1. ดึงค่า Config จำนวนวันที่ต้องรอ (ใช้เหมือนเดิม)
exports.getWaitTimeConfig = async () => {
    const sql = 'SELECT time_days FROM timewait WHERE id = 1';
    const [rows] = await pool.query(sql);
    return rows[0] ? rows[0].time_days : 30; // ถ้าไม่มีข้อมูลให้รอ 30 วันเป็น Default
};

// ✅ 2. แก้ไข: ดึงวันที่อัปเดตระดับล่าสุดจากตาราง worker_level แทน
exports.getLastLevelUpdateDate = async (userId) => {
    const sql = 'SELECT updated_at FROM worker_level WHERE user_id = ?';
    const [rows] = await pool.query(sql, [userId]);
    return rows[0] ? rows[0].updated_at : null;
};