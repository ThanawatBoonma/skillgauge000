import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockUser } from '../../mock/mockData';
import '../pm/WKDashboard.css';

const ProjectDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ 1. ดึงข้อมูลโครงการจาก state ที่ส่งมาจากหน้าก่อนหน้า
  const { project } = location.state || {};
  
  // ✅ 2. ดึงข้อมูล user เพื่อเช็ค Role (ถ้าไม่มีให้ Default เป็น PM เพื่อความปลอดภัย)
  const user = location.state?.user || { ...mockUser, role: 'Foreman' };

  // ฟังก์ชัน Logout สำหรับ Sidebar
  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      sessionStorage.clear();
      navigate('/login');
    }
  };

  // ✅ 3. State สำหรับช่องค้นหางานย่อย
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ 4. ฟังก์ชันปุ่มย้อนกลับ: แก้ไขให้แยกทางเดินตาม Role
  const handleGoBack = () => {
    if (user.role === 'Foreman') {
      // ถ้าเป็น Foreman ให้กลับไปที่หน้าหลักของ Foreman
      navigate('/foreman'); 
    } else if (user.role === 'Worker') {
      // ถ้าเป็น Worker ให้กลับไปหน้า Worker Dashboard
      navigate('/worker');
    } else {
      // ถ้าเป็น Project Manager ให้กลับไปหน้ารวมโครงการเดิม
      navigate('/projects');
    }
  };

  // ✅ 5. กรณีไม่พบข้อมูลโครงการ
  if (!project) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2 style={{ color: '#e74c3c' }}>ไม่พบข้อมูลโครงการในระบบ</h2>
        <p style={{ color: '#64748b' }}>กรุณากลับไปเลือกโครงการใหม่อีกครั้ง</p>
        <button 
          onClick={handleGoBack} 
          style={{ padding: '12px 25px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '20px' }}
        >
          กลับไปหน้าหลัก
        </button>
      </div>
    );
  }

  // ✅ 6. ฟังก์ชันข้ามไปหน้าเพิ่มงานย่อย (เฉพาะ PM เท่านั้นที่เห็น)
  const handleAddNewTask = () => {
    const projectData = {
      projectName: project.projectName,
      projectType: project.projectType,
      locationDetail: project.locationDetail,
      pmName: project.pmName || user.name,
      isExistingProject: true 
    };
    navigate('/define-tasks', { state: { project: projectData, user } });
  };

  // ✅ 7. ดึงรายการงานย่อย (tasks)
  const allTasks = project.tasks || []; 
  
  // ✅ 8. กรองข้อมูลงานย่อยตามคำค้นหา (Search Logic)
  const filteredTasks = allTasks.filter(task => 
    task.taskName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.taskType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dash-layout">
      {/* Sidebar - ปรับให้เหมือน Worker/Foreman */}
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
          PM Portal
        </div>
        <nav className="menu">
          <button 
            type="button" 
            className={`menu-item ${location.pathname === '/pm' || location.pathname === '/dashboard' ? 'active' : ''}`} 
            onClick={() => navigate('/pm', { state: { user } })}
          >
            หน้าหลัก
          </button>
          <button 
            type="button" 
            className={`menu-item ${location.pathname === '/project-tasks' ? 'active' : ''}`} 
            onClick={() => navigate('/project-tasks', { state: { user } })}
          >
            มอบหมายงาน
          </button>
          <button 
            type="button" 
            className={`menu-item ${location.pathname === '/projects' ? 'active' : ''}`} 
            onClick={() => navigate('/projects', { state: { user } })}
          >
            โครงการทั้งหมด
          </button>
          <button 
            type="button" 
            className={`menu-item ${location.pathname === '/PMSettings' ? 'active' : ''}`} 
            onClick={() => navigate('/PMSettings', { state: { user } })}
          >
            ตั้งค่า
          </button>
          <button 
            type="button" 
            className="menu-item logout-btn" 
            style={{ marginTop: '20px', color: '#ef4444', background: '#fef2f2', borderColor: '#fee2e2' }}
            onClick={handleLogout}
          >
            ออกจากระบบ
          </button>
        </nav>
      </aside>

      <main className="dash-main" style={{ width: '100%', marginLeft: 0 }}>
        {/* ✅ 10. Topbar: ส่วนควบคุมด้านบน */}
        <div className="dash-topbar" style={{ padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={handleGoBack} style={{ background: '#f1f2f6', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>← ย้อนกลับ</button>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>รายละเอียดโครงการฉบับเต็ม</h2>
          </div>
          
          {/* ✅ 11. แสดงปุ่มเพิ่มงานเฉพาะ Role PM เท่านั้น */}
          {user.role === 'Project Manager' && (
            <button onClick={handleAddNewTask} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              + เพิ่มงานย่อยใหม่
            </button>
          )}
        </div>

        <div style={{ padding: '30px' }}>
          {/* ✅ 12. ส่วนแสดงข้อมูลโครงการหลัก */}
          <div style={{ background: '#2c3e50', color: 'white', padding: '30px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
            <span style={{ color: '#3498db', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Project Overview</span>
            <h1 style={{ margin: '10px 0', fontSize: '28px' }}>{project.projectName}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px', opacity: 0.9 }}>
              <div> สถานที่: {project.locationDetail}</div>
              <div> ประเภท: {project.projectType}</div>
              <div> PM ผู้ดูแล: {project.pmName || user.name}</div>
            </div>
          </div>

          {/* ✅ 13. แถบค้นหางานย่อย */}
          <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>🛠️ รายการงานย่อย ({filteredTasks.length})</h3>
            <div style={{ position: 'relative', width: '350px' }}>
              <input 
                type="text" 
                placeholder=" ค้นหาชื่องานย่อย หรือหมวดหมู่..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '12px 20px', borderRadius: '30px', border: '2px solid #edf2f7', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* ✅ 14. รายการงานย่อย (Tasks List) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {filteredTasks.length > 0 ? filteredTasks.map((task, index) => (
              <div key={index} style={{ background: 'white', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '18px', color: '#1e293b' }}>{index + 1}. {task.taskName}</strong>
                    <span style={{ marginLeft: '15px', color: '#64748b', fontSize: '14px' }}>หมวดหมู่: {task.taskType}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ background: '#fff7ed', color: '#c2410c', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{task.milpCondition}</span>
                    <span style={{ background: '#f0fdf4', color: '#15803d', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>ช่าง {task.assigned_workers?.length || 0} คน</span>
                  </div>
                </div>

                <div style={{ padding: '25px', display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '40px' }}>
                  <div>
                    <h4 style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase' }}>รายละเอียดงาน:</h4>
                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>{task.taskDetail || "ไม่มีการระบุรายละเอียดเพิ่มเติม"}</p>
                  </div>
                  <div>
                    <h4 style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '15px', textTransform: 'uppercase' }}>รายชื่อช่างปฏิบัติงาน:</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                      {task.assigned_workers?.map((w, i) => (
                        <div key={i} style={{ padding: '15px', border: '1px solid #f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', color: '#1e293b' }}>{w.name}</span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>อายุ: {w.age} ปี | ประสบการณ์: {w.experience_years} ปี</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '14px' }}>Lv. {w.level}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                <p style={{ fontSize: '18px' }}>ไม่พบข้อมูลงานย่อยในโครงการนี้</p>
                <p style={{ fontSize: '14px' }}>ลองเปลี่ยนคำค้นหา หรือตรวจสอบสถานะโครงการอีกครั้ง</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;