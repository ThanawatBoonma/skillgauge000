// routes/managequestion.js
const express = require('express');
const router = express.Router();

// Import Controller
const { 
  getAllQuestions, 
  addQuestions, 
  updateQuestion, 
  deleteQuestion,
  getExamSetting,
  saveExamSetting
} = require('../controllers/managequestionController');

// Import Middleware
const { protect, adminOnly } = require('../middleware/authMiddleware');

// บังคับว่าต้อง Login และเป็น Admin เท่านั้น ถึงจะจัดการข้อสอบได้
router.use(protect);
router.use(adminOnly);

// GET /api/managequestion/all -> ดึงข้อสอบทั้งหมด
router.get('/all', getAllQuestions);

// POST /api/managequestion/add -> เพิ่มข้อสอบ (ส่งเป็น Array ได้)
router.post('/add', addQuestions);

// PUT /api/managequestion/update/:id -> แก้ไขข้อสอบรายข้อ
router.put('/update/:id', updateQuestion);

// DELETE /api/managequestion/delete/:id -> ลบข้อสอบรายข้อ
router.delete('/delete/:id', deleteQuestion);

// GET /api/managequestion/setting/:level
router.get('/setting/:level', getExamSetting); // อย่าลืม import getExamSetting เข้ามาด้านบน

// POST /api/managequestion/setting
router.post('/setting', saveExamSetting); // อย่าลืม import saveExamSetting เข้ามาด้านบน

module.exports = router;