import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css'; 

const WorkerDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: 'ผู้ใช้งาน', id: '', role: 'worker' });
  const [assignedTask, setAssignedTask] = useState(null); 
  const [skillLevel, setSkillLevel] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- State สำหรับ Modals ---
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  
  // ✅ เพิ่ม State สำหรับ Modal Cooldown
  const [showWaitModal, setShowWaitModal] = useState(false);
  const [waitDaysLeft, setWaitDaysLeft] = useState(0);

  useEffect(() => {
    const storedUserStr = sessionStorage.getItem('user');
    if (storedUserStr) {
      const u = JSON.parse(storedUserStr);
      setUser(u);
      fetchDashboardData(u.id);
    }
  }, []);

  const fetchDashboardData = async (userId) => {
    // โค้ดเดิม
    setLoading(true);
    try {
        const API = 'http://localhost:4000';
        const res = await axios.get(`${API}/api/wkdashboard/info?user_id=${userId}`);
        if (res.data) {
            setAssignedTask(res.data.assignedTask);
            setSkillLevel(res.data.skillLevel);
        }
    } catch (err) {
        console.error("Error fetching dashboard data:", err);
    } finally {
        setLoading(false);
    }
  };

  const handleGoToSubmit = () => {
     if (assignedTask) {
        navigate('/worker/task-detail', { state: { task: assignedTask } });
     } else {
        alert("คุณยังไม่มีงานที่ต้องส่ง");
     }
  };

  // ✅ แก้ไข Logic เช็คสิทธิ์การสอบ
  const handleStartTest = async () => {
    if (!user || !user.id) return;

    try {
        const API = 'http://localhost:4000';

        // 1. เช็ค Cooldown ก่อน (ดึง API ตัวใหม่)
        const cooldownRes = await axios.get(`${API}/api/wkdashboard/check-cooldown?user_id=${user.id}`);
        if (!cooldownRes.data.canTest) {
            setWaitDaysLeft(cooldownRes.data.daysLeft);
            setShowWaitModal(true); // เปิดป็อปอัพแจ้งเตือนเวลา
            return; // หยุดการทำงานถ้ายังไม่ครบกำหนด
        }

        // 2. ถ้าครบกำหนดเวลาแล้ว ให้ไปเช็คสถานะเดิม
        const res = await axios.get(`${API}/api/skillAssessment/status?user_id=${user.id}`);
        const { status, nextLevel } = res.data;

        if (status === 'pending_practical') {
            setShowPendingModal(true);
        } else if (status === 'max_level') {
            alert("🎉 สุดยอด! คุณอยู่ในระดับทักษะสูงสุดแล้ว (Level 3)");
        } else if (status === 'can_test') {
            navigate('/worker/test', { state: { targetLevel: nextLevel } });
        } else {
            alert("ไม่สามารถเริ่มทำแบบทดสอบได้ในขณะนี้");
        }

    } catch (err) {
        console.error("Error checking exam status:", err);
        alert("ไม่สามารถเชื่อมต่อระบบตรวจสอบสิทธิ์การสอบได้");
    }
  };

  const handleLogoutClick = () => setShowLogoutModal(true);
  
  const confirmLogout = () => {
      sessionStorage.clear();
      localStorage.removeItem('token');
      navigate('/login');
  };

  // Styles Modal
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
  const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '12px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
  const btnModalStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', margin: '0 5px' };

  return (
    <div className="dash-layout">
      
      {/* ... Logout Modal (เดิม) ... */}
      {showLogoutModal && (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h3 style={{color: '#e74c3c', margin: '0 0 15px'}}>ยืนยันออกจากระบบ?</h3>
                <div style={{display:'flex', justifyContent:'center', gap: '10px'}}>
                    <button onClick={() => setShowLogoutModal(false)} style={{...btnModalStyle, background:'#e2e8f0', color:'#475569'}}>ยกเลิก</button>
                    <button onClick={confirmLogout} style={{...btnModalStyle, background:'#ef4444', color:'white'}}>ยืนยัน</button>
                </div>
            </div>
        </div>
      )}

      {/* ... Pending Practical Modal (เดิม) ... */}
      {showPendingModal && (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
                <h3 style={{color: '#f59e0b', margin: '0 0 10px'}}>แจ้งเตือน</h3>
                <p style={{color: '#555', fontSize: '16px', marginBottom: '25px', lineHeight: '1.5'}}>
                    กรุณารอผลการประเมินภาคปฏิบัติ
                </p>
                <div style={{display:'flex', justifyContent:'center'}}>
                    <button onClick={() => setShowPendingModal(false)} style={{...btnModalStyle, background:'#3b82f6', color:'white', width: '100%'}}>ตกลง</button>
                </div>
            </div>
        </div>
      )}

      {/* ✅ === ป็อปอัพแจ้งเตือนเวลารอ Cooldown (ของใหม่) === */}
      {showWaitModal && (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={{ fontSize: '45px', marginBottom: '10px' }}>⏰</div>
                <h3 style={{color: '#ef4444', margin: '0 0 10px'}}>ยังไม่ถึงเวลาทดสอบ</h3>
                <p style={{color: '#555', fontSize: '15px', marginBottom: '20px', lineHeight: '1.5'}}>
                    คุณเพิ่งทำแบบทดสอบไป <br/>
                    กรุณารออีก <strong style={{color: '#ef4444', fontSize: '18px'}}>{waitDaysLeft} วัน</strong> จึงจะสอบใหม่ได้
                </p>
                <div style={{display:'flex', justifyContent:'center'}}>
                    <button onClick={() => setShowWaitModal(false)} style={{...btnModalStyle, background:'#0f172a', color:'white', width: '100%'}}>ตกลง</button>
                </div>
            </div>
        </div>
      )}

      {/* ---------------- Sidebar ---------------- */}
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>Worker Portal</div>
        <nav className="menu">
          <button className="menu-item active" onClick={() => navigate('/worker')}>หน้าหลัก</button>
          <button className="menu-item" onClick={handleStartTest}>สอบวัดระดับ</button>
          <button className="menu-item" onClick={() => navigate('/worker/history')}>ประวัติการประเมิน</button>
          <button className="menu-item" onClick={() => navigate('/worker/task-history')}>ประวัติการทำงาน</button>
          <button className="menu-item" onClick={() => navigate('/worker-settings')}>ตั้งค่าบัญชี</button>
          <button className="menu-item logout-btn" style={{ marginTop: '20px', color: '#ef4444', background: '#fef2f2', borderColor: '#fee2e2' }} onClick={handleLogoutClick}>ออกจากระบบ</button>
        </nav>
      </aside>

      {/* ---------------- Main Content ---------------- */}
      <main className="dash-main">
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>สวัสดี, {user.full_name || user.name} 👋</h1>
            <p style={{ color: '#64748b' }}>ยินดีต้อนรับสู่ระบบจัดการงานช่าง</p>
          </div>

          <h3 style={{ color: '#334155', marginBottom: '15px', borderBottom:'2px solid #e2e8f0', paddingBottom:'10px' }}>ประเมินทักษะ</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              
              <div onClick={handleStartTest} style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', boxShadow:'0 2px 5px rgba(0,0,0,0.05)' }}>
                 <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', display:'flex', alignItems:'center', gap:'10px' }}>📝 แบบทดสอบวัดทักษะ</h4>
                 <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>ทำแบบทดสอบเพื่อวัดระดับความรู้ทางทฤษฎีและปฏิบัติ</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                 <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>ระดับของคุณ</h4>
                 {skillLevel > 0 ? (
                    <div>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>Level {skillLevel}</span>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#15803d' }}>คุณอยู่ในระดับทักษะ {skillLevel}</p>
                    </div>
                 ) : (
                    <div>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#64748b' }}>-</span>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#ef4444' }}>คุณยังไม่มีระดับทักษะ</p>
                    </div>
                 )}
              </div>
          </div>

          <h3 style={{ color: '#334155', marginBottom: '15px', borderBottom:'2px solid #e2e8f0', paddingBottom:'10px' }}>งานของคุณ</h3>
          <div style={{ marginBottom: '40px' }}>
            {loading ? (
                <div style={{textAlign:'center', padding:'20px'}}>กำลังโหลดข้อมูลงาน...</div>
            ) : assignedTask ? (
                <div className="task-card active" style={{ border: '1px solid #bfdbfe', background: '#eff6ff' }}>
                    <div style={{ background: '#3b82f6', padding: '15px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>งานปัจจุบัน</span>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                            {assignedTask.status === 'assigned' ? 'ได้รับมอบหมาย' : 'กำลังดำเนินการ'}
                        </span>
                    </div>
                    <div style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                         <div>
                            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{assignedTask.task_name}</h3>
                            <p style={{ margin: 0, color: '#64748b', lineHeight: '1.6' }}>
                                โครงการ: <strong>{assignedTask.project_name}</strong> <br/>
                                สถานที่: {assignedTask.site_location} <br/>
                                ผู้คุมงาน: {assignedTask.foreman_name || '-'}
                            </p>
                         </div>
                         <div>
                            <button onClick={handleGoToSubmit} style={{ padding: '12px 24px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(34, 197, 94, 0.3)' }}>
                                ดูรายละเอียด / ส่งงาน &rarr;
                            </button>
                         </div>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f1f5f9', borderRadius: '12px', border: '2px dashed #cbd5e1', color: '#94a3b8' }}>
                    <p>ยังไม่มีงานที่ได้รับมอบหมายในขณะนี้</p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;