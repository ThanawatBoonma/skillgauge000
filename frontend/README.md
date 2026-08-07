# SkillGauge - Frontend Client

**SkillGauge Frontend** เป็นเว็บแอปพลิเคชันส่วนหน้าแบบ Single Page Application (SPA) ที่สร้างขึ้นด้วย **React 19** สำหรับให้ผู้ใช้งานในบทบาทต่างๆ (Admin, PM, Foreman, Worker) ใช้งานระบบประเมินทักษะและบริหารจัดการโครงการ

---

## เทคโนโลยีที่ใช้ (Tech Stack)

- **Core Library**: React 19.x
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **UI Components & Icons**: Boxicons (`boxicons`)
- **Select Dropdown**: React Select (`react-select`)
- **Notifications & Modals**: SweetAlert2 (`sweetalert2`)
- **Styling**: Vanilla CSS, Flexbox/Grid Layout
- **Build Tool / Runner**: React Scripts (`react-scripts`)

---

## โครงสร้างโฟลเดอร์ (Directory Structure)

```text
frontend/
├── public/                # Static File Assets (index.html, favicon, ฯลฯ)
├── src/
│   ├── components/        # Components ส่วนกลาง
│   │   ├── AdminRoute.js  # Protected Route Guard สำหรับ Admin
│   │   ├── Layout.js      # Main Layout Framework (Navbar & Sidebar)
│   │   └── ...
│   ├── pages/             # หน้าการทำงานหลัก แบ่งตาม Role
│   │   ├── Login.js       # หน้าลงชื่อเข้าใช้ (Login)
│   │   ├── admin/         # หน้าสำหรับผู้ดูแลระบบ
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminWorkerRegistration.js
│   │   │   ├── AdminQuestionForm.js
│   │   │   ├── AdminExamset.js
│   │   │   └── view_edituser.js
│   │   ├── pm/            # หน้าสำหรับ Project Manager
│   │   │   ├── WKDashboard.js
│   │   │   ├── PMProjects.js
│   │   │   ├── WKCreateProject.js
│   │   │   ├── WKProject_Tasks.js
│   │   │   ├── WKAssignWorker.js
│   │   │   ├── task_assessment.js
│   │   │   └── PMAssessmenthistory.js
│   │   ├── Foreman/       # หน้าสำหรับ Foreman
│   │   │   ├── ForemanDashboard.js
│   │   │   ├── ForemanAssessment.js
│   │   │   ├── ForemanReportSystem.js
│   │   │   └── FMAssessmenthistory.js
│   │   └── Worker/        # หน้าสำหรับ Worker
│   │       ├── WorkerDashboard.js
│   │       ├── SkillAssessmentTest.js   # หน้าทำข้อสอบแบบเต็มจอ
│   │       ├── WorkerTaskDetail.js
│   │       └── taskworkerhistory.js
│   ├── utils/             # Utility/Helper functions
│   ├── App.js             # Route Configuration
│   ├── App.css            # Style หลักของแอปพลิเคชัน
│   └── index.js           # Entry point ของ React
├── .env                   # Environment Variables
├── Dockerfile             # Dockerfile สำหรับ Production (Nginx)
├── Dockerfile.dev         # Dockerfile สำหรับ Development
├── nginx.conf             # Configuration ของ Nginx (Production)
└── package.json           # Dependencies & Scripts
```

---

## การตั้งค่า Environment Variables (`.env`)

สร้างหรือแก้ไขไฟล์ `.env` ในโฟลเดอร์ `frontend/`:

```env
REACT_APP_API_URL=http://localhost:4000
PORT=3000
```

---

## การติดตั้งและรันโปรเจกต์ (Installation & Running)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันในโหมด Development
```bash
npm start
```
ระบบจะรันแอปพลิเคชันที่ [http://localhost:3000](http://localhost:3000)

### 3. Build สำหรับ Production
```bash
npm run build
```
ไฟล์ที่ผ่านการ Build จะถูกจัดเก็บไว้ในโฟลเดอร์ `build/` พร้อมสำหรับนำไปเซิร์ฟด้วย Web Server เช่น Nginx

---

## การรันด้วย Docker

### โหมด Development (`Dockerfile.dev`)
```bash
docker build -t skillgauge-frontend-dev -f Dockerfile.dev .
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules skillgauge-frontend-dev
```

### โหมด Production (`Dockerfile` + Nginx)
```bash
docker build -t skillgauge-frontend-prod -f Dockerfile .
docker run -p 80:80 skillgauge-frontend-prod
```

---

## โครงสร้าง Routing หลัก (Routes Summary)

| Path | Component | บทบาทผู้ใช้งาน | รายละเอียด |
| :--- | :--- | :--- | :--- |
| `/login` | `Login` | ทุกคน | หน้าเข้าสู่ระบบ |
| `/admin` | `AdminDashboard` | Admin | แดชบอร์ดภาพรวมระบบ Admin |
| `/admin/worker-registration` | `AdminWorkerRegistration` | Admin | หน้าลงทะเบียนข้อมูลแรงงาน |
| `/admin/quiz-bank` | `AdminQuestionForm` | Admin | คลังข้อสอบประเมินทักษะ |
| `/admin/exam-set` | `AdminExamset` | Admin | การจัดชุดข้อสอบ |
| `/dashboard` | `WKDashboard` | PM | แดชบอร์ดสำหรับ PM |
| `/projects` | `PMProjects` | PM | รายการและสถานะโครงการ |
| `/project-tasks` | `WKCreateProject` | PM | สร้างโครงการและงาน |
| `/foreman` | `ForemanDashboard` | Foreman | แดชบอร์ด Foreman |
| `/foreman/assessment` | `ForemanAssessment` | Foreman | แบบประเมินแรงงานหน้างาน |
| `/worker` | `WorkerDashboard` | Worker | แดชบอร์ดประจำตัวแรงงาน |
| `/worker/test` | `SkillAssessmentTest` | Worker | หน้าทำแบบทดสอบ (Full Screen) |
