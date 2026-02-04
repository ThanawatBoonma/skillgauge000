import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockUser } from '../../mock/mockData';
import '../pm/WKDashboard.css';

const WKProjectTasks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ จุดสำคัญ: รับข้อมูลโครงการที่ส่งมาจากหน้า Projects (TaskSummary)
  const incomingProject = location.state?.project;
  const user = location.state?.user || { ...mockUser, role: 'Project Manager', name: 'สมชาย ใจดี' };
  
  // ฟังก์ชัน Logout สำหรับ Sidebar
  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      sessionStorage.clear();
      navigate('/login');
    }
  };

  // ✅ ข้อมูลงานย่อย (ล้างค่าว่างเสมอเพื่อรอรับงานใหม่)
  const [taskForm, setTaskForm] = useState({
    taskName: '',
    taskType: 'งานโครงสร้าง',
    milpCondition: 'ทั่วไป',
    requiredWorkers: '1',
    taskDetail: '',         
  });

  // ดักฟัง: ถ้าไม่มีข้อมูลโครงการส่งมาให้ดีดกลับหน้าลิสต์โครงการทันที (กันคนกดเข้าหน้าตรงๆ)
  useEffect(() => {
    if (!incomingProject) {
      alert("กรุณาเลือกโครงการจากหน้า Projects ก่อนเพิ่มงานย่อย");
      navigate('/projects');
    }
  }, [incomingProject, navigate]);

  const handleTaskChange = (e) => {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  };

  const handleSubmitToAssign = (e) => {
    e.preventDefault();
    // ✅ ส่งข้อมูล "โครงการเดิม" + "งานย่อยใหม่" ไปหน้าเลือกช่าง
    navigate('/assign-worker', { 
      state: { 
        job: { ...incomingProject, ...taskForm }, 
        user 
      } 
    });
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
            className={`menu-item ${location.pathname === '/project-tasks' || location.pathname === '/define-tasks' ? 'active' : ''}`} 
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
          
          {/* ✅ เลเยอร์หัวข้อ: แสดงชื่อโครงการที่กำลังเพิ่มงานให้ (สีน้ำเงินเข้ม) */}
          <header style={{ marginBottom: '30px' }}>
            <div style={{ background: '#1e293b', color: 'white', padding: '25px 35px', borderRadius: '20px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}>
              <h2 style={{ margin: 0, fontSize: '24px' }}>🏗️ เพิ่มภารกิจย่อยในโครงการ: {incomingProject?.projectName}</h2>
              <p style={{ opacity: 0.8, marginTop: '8px', fontSize: '14px' }}>
                ประเภท: {incomingProject?.projectType} | สถานที่: {incomingProject?.location || incomingProject?.locationDetail}
              </p>
            </div>
          </header>

          <form onSubmit={handleSubmitToAssign}>
            {/* ✅ เลเยอร์ฟอร์ม: สีขาวมนๆ พร้อม Shadow นุ่มๆ */}
            <section style={{ 
              background: 'white', 
              padding: '40px', 
              borderRadius: '24px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
            }}>
              <h3 style={{ color: '#1e293b', marginBottom: '25px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>รายละเอียดภารกิจใหม่</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                {/* ✅ แถวที่ 1: ชื่อภารกิจ และ ประเภทงานช่าง (อยู่คู่กัน) */}
                <div>
                  <label style={labelStyle}>ชื่องานย่อย</label>
                  <input 
                    className="input" 
                    name="taskName" 
                    placeholder="เช่น งานเดินสายไฟห้องน้ำ" 
                    value={taskForm.taskName} 
                    onChange={handleTaskChange} 
                    required 
                    style={inputStyle} 
                  />
                </div>

                <div>
                  <label style={labelStyle}>ประเภทสายงานช่าง</label>
                  <select className="select" name="taskType" value={taskForm.taskType} onChange={handleTaskChange} style={inputStyle}>
                    <option value="งานโครงสร้าง">งานโครงสร้าง</option>
                    <option value="งานไฟฟ้า">งานไฟฟ้า</option>
                    <option value="งานประปา">งานประปา</option>
                    <option value="งานสี">งานสี</option>
                    <option value="งานกระเบื้อง">งานกระเบื้อง</option>
                    <option value="งานหลังคา">งานหลังคา</option>
                  </select>
                </div>

                {/* ✅ แถวที่ 2: เงื่อนไขงาน และ จำนวนช่าง */}
                <div>
                  <label style={labelStyle}>เงื่อนไขงาน (Priority)</label>
                  <select className="select" name="milpCondition" value={taskForm.milpCondition} onChange={handleTaskChange} style={inputStyle}>
                    <option value="ทั่วไป">ทั่วไป (Normal)</option>
                    <option value="เร่งด่วน">เร่งด่วน (Urgent)</option>
                    <option value="วิกฤต">วิกฤต (Critical)</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>จำนวนช่างที่ต้องการ (คน)</label>
                  <input 
                    type="number" 
                    className="input" 
                    name="requiredWorkers" 
                    value={taskForm.requiredWorkers} 
                    onChange={handleTaskChange} 
                    min="1" 
                    required 
                    style={inputStyle} 
                  />
                </div>

                {/* ✅ แถวที่ 3: รายละเอียดงานย่อย (Textarea ตัวใหญ่) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>รายละเอียดและคำสั่งงานปฏิบัติ</label>
                  <textarea 
                    className="input" 
                    name="taskDetail" 
                    placeholder="ระบุรายละเอียดงานที่ต้องการให้ช่างปฏิบัติอย่างละเอียด..." 
                    value={taskForm.taskDetail} 
                    onChange={handleTaskChange} 
                    required 
                    style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} 
                  />
                </div>

              </div>

              {/* ปุ่มบันทึก - สีส้มโมเดิร์น (#e67e22) เพื่อให้ต่างจากหน้าโครงการหลัก */}
              <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <button 
                  type="submit" 
                  style={{ 
                    background: '#e67e22', 
                    color: 'white', 
                    padding: '16px 80px', 
                    borderRadius: '50px', 
                    border: 'none', 
                    fontWeight: 'bold', 
                    fontSize: '18px', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(230, 126, 34, 0.2)'
                  }}
                >
                  บันทึกภารกิจและไปเลือกช่าง ➝
                </button>
              </div>

            </section>
          </form>
        </div>
      </main>
    </div>
  );
};

// สไตล์คุมเลเยอร์
const labelStyle = { 
  fontWeight: '700', 
  display: 'block', 
  marginBottom: '10px', 
  color: '#475569', 
  fontSize: '14px' 
};

const inputStyle = { 
  width: '100%', 
  padding: '14px 20px', 
  borderRadius: '12px', 
  border: '1px solid #cbd5e1', 
  boxSizing: 'border-box',
  fontSize: '16px',
  background: '#fcfcfc',
  outline: 'none'
};

export default WKProjectTasks;