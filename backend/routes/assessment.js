const express = require('express');
const router = express.Router();
const { submitAssessment, getForemanDashboardData } = require('../controllers/assessmentController');

// POST submit assessment
router.post('/submit', submitAssessment);

// ✅ GET รายชื่อช่างรอประเมิน (สำหรับ Foreman Dashboard)
router.get('/foreman-pending', getForemanDashboardData);

module.exports = router;