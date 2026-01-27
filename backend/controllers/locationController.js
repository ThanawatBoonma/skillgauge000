// backend/controllers/locationController.js
const Location = require('../models/Location');

exports.getProvinces = async (req, res) => {
  try {
    const provinces = await Location.getAllProvinces();
    
    // [เพิ่มบรรทัดนี้] ให้มันปริ้นค่าออกมาดูใน Terminal ของ Backend
    console.log("Provinces fetched from DB:", provinces.length, "rows"); 
    
    res.json(provinces);
  } catch (err) {
    console.error("Error fetching provinces:", err); 
    res.status(500).json({ error: err.message });
  }
};

exports.getDistricts = async (req, res) => {
  try {
    const { province_id } = req.params;
    const districts = await Location.getDistrictsByProvince(province_id);
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubdistricts = async (req, res) => {
  try {
    const { amphure_id } = req.params;
    const subdistricts = await Location.getSubdistrictsByDistrict(amphure_id);
    res.json(subdistricts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};