const pool = require('../config/db');

exports.createTask = async (data) => {
    const { pj_id, task_name, technician_type, priority, required_workers, description } = data;
    const sql = `
        INSERT INTO project_tasks 
        (pj_id, task_name, technician_type, priority, required_workers, description) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [pj_id, task_name, technician_type, priority, required_workers, description]);
    return result.insertId;
};

// ดึงรายชื่อช่างที่เหมาะสม (Join กับผลประเมิน)
exports.findWorkersByType = async (techType) => {
    const sql = `
        SELECT u.id, u.full_name, u.age, u.experience_years, 
               COALESCE(s.skill_level, 0) as skill_level 
        FROM dbuser u
        LEFT JOIN skill_assessment_results s ON u.id = s.user_id
        WHERE u.role = 'worker' AND u.technician_type = ?
    `;
    const [rows] = await pool.query(sql, [techType]);
    return rows;
};

exports.assignWorkers = async (pj_t_id, userIds) => {
    // เตรียมข้อมูลสำหรับ Bulk Insert
    const values = userIds.map(uid => [pj_t_id, uid]);
    const sql = `INSERT INTO project_task_workers (pj_t_id, user_id) VALUES ?`;
    const [result] = await pool.query(sql, [values]);
    return result;
};

exports.findByProjectId = async (pjId) => {
    const sql = `
        SELECT t.*, 
               (SELECT COUNT(*) FROM project_task_workers ptw WHERE ptw.pj_t_id = t.pj_t_id) as assigned_count 
        FROM project_tasks t 
        WHERE t.pj_id = ? 
        ORDER BY t.created_at DESC
    `;
    const [rows] = await pool.query(sql, [pjId]);
    return rows;
};