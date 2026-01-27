const pool = require('../config/db');

exports.getAllProvinces = async () => {
  const sql = `
    SELECT 
      id, 
      name_th, 
      code 
    FROM provinces 
    ORDER BY name_th ASC
  `;
  const [rows] = await pool.query(sql);
  return rows;
};

exports.getDistrictsByProvince = async (provinceId) => {
  const sql = `
    SELECT 
      id, 
      name_th, 
      code 
    FROM amphures 
    WHERE province_id = ? 
    ORDER BY name_th ASC
  `;
  const [rows] = await pool.query(sql, [provinceId]);
  return rows;
};

exports.getSubdistrictsByDistrict = async (amphureId) => {
  const sql = `
    SELECT 
      id, 
      name_th, 
      zip_code 
    FROM districts 
    WHERE amphure_id = ? 
    ORDER BY name_th ASC
  `;
  const [rows] = await pool.query(sql, [amphureId]);
  return rows;
};