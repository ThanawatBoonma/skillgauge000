const pool = require('../config/db'); //

exports.getAllProvinces = async () => {
  // ระบุชื่อ column ให้ตรงกับที่ React-Select รอรับ (id, name_th, code)
  // ถ้าใน DB ชื่อ 'code' อยู่แล้ว ก็ select code ได้เลย
  const sql = 'SELECT code AS id, name_th, code FROM provinces ORDER BY name_th ASC';
  const [rows] = await pool.query(sql);
  return rows;
};

exports.getDistrictsByProvince = async (provinceCode) => {
  const sql = 'SELECT code AS id, name_th, code FROM district WHERE province_code = ? ORDER BY name_th ASC';
  const [rows] = await pool.query(sql, [provinceCode]);
  return rows;
};

exports.getSubdistrictsByDistrict = async (districtCode) => {
  // ตาราง subdistrict มักจะมี zip_code ติดมาด้วย ให้ดึงมาด้วยครับ
  const sql = 'SELECT code AS id, name_th, zip_code FROM subdistrict WHERE district_code = ? ORDER BY name_th ASC';
  const [rows] = await pool.query(sql, [districtCode]);
  return rows;
};