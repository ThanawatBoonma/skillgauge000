import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import AdminWorkerRegistration from './pages/admin/AdminWorkerRegistration';
import ViewEditUser from './pages/admin/view_edituser';
import AdminQuestionForm from './pages/admin/AdminQuestionForm';
import AdminExamset from './pages/admin/AdminExamset';

// PM Pages (ย้ายเข้า folder pm)
import WKDashboard from './pages/pm/WKDashboard';
import PMProjectManager from './pages/pm/PMProjectManager';
import PMProjects from './pages/pm/PMProjects';
import WKCreateProject from './pages/pm/WKCreateProject'; 
import WKProjectTasks from './pages/pm/WKProject_Tasks';
import WKAssignWorker from './pages/pm/WKAssignWorker'; 
import ProjectDetail from './pages/pm/ProjectDetail';
import PMSettings from './pages/pm/PMSettings';
import TaskAssessment from './pages/pm/task_assessment';
import ViewTaskWk from './pages/pm/viewtaskwk';
import ViewTaskWkDetail from './pages/pm/viewtaskwkdetail';
import PMAssessmentHistory from './pages/pm/PMAssessmenthistory';
import PMAssessmentHistoryDetail from './pages/pm/PMAssessmenthistorydetail';

// Foreman Pages (ย้ายเข้า folder Foreman)
import ForemanAssessment from './pages/Foreman/ForemanAssessment';
import ForemanDashboard from './pages/Foreman/ForemanDashboard';
import ForemanReportSystem from './pages/Foreman/ForemanReportSystem';
import ForemanSettings from './pages/Foreman/ForemanSettings';
import FMTaskDetail from './pages/Foreman/fmtask_detail';
import FMAssessmentHistory from './pages/Foreman/FMAssessmenthistory';
import FMAssessmentHistoryDetail from './pages/Foreman/FMAssessmenthistorydetail';

// Worker Pages (ย้ายเข้า folder Worker)
import WorkerDashboard from './pages/Worker/WorkerDashboard';
import SkillAssessmentTest from './pages/Worker/SkillAssessmentTest'; 
import WorkerTaskDetail from './pages/Worker/WorkerTaskDetail';
import WorkerSettings from './pages/Worker/WorkerSettings';
import WorkerHistory from './pages/Worker/WorkerHistory';
import TaskWorkerHistory from './pages/Worker/taskworkerhistory';
import TaskWorkerHistoryDetail from './pages/Worker/taskworkerhistorydetail';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Group 1: หน้าเว็บไซต์ปกติ (มีเมนูซ้าย/บน) */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Login />} />     
            <Route path="login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="admin/worker-registration" element={<AdminRoute><AdminWorkerRegistration /></AdminRoute>} />
            <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/view-edit-user" element={<ViewEditUser />} />

            <Route path="/admin/quiz-bank" element={<AdminQuestionForm />} />
            <Route path="/admin/exam-set" element={<AdminExamset />} />
            

            {/* PM Routes */}
            <Route path="dashboard" element={<WKDashboard />} />
            <Route path="/pm" element={<PMProjectManager />} />
            <Route path="/projects" element={<PMProjects />} />
            <Route path="/project-tasks" element={<WKCreateProject />} /> 
            <Route path="/define-tasks" element={<WKProjectTasks />} /> 
            <Route path="/assign-worker" element={<WKAssignWorker />} /> 
            <Route path="/project-detail" element={<ProjectDetail />} />
            <Route path="/pm-settings" element={<PMSettings />} />
            <Route path="/task-assessment" element={<TaskAssessment />} />
            <Route path="/pm/viewtaskwk" element={<ViewTaskWk />} />
            <Route path="/pm/viewtaskwkdetail" element={<ViewTaskWkDetail />} />
            <Route path="/pm/assessment-history" element={<PMAssessmentHistory />} />
            <Route path="/pm/assessment-history-detail" element={<PMAssessmentHistoryDetail />} />

            {/* Foreman Routes */}
            <Route path="/foreman" element={<ForemanDashboard />} />
            <Route path="/foreman/assessment" element={<ForemanAssessment />} />
            <Route path="/foreman-reports" element={<ForemanReportSystem />} />
            <Route path="/foreman-settings" element={<ForemanSettings />} />
            <Route path="/foreman/task-detail" element={<FMTaskDetail />} />
            <Route path="/foreman/assessment-history" element={<FMAssessmentHistory />} />
            <Route path="/foreman/assessment-history-detail" element={<FMAssessmentHistoryDetail />} />

            {/* Worker Routes */}
            <Route path="/worker" element={<WorkerDashboard />} />
            <Route path="/worker/task-detail" element={<WorkerTaskDetail />} />
            <Route path="/worker-settings" element={<WorkerSettings />} />
            <Route path="/worker/history" element={<WorkerHistory />} />
            <Route path="/worker/task-history" element={<TaskWorkerHistory />} />
            <Route path="/worker/task-history-detail" element={<TaskWorkerHistoryDetail />} />
            
            {/* เอาหน้าทำข้อสอบ (worker/test) ออกจากตรงนี้  */}
          </Route>

          {/* Group 2: หน้าแบบเต็มจอ (ไม่มีเมนูมารบกวน) */}
          {/* ย้ายมาไว้ตรงนี้ เพื่อให้หน้าสอบแสดงผลเต็มจอ */}
          <Route path="/worker/test" element={<SkillAssessmentTest />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;