const express = require('express');
const router = express.Router();
const { getAssessmentExam, submitAssessment } = require('../controllers/skillAssessmentTestController');

// Import Middleware (ถ้าต้องการให้ Login ก่อนสอบ ให้เปิดใช้)
// const { protect } = require('../middleware/authMiddleware');

// GET /api/skillAssessment/test -> ดึงข้อสอบ 60 ข้อ
router.get('/test', getAssessmentExam);

// POST /api/skillAssessment/submit -> ส่งคำตอบ
router.post('/submit', submitAssessment);

module.exports = router;