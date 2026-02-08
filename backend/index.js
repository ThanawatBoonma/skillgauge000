require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const locationRoutes = require('./routes/location');

const pmRoutes = require('./routes/pmRoutes');

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // อนุญาตเฉพาะ Frontend ของเรา
  credentials: true                // อนุญาตให้ส่ง Cookies/Token ข้ามมาได้
}));

const pool = require('./config/db');

app.use('/api', require('./routes/auth'));

app.use('/api/manageusers', require('./routes/manageusers'));

app.use('/api/quiz', require('./routes/quiz'));

app.use('/api/location', locationRoutes);

app.use('/api/managequestion', require('./routes/managequestion'));

app.use('/api/skillAssessment', require('./routes/skillAssessmentTest'));

app.use('/api/admin', require('./routes/manageusers'));

app.use('/api/manageproject', require('./routes/manageproject'));

// เพิ่ม Route สำหรับจัดการงานย่อย (Task)
app.use('/api/manageprojecttask', require('./routes/manageprojecttask'));

app.use('/api/wkdashboard', require('./routes/wkdashboard'));

app.use('/api/setting', require('./routes/setting'));

app.use('/api/pm', pmRoutes);

app.use('/api/assessment', require('./routes/assessment'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

function uuidHex() {
  return crypto.randomBytes(16).toString('hex');
}

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

app.get('/', (req, res) => res.send('API is running'));