// backend/models/Location.js
const pool = require('../config/db'); //

// ดึงรายชื่อจังหวัดทั้งหมด
exports.getAllProvinces = async () => {
  const sql = 'SELECT * FROM provinces ORDER BY name_th ASC';
  const [rows] = await pool.query(sql);
  return rows;
};

// ดึงรายชื่ออำเภอ ตามรหัสจังหวัด (province_code)
exports.getDistrictsByProvince = async (provinceCode) => {
  const sql = 'SELECT * FROM district WHERE province_code = ? ORDER BY name_th ASC';
  const [rows] = await pool.query(sql, [provinceCode]);
  return rows;
};

// ดึงรายชื่อตำบล ตามรหัสอำเภอ (district_code)
exports.getSubdistrictsByDistrict = async (districtCode) => {
  const sql = 'SELECT * FROM subdistrict WHERE district_code = ? ORDER BY name_th ASC';
  const [rows] = await pool.query(sql, [districtCode]);
  return rows;
};