const pool = require('../config/db');

// ดึงปัญหาทั้งหมดของ Worker คนนั้น
exports.getIssuesByWorkerId = async (workerId) => {
  const sql = `
    SELECT 
      wi.*, 
      DATE_FORMAT(wi.created_at, '%d/%m/%Y %H:%i') as date_formatted,
      ta.task_name,
      ta.task_type as project_name
    FROM worker_issues wi
    LEFT JOIN task_assessment ta ON wi.task_id = ta.t_a_id
    WHERE wi.worker_id = ?
    ORDER BY wi.created_at DESC
  `;
  const [rows] = await pool.query(sql, [workerId]);
  return rows;
};

// สร้างรายการแจ้งปัญหาใหม่
exports.createIssue = async (issueData) => {
  const { worker_id, task_id, category, description, photo_url } = issueData;
  const sql = `
    INSERT INTO worker_issues (worker_id, task_id, category, description, photo_url, status)
    VALUES (?, ?, ?, ?, ?, 'รอดำเนินการ')
  `;
  const [result] = await pool.query(sql, [
    worker_id, 
    task_id || null, 
    category, 
    description, 
    photo_url || null
  ]);
  return result;
};

// ดึงรายการปัญหาสำหรับฝั่ง PM (ดึงเฉพาะงานที่ PM คนนั้นดูแล หรือปัญหาที่ไม่ได้ระบุงาน)
exports.getIssuesForPM = async (managerId) => {
  const sql = `
    SELECT 
      wi.*, 
      DATE_FORMAT(wi.created_at, '%d/%m/%Y %H:%i') as date_formatted,
      ta.task_name,
      ta.task_type as project_name,
      u.full_name as worker_name
    FROM worker_issues wi
    LEFT JOIN task_assessment ta ON wi.task_id = ta.t_a_id
    LEFT JOIN dbuser u ON wi.worker_id = u.id
    WHERE ta.manager_id = ? OR wi.task_id IS NULL
    ORDER BY wi.created_at DESC
  `;
  const [rows] = await pool.query(sql, [managerId]);
  return rows;
};

// อัปเดตสถานะปัญหาและบันทึกข้อความจาก PM
exports.updateIssueStatus = async (issueId, status, note) => {
  const sql = `
    UPDATE worker_issues 
    SET status = ?, resolution_note = ? 
    WHERE id = ?
  `;
  const [result] = await pool.query(sql, [status, note || null, issueId]);
  return result.affectedRows > 0;
};