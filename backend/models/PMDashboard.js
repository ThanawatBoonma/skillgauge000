// backend/models/PMDashboard.js
const pool = require('../config/db');

class PMDashboard {
    // 1. ดึงข้อมูลสถิติ (เหมือนเดิม)
    static async getStats() {
        const pendingQuery = `SELECT COUNT(*) as count FROM skill_assessment_results WHERE practical_score IS NULL`;
        const assessedQuery = `SELECT COUNT(DISTINCT user_id) as count FROM skill_assessment_results WHERE practical_score IS NOT NULL`;
        const totalWorkersQuery = `SELECT COUNT(*) as count FROM dbuser WHERE role = 'worker'`;
        const totalForemanQuery = `SELECT COUNT(*) as count FROM dbuser WHERE role = 'foreman'`;

        const [pending] = await pool.query(pendingQuery);
        const [assessed] = await pool.query(assessedQuery);
        const [totalW] = await pool.query(totalWorkersQuery);
        const [totalF] = await pool.query(totalForemanQuery);

        return {
            pendingAssessment: pending[0].count,
            assessedWorkers: assessed[0].count,
            totalWorkers: totalW[0].count,
            totalForemen: totalF[0].count
        };
    }

    // ✅ 2. แก้ไข: ดึงเฉพาะช่างที่ "รอการประเมิน" (practical_score IS NULL)
    static async getWorkersList() {
        const sql = `
            SELECT 
                u.id, 
                u.full_name, 
                u.technician_type as skill,
                sr.skill_level as current_level, -- เอา Level จากผลการสอบล่าสุดที่รอประเมิน
                ta.t_a_id,
                ta.task_name,
                ta.status
            FROM skill_assessment_results sr
            JOIN dbuser u ON sr.user_id = u.id
            LEFT JOIN task_assessment ta ON u.id = ta.worker_id
            WHERE u.role = 'worker'
            AND sr.practical_score IS NULL  -- ✅ กรองเฉพาะคนที่รอประเมิน
            ORDER BY sr.created_at ASC
        `;
        const [rows] = await pool.query(sql);
        
        return rows.map(r => ({
            ...r,
            current_level: r.current_level ? r.current_level : 0
        }));
    }

    // 3. สร้างงานประเมิน (เหมือนเดิม)
    static async createTask(data) {
        const { task_name, task_type, site_location, description, start_date, end_date, manager_id, worker_id } = data;
        const sql = `
            INSERT INTO task_assessment 
            (task_name, task_type, site_location, description, start_date, end_date, manager_id, worker_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(sql, [task_name, task_type, site_location, description, start_date, end_date, manager_id, worker_id]);
        return result.insertId;
    }

    // 4. ลบงาน (เหมือนเดิม)
    static async deleteTask(taskId) {
        const sql = 'DELETE FROM task_assessment WHERE t_a_id = ?';
        const [result] = await pool.query(sql, [taskId]);
        return result.affectedRows;
    }
}

module.exports = PMDashboard;