const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/provinces', locationController.getProvinces);
router.get('/districts/:province_id', locationController.getDistricts);
router.get('/subdistricts/:amphure_id', locationController.getSubdistricts); 

module.exports = router;