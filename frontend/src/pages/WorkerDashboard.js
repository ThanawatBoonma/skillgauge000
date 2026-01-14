import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import './WKDashboard.css'; // ถ้ามีไฟล์ CSS แยกของ Worker ให้เปิดใช้นะครับ

const WorkerDashboard = () => {
  const navigate = useNavigate();

  // --- 1. Logic ดึงข้อมูล User & Task (เหมือนเดิม) ---
  const [user, setUser] = useState({ 
    name: 'ผู้ใช้งาน', 
    id: '', 
    role: 'worker' 
  });

  const [assignedTask, setAssignedTask] = useState(null); 
  const [loadingTask, setLoadingTask] = useState(false);

  useEffect(() => {
    const storedUserStr = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('auth_token');

    if (storedUserStr && token) {
      const storedUser = JSON.parse(storedUserStr);
      setUser(storedUser);
      fetchAssignedTask(storedUser.id);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchAssignedTask = async (workerId) => {
    setLoadingTask(true);
    try {
      // --- จำลองสถานการณ์ (เลือกเปิด/ปิด ได้เหมือนเดิม) ---
      
      // กรณี 1: ไม่มีงาน
      // setAssignedTask(null); 

      // กรณี 2: มีงานเข้า (เปิดอันนี้เทส)
      setAssignedTask({
        id: 'T-1024',
        project: 'โครงการหมู่บ้านจัดสรร The Zenith',
        location: 'โซน B - งานเทคานชั้น 2',
        foreman: 'หัวหน้าวิชัย',
        date: '08/01/2026',
        status: 'pending_acceptance' 
      });

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingTask(false);
    }
  };

  const handleAcceptTask = () => {
    const confirm = window.confirm("ยืนยันการรับงานนี้หรือไม่?");
    if (confirm) {
      setAssignedTask(prev => ({ ...prev, status: 'accepted' }));
      alert("รับงานเรียบร้อย สถานะเปลี่ยนเป็น 'รอการประเมินหน้างาน'");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate('/login');
  };

  // --- 2. ส่วนแสดงผล (ใช้ Class Name เดียวกับหน้า Foreman เป๊ะๆ) ---
  return (
    <div className="dash-layout">
      
      {/* Sidebar: ใช้ Class มาตรฐาน */}
      <aside className="dash-sidebar">
        <div className="sidebar-logo">SKILL GAUGE</div>
        <nav className="menu">
          <button className="menu-item active" onClick={() => navigate('/worker')}>
            หน้าหลัก
          </button>
          <button className="menu-item" onClick={() => navigate('/worker/profile')}>
            ข้อมูลส่วนตัว
          </button>
          <button className="menu-item" onClick={() => alert("ส่วนประวัติการทำงาน")}>
            ประวัติงาน
          </button>
          <button className="menu-item logout-btn" onClick={handleLogout} style={{ marginTop: 'auto', color: '#e74c3c' }}>
            ออกจากระบบ
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        {/* Topbar: ใช้ Class มาตรฐาน */}
        <div className="dash-topbar">
          {/* เปลี่ยนสี Pill เป็นสีเขียว (success) ให้รู้ว่าเป็น Worker */}
          <div className="role-pill bg-success text-white" style={{ background: '#27ae60', color: 'white' }}>
            WORKER PORTAL
          </div>
          <div className="top-actions">
            <span className="profile">
              <span className="avatar-circle" style={{ background: '#2c3e50' }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
              <span className="username">{user.name || 'กำลังโหลด...'}</span>
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="dashboard-content" style={{ padding: '30px' }}>
          
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', borderLeft: '5px solid #27ae60', paddingLeft: '15px' }}>
            สถานะปัจจุบัน
          </h2>

          {/* Status Grid: ใช้โครงสร้างเดียวกับหน้าอื่น */}
          <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="card-action" style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #f39c12' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '14px' }}>ระดับทักษะ</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>รอการประเมิน</div>
            </div>
            <div className="card-action" style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #3498db' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '14px' }}>งานที่ได้รับมอบหมาย</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                    {assignedTask && assignedTask.status === 'accepted' ? '1 งาน' : '0 งาน'}
                </div>
            </div>
            <div className="card-action" style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #95a5a6' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '14px' }}>คะแนนสอบข้อเขียน</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>-- / 60</div>
            </div>
          </div>

          <h2 style={{ color: '#2c3e50', marginBottom: '20px', borderLeft: '5px solid #27ae60', paddingLeft: '15px' }}>
            งานที่ได้รับมอบหมาย
          </h2>

          {/* Task Section */}
          <div style={{ marginBottom: '40px' }}>
            {loadingTask ? (
                <div style={{ padding: '30px', textAlign: 'center', background: 'white', borderRadius: '10px' }}>กำลังโหลดข้อมูล...</div>
            ) : !assignedTask ? (
                // Empty State
                <div style={{ background: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center', border: '2px dashed #e0e0e0' }}>
                    <h3 style={{ color: '#7f8c8d' }}>ยังไม่มีงานใหม่</h3>
                    <p style={{ color: '#bdc3c7' }}>เมื่องานถูกมอบหมาย รายละเอียดจะปรากฏที่นี่</p>
                </div>
            ) : assignedTask.status === 'pending_acceptance' ? (
                // New Task Card (งานใหม่)
                <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', borderLeft: '5px solid #f39c12' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <span style={{ background: '#f39c12', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>งานใหม่</span>
                            <h3 style={{ margin: '10px 0', color: '#2c3e50' }}>{assignedTask.project}</h3>
                            <p style={{ margin: '5px 0', color: '#555' }}><strong>สถานที่:</strong> {assignedTask.location}</p>
                            <p style={{ margin: '0', color: '#7f8c8d', fontSize: '14px' }}><strong>ผู้คุมงาน:</strong> {assignedTask.foreman} | <strong>วันที่:</strong> {assignedTask.date}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-secondary" style={{ padding: '8px 20px', border: '1px solid #bdc3c7', background: 'white', borderRadius: '5px', cursor: 'pointer' }}>ปฏิเสธ</button>
                            <button className="btn btn-primary" onClick={handleAcceptTask} style={{ padding: '8px 20px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>ตอบรับงาน</button>
                        </div>
                    </div>
                </div>
            ) : (
                // Accepted Task Card (รับงานแล้ว)
                <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '10px', border: '1px solid #c8e6c9', color: '#2e7d32' }}>
                    <strong>สถานะ:</strong> คุณได้รับงาน "{assignedTask.project}" เรียบร้อยแล้ว (กรุณารอการประเมินหน้างาน)
                </div>
            )}
          </div>

          <h2 style={{ color: '#2c3e50', marginBottom: '20px', borderLeft: '5px solid #27ae60', paddingLeft: '15px' }}>
            เมนูการใช้งาน
          </h2>

          {/* Action Grid */}
          <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
             
             {/* Card: แบบทดสอบ */}
             <div className="card-action" 
                  onClick={() => navigate('/worker/test')}
                  style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer', borderTop: '4px solid #3498db', transition: 'transform 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
             >
                <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>แบบทดสอบวัดทักษะ</h3>
                <p style={{ color: '#7f8c8d', marginBottom: '20px', lineHeight: '1.5' }}>ทำแบบทดสอบเพื่อวัดระดับความรู้ทางทฤษฎีและมาตรฐาน</p>
                <span style={{ color: '#3498db', fontWeight: 'bold', fontSize: '14px' }}>เริ่มทำข้อสอบ &rarr;</span>
             </div>

             {/* Card: ผลประเมิน */}
             <div className="card-action" 
                  style={{ background: '#f9f9f9', padding: '30px', borderRadius: '10px', border: '1px solid #eee', cursor: 'not-allowed', opacity: 0.7 }}
             >
                <h3 style={{ margin: '0 0 10px 0', color: '#95a5a6' }}>ผลการประเมิน</h3>
                <p style={{ color: '#b0bec5', marginBottom: '20px', lineHeight: '1.5' }}>ดูสรุปผลคะแนน ระดับฝีมือ และใบรับรองทักษะ</p>
                <span style={{ background: '#eee', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', color: '#999' }}>ยังไม่เปิดใช้งาน</span>
             </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;