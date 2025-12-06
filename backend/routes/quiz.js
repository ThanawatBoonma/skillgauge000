const express = require('express');
const router = express.Router();
const { getExamPaper, submitExam } = require('../controllers/quizController');

// GET /api/quiz/structural
router.get('/structural', getExamPaper);

// POST /api/quiz/submit
router.post('/submit', submitExam);
// สำคัญ Body ตอนส่ง answers: { "id": "answer" }
// { "answers": { "101": "A", "102": "B" } }

module.exports = router;