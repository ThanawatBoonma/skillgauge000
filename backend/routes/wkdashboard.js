const express = require('express');
const router = express.Router();
const controller = require('../controllers/wkdashboardController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- ตั้งค่า Multer (ที่เก็บไฟล์) ---
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // โฟลเดอร์เก็บรูป (ต้องมีโฟลเดอร์นี้ที่ root ของ backend)
    },
    filename: function (req, file, cb) {
        // ตั้งชื่อไฟล์: task-{id}-{timestamp}.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'task-submission-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- Routes ---
router.get('/info', controller.getWorkerDashboardData);

// ✅ Route สำหรับส่งงาน (รับไฟล์ชื่อ 'photo')
router.post('/submit-task', upload.single('photo'), controller.submitTaskWork);

module.exports = router;