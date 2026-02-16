require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const locationRoutes = require('./routes/location');
const pmRoutes = require('./routes/pmRoutes');
const pool = require('./config/db');

// (ตรวจสอบว่าไฟล์เหล่านี้วางอยู่ที่ root หรือ folder ไหน แก้ path ให้ตรงนะครับ)
const adminRoutes = require('./routes/adminroutes'); 
const { refreshWorkerMetadata, ensureAssessmentSchema } = require('./models/adminmodel');

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // อนุญาตเฉพาะ Frontend ของเรา
  credentials: true                // อนุญาตให้ส่ง Cookies/Token ข้ามมาได้
}));

// --- Initialization (ส่วนใหม่) ---
// สร้างตารางที่จำเป็นสำหรับระบบ Admin ใหม่
(async () => {
  try {
    await refreshWorkerMetadata();
    await ensureAssessmentSchema();
    console.log('Admin metadata refreshed');
  } catch (err) {
    console.error('Failed to init admin metadata:', err);
  }
})();

app.use('/api', require('./routes/auth'));
app.use('/api/manageusers', require('./routes/manageusers'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/location', locationRoutes);
app.use('/api/managequestion', require('./routes/managequestion'));
app.use('/api/skillAssessment', require('./routes/skillAssessmentTest'));

app.use('/api/admin', adminRoutes);

app.use('/api/manageproject', require('./routes/manageproject'));
app.use('/api/manageprojecttask', require('./routes/manageprojecttask'));
app.use('/api/wkdashboard', require('./routes/wkdashboard'));
app.use('/api/setting', require('./routes/setting'));
app.use('/api/pm', pmRoutes);
app.use('/api/assessment', require('./routes/assessment'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/examset', require('./routes/examsetroutes'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});