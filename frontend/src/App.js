import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import AdminSignup from './pages/admin/Signup';
import AdminSignupCredentials from './pages/admin/SignupCredentials';
import AdminWorkerRegistration from './pages/admin/AdminWorkerRegistration';
import WKDashboard from './pages/WKDashboard';
import PMProjectManager from './pages/PMProjectManager';
import WKProjectTasks from './pages/WKProject_Tasks';
import ForemanAssessment from './pages/ForemanAssessment';
import ForemanDashboard from './pages/ForemanDashboard';
import WorkerDashboard from './pages/WorkerDashboard';    
import SkillAssessmentTest from './pages/SkillAssessmentTest';
import WKSkillAssessmentTest from './pages/WKSkill_Assessment_Test';
import WKSkillAssessmentQuiz from './pages/WKSkill_Assessment_Quiz';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Group 1: หน้าเว็บไซต์ปกติ (มีเมนูซ้าย/บน) */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="portfolio" element={<Services />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="admin/signup" element={<AdminRoute><AdminSignup /></AdminRoute>} />
            <Route path="admin/signup/credentials" element={<AdminRoute><AdminSignupCredentials /></AdminRoute>} />
            <Route path="admin/worker-registration" element={<AdminRoute><AdminWorkerRegistration /></AdminRoute>} />
            <Route path="dashboard" element={<WKDashboard />} />
            <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="pm" element={<PMProjectManager />} />
            <Route path="foreman" element={<ForemanDashboard />} />
            <Route path="foreman/assessment" element={<ForemanAssessment />} />
            <Route path="project-tasks" element={<WKProjectTasks />} />
            <Route path="skill-assessment" element={<WKSkillAssessmentTest />} />
            <Route path="skill-assessment/quiz" element={<WKSkillAssessmentQuiz />} />
            <Route path="worker" element={<WorkerDashboard />} />
            
            {/* เอาหน้าทำข้อสอบ (worker/test) ออกจากตรงนี้  */}
          </Route>

          {/* Group 2: หน้าแบบเต็มจอ (ไม่มีเมนูมารบกวน) */}
          {/* ✅ ย้ายมาไว้ตรงนี้ เพื่อให้หน้าสอบแสดงผลเต็มจอ */}
          <Route path="/worker/test" element={<SkillAssessmentTest />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;