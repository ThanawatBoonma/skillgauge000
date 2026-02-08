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
        SELECT skill_level FROM skill_assessment_results 
        WHERE user_id = ? 
        ORDER BY created_at DESC LIMIT 1
    `;
    const [rows] = await pool.query(sql, [userId]);
    return rows[0];
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