const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const issueController = require('../controllers/workerissuecontroller');

// ตั้งค่าที่เก็บไฟล์รูปภาพ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // ต้องสร้างโฟลเดอร์ uploads ไว้ใน backend ด้วยนะครับ
  },
  filename: function (req, file, cb) {
    cb(null, 'issue-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET /api/issues/worker/:id
router.get('/worker/:id', issueController.getWorkerIssues);

// POST /api/issues
router.post('/', upload.single('photo'), issueController.reportIssue);

// pm
// GET /api/issues/worker/:id (ของ Worker เดิม)
router.get('/worker/:id', issueController.getWorkerIssues);

// POST /api/issues (ของ Worker เดิม)
router.post('/', upload.single('photo'), issueController.reportIssue);

// ✅ เพิ่ม 2 Routes ใหม่ สำหรับ PM
router.get('/pm/:managerId', issueController.getPMIssues);
router.put('/:id/status', issueController.updateIssueStatus);

module.exports = router;