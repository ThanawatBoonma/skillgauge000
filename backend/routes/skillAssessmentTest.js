const express = require('express');
const router = express.Router();
// ✅ เพิ่ม checkExamStatus ในปีกกา
const { getAssessmentExam, submitAssessment, checkExamStatus } = require('../controllers/skillAssessmentTestController');

// GET /api/skillAssessment/test -> ดึงข้อสอบ
router.get('/test', getAssessmentExam);

// POST /api/skillAssessment/submit -> ส่งคำตอบ
router.post('/submit', submitAssessment);

// GET /api/skillAssessment/status -> เช็คสิทธิ์สอบ
router.get('/status', checkExamStatus);

module.exports = router;