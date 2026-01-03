// backend/routes/location.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Route สำหรับดึงข้อมูล
router.get('/provinces', locationController.getProvinces);
router.get('/districts/:province_code', locationController.getDistricts);
router.get('/subdistricts/:district_code', locationController.getSubdistricts);

module.exports = router;