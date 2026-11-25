import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css';

const WorkerHistory = () => {
  const navigate = useNavigate();
  
  // State สำหรับข้อมูล
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // State สำหรับ Modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
        navigate('/login');
        return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);
    fetchHistory(userData.id);
  }, [navigate]);

  const fetchHistory = async (userId) => {
    try {
        const API = 'http://localhost:4000';
        const res = await axios.get(`${API}/api/wkdashboard/history?user_id=${userId}`);
        setAssessmentHistory(res.data);
    } catch (err) {
        console.error("Error fetching history:", err);
    } finally {
        setLoading(false);
    }
  };

  // ✅ Logic เช็คสิทธิ์การสอบ (เหมือน Dashboard)
  const handleStartTest = async () => {
    if (!user || !user.id) return;

    try {
        const API = 'http://localhost:4000';
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

  // Logic Logout
  const handleLogoutClick = () => setShowLogoutModal(true);

  const confirmLogout = () => {
      sessionStorage.clear();
      localStorage.removeItem('token');
      navigate('/login');
  };

  const formatDate = (isoString) => {
      if (!isoString) return '-';
      return new Date(isoString).toLocaleDateString('th-TH', {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
      });
  };

  // Styles Modal
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
  const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '12px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
  const btnModalStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', margin: '0 5px' };

  return (
    <div className="dash-layout">
      
      {/* === Logout Modal === */}
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

      {/* === Pending Modal === */}
      {showPendingModal && (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
                <h3 style={{color: '#f59e0b', margin: '0 0 10px'}}>แจ้งเตือน</h3>
                <p style={{color: '#555', fontSize: '16px', marginBottom: '25px', lineHeight: '1.5'}}>
                    กรุณารอผลการประเมินภาคปฏิบัติ
                </p>
                <button 
                    onClick={() => setShowPendingModal(false)} 
                    style={{...btnModalStyle, background:'#3b82f6', color:'white', width: '100%'}}
                >
                    ตกลง
                </button>
            </div>
        </div>
      )}

      {/* ✅ Sidebar (เหมือน WorkerDashboard) */}
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
          Worker Portal
        </div>
        <nav className="menu">
          <button className="menu-item" onClick={() => navigate('/worker')}>หน้าหลัก</button>
          <button className="menu-item" onClick={handleStartTest}>สอบวัดระดับ</button>     
          <button className="menu-item" onClick={() => navigate('/worker/issues')}>รายงานปัญหา</button>
          <button className="menu-item active">ประวัติการประเมิน</button>
          <button className="menu-item" onClick={() => navigate('/worker/task-history')}>ประวัติการทำงาน</button>
          <button className="menu-item" onClick={() => navigate('/worker-settings')}>ตั้งค่าบัญชี</button>
          <button className="menu-item logout-btn" style={{ marginTop: '20px', color: '#ef4444', background: '#fef2f2', borderColor: '#fee2e2' }} onClick={handleLogoutClick}>ออกจากระบบ</button>
        </nav>
      </aside>

      <main className="dash-main" style={{ padding: '20px' }}>
        <div className="dash-topbar" style={{marginBottom: '20px'}}>
            <div className="role-pill">Worker</div>
            <div className="top-actions">{user?.full_name || 'ผู้ใช้งาน'}</div>
        </div>

        <div className="panel" style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginBottom: '20px', color: '#334155' }}>📜 ประวัติการวัดระดับทักษะ (Skill Assessment)</h2>

          {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>กำลังโหลดข้อมูล...</div>
          ) : assessmentHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>ยังไม่มีประวัติการประเมิน</div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {assessmentHistory.map((item) => (
                <div key={item.assessment_id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '25px', background: '#f8fafc', position: 'relative' }}>
                    
                    {/* Badge แสดงสถานะ/ระดับ */}
                    <div style={{ position: 'absolute', top: '20px', right: '20px', textAlign: 'right' }}>
                        <span style={{ 
                            background: '#2563eb', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '16px', fontWeight: 'bold' 
                        }}>
                            Skill Level: {item.skill_level}
                        </span>
                        <div style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
                            {formatDate(item.created_at)}
                        </div>
                    </div>

                    <h3 style={{ color: '#1e293b', margin: '0 0 15px 0' }}>
                        ผลการประเมิน
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>คะแนนทฤษฎี</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>{item.theory_score}</div>
                        </div>
                        <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>คะแนนปฏิบัติ</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>{item.practical_score}</div>
                        </div>
                        <div style={{ background: '#ecfccb', padding: '10px', borderRadius: '8px', border: '1px solid #d9f99d' }}>
                            <div style={{ fontSize: '12px', color: '#365314' }}>คะแนนรวม</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#365314' }}>{item.assessment_total}</div>
                        </div>
                    </div>

                    <div style={{ fontSize: '19px', color: '#475569', marginBottom: '5px' }}>
                        <strong>ผู้ประเมิน :</strong> {item.assessor_name || `ID ${item.fm_id}`}
                    </div>
                    
                    {item.assessment_comment && (
                        <div style={{ background: 'white', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f59e0b', fontSize: '14px', color: '#334155', fontStyle: 'italic', marginTop: '10px' }}>
                            " {item.assessment_comment} "
                        </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkerHistory;