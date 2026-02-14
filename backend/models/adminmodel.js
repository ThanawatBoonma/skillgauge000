require('dotenv').config();
const mysql = require('mysql2/promise');
const { randomUUID } = require('crypto');

// ดึงค่า Config จาก .env
const {
  MYSQL_HOST = 'localhost',
  MYSQL_PORT = '3306',
  MYSQL_DATABASE = 'admin-worker-registration',
  MYSQL_USER = 'root',
  MYSQL_PASSWORD = 'rootpassword',
  MYSQL_CONNECT_TIMEOUT_MS = '2000',
} = process.env;

// --- Database Connection ---
const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  database: MYSQL_DATABASE,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  connectTimeout: Number(MYSQL_CONNECT_TIMEOUT_MS) || 2000,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: false
});

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

// --- Init Functions (สร้างตารางอัตโนมัติ) ---

// 1. ตารางเก็บข้อมูลเสริมของ Worker
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

// 2. ตารางระบบข้อสอบ (Quiz Bank & Assessments)
async function ensureAssessmentSchema(connection) {
    const executor = connection ?? pool;
    try {
      // ตารางคำถาม
      await executor.execute(`
        CREATE TABLE IF NOT EXISTS questions (
          id CHAR(36) PRIMARY KEY, 
          text TEXT, 
          category VARCHAR(120), 
          subcategory VARCHAR(120), 
          difficulty VARCHAR(60), 
          version VARCHAR(60), 
          active TINYINT(1) DEFAULT 1, 
          created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6), 
          updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        )
      `);
      
      // ตารางตัวเลือกคำตอบ
      await executor.execute(`
        CREATE TABLE IF NOT EXISTS question_options (
          id CHAR(36) PRIMARY KEY, 
          question_id CHAR(36), 
          text TEXT, 
          is_correct TINYINT(1) DEFAULT 0, 
          FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
        )
      `);

      // ตารางรอบการสอบ (Rounds)
      await executor.execute(`
        CREATE TABLE IF NOT EXISTS assessment_rounds (
          id CHAR(36) PRIMARY KEY, 
          title VARCHAR(200), 
          category VARCHAR(120), 
          description TEXT, 
          question_count INT DEFAULT 60, 
          start_at DATETIME(6), 
          end_at DATETIME(6), 
          frequency_months INT, 
          passing_score INT, 
          duration_minutes INT, 
          show_score TINYINT(1), 
          show_answers TINYINT(1), 
          show_breakdown TINYINT(1), 
          subcategory_quotas JSON, 
          difficulty_weights JSON, 
          criteria JSON, 
          status VARCHAR(50), 
          active TINYINT(1), 
          history JSON, 
          created_by CHAR(36), 
          updated_by CHAR(36), 
          created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6), 
          updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        )
      `);

      // ตาราง Audit Logs (สำหรับบันทึกกิจกรรม)
      await executor.execute(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user VARCHAR(100),
          role VARCHAR(50),
          action VARCHAR(100),
          details JSON,
          ip_address VARCHAR(45),
          status VARCHAR(20),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

    } catch (e) {
      console.warn('Ensure assessment schema failed:', e.message);
    }
}

// Export แบบ CommonJS
module.exports = {
  pool,
  execute,
  query,
  queryOne,
  withTransaction,
  refreshWorkerMetadata,
  ensureAssessmentSchema
};