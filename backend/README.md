# SkillGauge - Backend API Services

**SkillGauge Backend** เป็นบริการ RESTful API Server ที่สร้างขึ้นด้วย **Node.js** และ **Express.js** ทำหน้าที่เป็นศูนย์กลางประมวลผลข้อมูล เชื่อมต่อกับฐานข้อมูล MySQL จัดการสิทธิ์การเข้าถึง (Authentication & Authorization) จัดการคลังข้อสอบ โครงการ งาน และประวัติการประเมินทักษะ

---

## เทคโนโลยีที่ใช้ (Tech Stack)

- **Runtime Engine**: Node.js
- **Web Framework**: Express.js (v4.18.2)
- **Database Client**: `mysql2` (Connection Pool & Promises)
- **Authentication**: `jsonwebtoken` (JWT) & `bcryptjs` (Password Hashing)
- **File Uploads**: `multer` (อัปโหลดรูปภาพและไฟล์ประกอบ)
- **Validation**: `express-validator` & `zod`
- **Development Tool**: `nodemon`
- **CORS**: `cors` (รองรับ Cross-Origin Resource Sharing)

---

## โครงสร้างโฟลเดอร์ (Directory Structure)

```text
backend/
├── config/                # การตั้งค่าระบบ
│   └── db.js              # MySQL Connection Pool Config
├── controllers/           # Controller Logic ประมวลผลแต่ละ Endpoint
├── middleware/            # Middleware (Auth Check, Validation)
├── models/                # Database Access Logic / Queries
├── routes/                # Express Route Handlers
│   ├── adminroutes.js     # API ระบบจัดการ Admin & Metadata
│   ├── auth.js            # API ลงชื่อเข้าใช้ / ตรวจสอบสิทธิ์
│   ├── manageusers.js     # API จัดการข้อมูลผู้ใช้งาน
│   ├── quiz.js            # API จัดการคลังข้อสอบ
│   ├── examsetroutes.js   # API จัดการชุดแบบทดสอบ
│   ├── manageproject.js   # API บริหารจัดการโครงการ
│   ├── manageprojecttask.js # API บริหารจัดการงานย่อยในโครงการ
│   ├── skillAssessmentTest.js # API การทำแบบทดสอบทักษะ
│   ├── assessment.js      # API การประเมินผล
│   ├── wkdashboard.js     # API ข้อมูลแดชบอร์ด
│   ├── pmRoutes.js        # API สำหรับ Project Manager
│   ├── location.js        # API ข้อมูลสถานที่/สถานที่ทำงาน
│   └── setting.js         # API การตั้งค่าระบบ
├── uploads/               # โฟลเดอร์จัดเก็บไฟล์อัปโหลด (Static Files)
├── .env                   # Environment Variables
├── Dockerfile             # Dockerfile สำหรับ Containerize Backend
├── index.js               # Entry Point ของ Express Server
└── package.json           # Dependencies & Scripts
```

---

## การตั้งค่า Environment Variables (`.env`)

สร้างหรือแก้ไขไฟล์ `.env` ในโฟลเดอร์ `backend/`:

```env
DB_HOST=localhost       # หรือ 'db' หากรันผ่าน Docker Compose
DB_USER=root
DB_PASS=1234
DB_NAME=dbweb
PORT=4000

JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=1d
```

---

## การติดตั้งและรันโปรเจกต์ (Installation & Running)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันในโหมด Development (พร้อม Hot-Reload ด้วย Nodemon)
```bash
npm run dev
```

### 3. รันในโหมด Production / Standard
```bash
npm start
```
เซิร์ฟเวอร์จะเปิดทำงานที่พอร์ต `http://localhost:4000` (หรือตามค่า `PORT` ใน `.env`)

---

## สรุปรายการ API Endpoints หลัก (API Reference Summary)

| Prefix Path | Route File | รายละเอียดหน้าที่ |
| :--- | :--- | :--- |
| `/api/auth` | `auth.js` | เข้าสู่ระบบ (Login) และตรวจสอบสถานะยืนยันตัวตน |
| `/api/admin` | `adminroutes.js` | จัดการข้อมูลแอดมินและการอัปเดต Metadata แรงงาน |
| `/api/manageusers` | `manageusers.js` | เพิ่ม แก้ไข ดึงข้อมูลผู้ใช้งาน และลงทะเบียนแรงงาน |
| `/api/quiz` | `quiz.js` | สร้าง แก้ไข ดึงข้อมูลโจทย์และคำถามประเมินทักษะ |
| `/api/examset` | `examsetroutes.js` | จัดการชุดข้อสอบ (Exam Sets) |
| `/api/manageproject` | `manageproject.js` | สร้างและติดตามข้อมูลโครงการ (Projects) |
| `/api/manageprojecttask`| `manageprojecttask.js` | กำหนดงาน (Tasks) และจัดสรรแรงงานเข้าโครงการ |
| `/api/skillAssessment` | `skillAssessmentTest.js` | บันทึกคำตอบและคำนวณผลการทำแบบทดสอบทักษะแรงงาน |
| `/api/assessment` | `assessment.js` | บันทึกการประเมินทักษะและการปฏิบัติงาน |
| `/api/wkdashboard` | `wkdashboard.js` | สรุปข้อมูลสำหรับหน้าแดชบอร์ด |
| `/api/pm` | `pmRoutes.js` | การประเมินและดูประวัติของ Project Manager |
| `/uploads` | Static Middleware | เข้าถึงไฟล์รูปภาพและเอกสารที่อัปโหลดเข้าสู่ระบบ |

---

## การรันด้วย Docker

```bash
docker build -t skillgauge-backend .
docker run -p 4000:4000 --env-file .env skillgauge-backend
```
