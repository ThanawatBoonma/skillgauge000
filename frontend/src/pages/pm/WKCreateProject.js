import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockUser } from '../../mock/mockData';
import '../pm/WKDashboard.css';

// ✅ ถ้ามึงก๊อปไปลงไฟล์ WKProject_Tasks.js ให้เปลี่ยนชื่อเป็น const WKProjectTasks = () => {
const WKCreateProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = { ...mockUser, role: 'Project Manager', name: 'สมชาย ใจดี' };

  // ฟังก์ชัน Logout สำหรับ Sidebar
  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const [loading, setLoading] = useState(false);
  const [projectInfo, setProjectInfo] = useState({
    projectName: '',
    projectType: 'บ้านพักอาศัย',
    location: '',
    startDate: '',
    endDate: '',
    description: '', // ✅ เพิ่มฟิลด์รายละเอียดเพิ่มเติม
    pmName: user.name 
  });

  const handleProjectChange = (e) => {
    setProjectInfo({ ...projectInfo, [e.target.name]: e.target.value });
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!projectInfo.projectName) { alert("กรุณาระบุชื่อโครงการหลัก"); return; }
    setLoading(true);

    const currentJobs = JSON.parse(localStorage.getItem('mock_jobs') || '[]');
    const newProject = { 
      ...projectInfo, 
      tasks: [], 
      status: 'กำลังวางแผน',
      createdAt: new Date().toISOString()
    };
    
    currentJobs.unshift(newProject);
    localStorage.setItem('mock_jobs', JSON.stringify(currentJobs));

    setTimeout(() => {
      setLoading(false);
      alert("บันทึกโครงการหลักเรียบร้อยแล้ว!");
      navigate('/projects'); 
    }, 500);
  };

  return (
    <div className="dash-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      
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
            className={`menu-item ${location.pathname === '/pm-settings' ? 'active' : ''}`} 
            onClick={() => navigate('/pm-settings', { state: { user } })}
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

      <main className="dash-main" style={{ padding: '40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <header style={{ marginBottom: '40px' }}>
            <h1 style={{ color: '#1e293b', fontSize: '32px', fontWeight: '800', margin: 0 }}>สร้างโครงการหลัก</h1>
            <p style={{ color: '#64748b', marginTop: '10px', fontSize: '16px' }}>บันทึกข้อมูลโครงการเบื้องต้นก่อน (กันลืม) เพื่อไปกำหนดงานย่อยต่อที่หน้า Projects</p>
          </header>

          <form onSubmit={handleSaveProject}>
            <section style={{ 
              background: 'white', 
              padding: '40px', 
              borderRadius: '24px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' 
            }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                {/* แถวที่ 1: ชื่อโครงการ และ ประเภทโครงการ */}
                <div>
                  <label style={labelStyle}>ชื่อโครงการ</label>
                  <input className="input" name="projectName" placeholder="ระบุชื่อโครงการ" value={projectInfo.projectName} onChange={handleProjectChange} required style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>ประเภทโครงการ</label>
                  <select className="select" name="projectType" value={projectInfo.projectType} onChange={handleProjectChange} style={inputStyle}>
                    <option value="บ้านพักอาศัย">บ้านพักอาศัย (Residential)</option>
                    <option value="อาคารพาณิชย์">อาคารพาณิชย์ (Commercial)</option>
                    <option value="คอนโดมิเนียม">คอนโดมิเนียม (Condominium)</option>
                    <option value="โรงงาน/คลังสินค้า">โรงงาน/คลังสินค้า (Factory)</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>

                {/* แถวที่ 2: สถานที่หน้างาน (แบบตัวใหญ่) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>สถานที่ตั้งโครงการ (Site Location)</label>
                  <textarea className="input" name="location" placeholder="ระบุที่อยู่หรือตำแหน่งที่ตั้งโครงการ" value={projectInfo.location} onChange={handleProjectChange} required style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
                </div>

                {/* ✅ แถวที่ 3: รายละเอียดโครงการเพิ่มเติม (เพิ่มใหม่ตามมึงสั่ง) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>รายละเอียดโครงการเพิ่มเติม (Description)</label>
                  <textarea className="input" name="description" placeholder="ระบุรายละเอียดอื่นๆ เช่น ข้อมูลลูกค้า, เบอร์โทรติดต่อ, หรือบันทึกช่วยจำ" value={projectInfo.description} onChange={handleProjectChange} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
                </div>

                {/* แถวที่ 4: วันเริ่ม และ วันที่สิ้นสุด */}
                <div>
                  <label style={labelStyle}>วันที่เริ่มโครงการ</label>
                  <input className="input" type="date" name="startDate" value={projectInfo.startDate} onChange={handleProjectChange} required style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>วันที่สิ้นสุด (โดยประมาณ)</label>
                  <input className="input" type="date" name="endDate" value={projectInfo.endDate} onChange={handleProjectChange} required style={inputStyle} />
                </div>

              </div>

              <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <button type="submit" disabled={loading} style={{ background: loading ? '#94a3b8' : '#10b981', color: 'white', padding: '16px 80px', borderRadius: '50px', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>
                  {loading ? 'กำลังบันทึก...' : 'บันทึกโครงการลง Projects ➝'}
                </button>
              </div>

            </section>
          </form>
        </div>
      </main>
    </div>
  );
};

// สไตล์คุมเลเยอร์ให้คลีน
const labelStyle = { fontWeight: '700', display: 'block', marginBottom: '10px', color: '#475569', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '14px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '16px', background: '#fcfcfc', outline: 'none' };

export default WKCreateProject;