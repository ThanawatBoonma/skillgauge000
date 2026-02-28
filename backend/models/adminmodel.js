const pool = require('../config/db'); // <--- แก้ตรงนี้: เรียกใช้ Connection เดิมของคุณ

// --- Helper Functions ---
async function execute(sql, params = [], connection) {
  const executor = connection ?? pool;
  const [result] = await executor.execute(sql, params);
  return result;
}

async function query(sql, params = [], connection) {
  const result = await execute(sql, params, connection);
  return Array.isArray(result) ? result : [];
}

async function queryOne(sql, params = [], connection) {
  const rows = await query(sql, params, connection);
  return rows[0] ?? null;
}

async function withTransaction(handler) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await handler(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// --- Init Functions (สร้างตารางเสริมอัตโนมัติ) ---
// ฟังก์ชันนี้จะทำงานเฉพาะตารางที่ admin ต้องใช้เพิ่ม (เช่น audit_logs, questions)
// โดยจะไม่ไปยุ่งกับตาราง dbuser หรือ skill_assessment_results ที่คุณมีอยู่แล้ว

async function refreshWorkerMetadata() {
  try {
    await execute(`
      CREATE TABLE IF NOT EXISTS worker_profiles (
        worker_id INT PRIMARY KEY, 
        payload LONGTEXT, 
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
  } catch (e) { 
    console.warn('Ensure worker_profiles failed:', e.message); 
  }
}

module.exports = {
  pool,
  execute,
  query,
  queryOne,
  withTransaction,
  refreshWorkerMetadata,
};