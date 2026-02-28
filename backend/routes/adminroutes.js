const express = require('express');
const router = express.Router();
const Controller = require('../controllers/admincontroller');
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
    
    
    let userRoles = [];
    
    if (Array.isArray(payload.roles)) {
      userRoles = payload.roles; // กรณีระบบใหม่ส่งมาเป็น Array
    } else if (payload.role) {
      userRoles = [payload.role]; // กรณีระบบเก่าส่งมาเป็น String ตัวเดียว
    }
    
    // ยัด Role ใส่ req.user ให้ Middleware ตัวถัดไปใช้
    req.user = { 
      id: payload.sub || payload.id, 
      roles: userRoles 
    };
    
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

// Export Router
module.exports = router;