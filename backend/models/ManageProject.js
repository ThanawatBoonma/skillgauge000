const pool = require('../config/db');

// ดึงโปรเจคทั้งหมด (เฉพาะของ PM คนนั้น)
exports.findAllByManager = async (managerId) => {
    const sql = 'SELECT * FROM projects WHERE manager_id = ? ORDER BY pj_id DESC';
    const [rows] = await pool.query(sql, [managerId]);
    return rows;
};

// ดึงโปรเจคตาม ID
exports.findById = async (pjId) => {
    const sql = 'SELECT * FROM projects WHERE pj_id = ?';
    const [rows] = await pool.query(sql, [pjId]);
    return rows[0];
};

// เพิ่มโปรเจคใหม่
exports.create = async (data) => {
    const { manager_id, project_name, project_type, site_location, description, start_date, end_date } = data;
    const sql = `
        INSERT INTO projects 
        (manager_id, project_name, project_type, site_location, description, start_date, end_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [manager_id, project_name, project_type, site_location, description, start_date, end_date]);
    return result;
};

// อัปเดตโปรเจค
exports.update = async (pjId, data) => {
    const { project_name, project_type, site_location, description, start_date, end_date } = data;
    const sql = `
        UPDATE projects SET 
        project_name=?, project_type=?, site_location=?, description=?, start_date=?, end_date=?
        WHERE pj_id = ?
    `;
    const [result] = await pool.query(sql, [project_name, project_type, site_location, description, start_date, end_date, pjId]);
    return result.affectedRows > 0;
};

// ลบโปรเจค
exports.delete = async (pjId) => {
    const sql = 'DELETE FROM projects WHERE pj_id = ?';
    const [result] = await pool.query(sql, [pjId]);
    return result.affectedRows > 0;
};