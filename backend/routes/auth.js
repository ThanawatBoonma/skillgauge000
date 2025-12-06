const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { registerUser, loginUser } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware'); // Middleware ที่เราเคยสร้าง

// Route: POST /api/register
// Admin Login -> ได้ Token -> เอา Token แนบมายิง API นี้
router.post('/register',
  protect,   // 1. ต้อง Login แล้ว
  adminOnly, // 2. ต้องเป็น Role Admin เท่านั้น
  [
    // Validate หน้า 1-2 ที่รวมกันมา
    body('citizen_id').isLength({ min: 13, max: 13 }).withMessage('Citizen ID must be 13 digits'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('role').isIn(['admin', 'worker', 'foreman', 'projectmanager']),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    // ... validate อื่นๆ ตามต้องการ
  ],
  registerUser
);

// Route: POST /api/auth/login (สำหรับทุกคน)
router.post('/auth/login', loginUser);

module.exports = router;