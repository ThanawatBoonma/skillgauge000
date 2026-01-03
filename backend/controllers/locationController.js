// backend/controllers/locationController.js
const Location = require('../models/Location');

exports.getProvinces = async (req, res) => {
  try {
    const provinces = await Location.getAllProvinces();
    res.json(provinces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDistricts = async (req, res) => {
  try {
    const { province_code } = req.params;
    const districts = await Location.getDistrictsByProvince(province_code);
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubdistricts = async (req, res) => {
  try {
    const { district_code } = req.params;
    const subdistricts = await Location.getSubdistrictsByDistrict(district_code);
    res.json(subdistricts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};