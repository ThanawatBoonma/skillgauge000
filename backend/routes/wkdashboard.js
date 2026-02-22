const express = require('express');
const router = express.Router();
const controller = require('../controllers/wkdashboardController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'task-submission-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- Routes ---
router.get('/info', controller.getWorkerDashboardData);

// ✅ เพิ่ม Route ใหม่สำหรับดึงประวัติ
router.get('/history', controller.getWorkerHistoryData);

router.post('/submit-task', upload.single('photo'), controller.submitTaskWork);

// ✅ Route ใหม่ดึงประวัติงาน
router.get('/task-history', controller.getWorkerTaskHistoryList);

// ✅ เพิ่ม Route ใหม่สำหรับเช็ค Cooldown
router.get('/check-cooldown', controller.checkTestCooldown);

module.exports = router;