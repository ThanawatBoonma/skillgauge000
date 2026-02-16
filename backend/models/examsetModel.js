const pool = require('../config/db');

// ดึงข้อมูลตาม Level
exports.getByLevel = async (level) => {
  const sql = 'SELECT * FROM examset_structure WHERE level = ?';
  const [rows] = await pool.query(sql, [level]);
  return rows[0];
};

// อัปเดตข้อมูล (Update)
exports.update = async (level, data) => {
  const { rebar_percent, concrete_percent, formwork_percent, element_percent, theory_percent } = data;
  const sql = `
    UPDATE examset_structure 
    SET 
      rebar_percent = ?, 
      concrete_percent = ?, 
      formwork_percent = ?, 
      element_percent = ?, 
      theory_percent = ?
    WHERE level = ?
  `;
  const [result] = await pool.query(sql, [
    rebar_percent, concrete_percent, formwork_percent, element_percent, theory_percent, level
  ]);
  return result.affectedRows > 0;
};