const express = require('express');
const router = express.Router();
const Controller = require('./admincontroller');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// --- Middleware (ใส่ไว้ที่นี่เพื่อให้ Router นี้ทำงานได้จบในตัว) ---
function getTokenFromHeader(req) {
  const header = req.headers?.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : null;
}

function requireAuth(req, res, next) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ message: 'missing_token' });
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, roles: payload.roles || [] };
    next();
  } catch (e) { 
    return res.status(401).json({ message: 'invalid_token' }); 
  }
}

function authorizeRoles(...allowed) {
  return (req, res, next) => {
    if (!allowed.length) return next();
    const userRoles = req.user?.roles || [];
    // ถ้า User มี Role ใด Role หนึ่งที่อนุญาต ก็ให้ผ่าน
    if (allowed.some(role => userRoles.includes(role))) return next();
    return res.status(403).json({ message: 'forbidden' });
  };
}

// --- Routes ---

// Health Check
router.get('/health', (req, res) => res.json({ ok: true }));

// Tasks
router.get('/tasks', requireAuth, authorizeRoles('admin', 'project_manager'), Controller.getTasks);
router.post('/tasks', requireAuth, authorizeRoles('admin', 'project_manager'), Controller.createTask);

// Admin Users (System Admins List)
router.get('/users', requireAuth, authorizeRoles('admin'), Controller.getUsers);

// Admin Workers (จัดการพนักงาน)
// หมายเหตุ: Create/Update ตัดออกแล้ว ใช้ระบบเดิมของคุณ
router.get('/workers', requireAuth, authorizeRoles('admin'), Controller.getAllWorkers);
router.delete('/workers/:id', requireAuth, authorizeRoles('admin'), Controller.deleteWorker);
router.patch('/workers/:id/status', requireAuth, authorizeRoles('admin'), Controller.updateWorkerStatus);
router.patch('/workers/:id/assessment-access', requireAuth, authorizeRoles('admin'), Controller.toggleAssessmentAccess);

// Audit Logs
router.get('/audit-logs', requireAuth, authorizeRoles('admin'), Controller.getAuditLogs);

// Quiz Bank & Assessments (คลังข้อสอบ)
router.get('/questions', requireAuth, authorizeRoles('admin'), Controller.getQuestions);
router.post('/questions', requireAuth, authorizeRoles('admin'), Controller.createQuestion);
router.put('/questions/:id', requireAuth, authorizeRoles('admin'), Controller.updateQuestion);
router.delete('/questions/:id', requireAuth, authorizeRoles('admin'), Controller.deleteQuestion);

router.get('/assessments/rounds', requireAuth, authorizeRoles('admin'), Controller.getAssessmentRounds);
router.post('/assessments/rounds', requireAuth, authorizeRoles('admin'), Controller.saveAssessmentRound);
router.put('/assessments/rounds/:id', requireAuth, authorizeRoles('admin'), Controller.saveAssessmentRound);

// Export Router
module.exports = router;