import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css';

const WorkerSettings = () => {
  const navigate = useNavigate();
  
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    email: '',
    technician_type: '',
    experience_years: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  
  // State สำหรับ Modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [infoModal, setInfoModal] = useState({ show: false, type: '', message: '' });
  
  // ✅ เพิ่ม State สำหรับ Modal แจ้งเตือนรอผลสอบ (เพื่อให้เหมือน Sidebar หน้าอื่น)
  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
        const API = 'http://localhost:4000';
        const res = await axios.get(`${API}/api/setting/profile?user_id=${user.id}`);
        setFormData(res.data);
        setLoading(false);
    } catch (err) {
        console.error(err);
        setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setInfoModal({ show: true, type: 'error', message: 'รหัสผ่านใหม่ไม่ตรงกัน กรุณาระบุใหม่อีกครั้ง' });
      return;
    }
    
    try {
        const API = 'http://localhost:4000';
        await axios.post(`${API}/api/setting/password`, {
            user_id: user.id,
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
        
        setInfoModal({ show: true, type: 'success', message: 'เปลี่ยนรหัสผ่านสำเร็จ!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (err) {
        console.error(err);
        setInfoModal({ show: true, type: 'error', message: err.response?.data?.error || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" });
    }
  };

  // ✅ Logic เช็คสิทธิ์การสอบ (เพื่อให้ปุ่มใน Sidebar ทำงานเหมือนหน้าอื่น)
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

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('token');
    navigate('/login');
  };

  const closeInfoModal = () => {
      setInfoModal({ ...infoModal, show: false });
  };

  // Styles Modal
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
  const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '12px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
  const btnModalStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', margin: '0 5px' };

  if (loading) return <div style={{padding:'20px'}}>กำลังโหลดข้อมูล...</div>;

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

      {/* === Info/Success/Error Modal === */}
      {infoModal.show && (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>
                    {infoModal.type === 'success' ? '✅' : '❌'}
                </div>
                <h3 style={{
                    color: infoModal.type === 'success' ? '#22c55e' : '#ef4444', 
                    margin: '0 0 15px'
                }}>
                    {infoModal.type === 'success' ? 'สำเร็จ' : 'แจ้งเตือน'}
                </h3>
                <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '25px', lineHeight: '1.5' }}>
                    {infoModal.message}
                </p>
                <button 
                    onClick={closeInfoModal} 
                    style={{...btnModalStyle, background: '#3b82f6', color: 'white', width: '100%', padding: '12px'}}
                >
                    ตกลง
                </button>
            </div>
        </div>
      )}

      {/* ✅ === Pending Practical Modal (เพิ่มเพื่อให้เหมือน Sidebar หน้าอื่น) === */}
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

      {/* ✅ Sidebar ปรับปรุงให้เหมือน WorkerDashboard */}
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
          Worker Portal
        </div>
        <nav className="menu">
          <button className="menu-item" onClick={() => navigate('/worker')}>หน้าหลัก</button>
          
          {/* ใช้ handleStartTest แทนการ navigate ตรงๆ เพื่อเช็คสิทธิ์ */}
          <button className="menu-item" onClick={handleStartTest}>สอบวัดระดับ</button>
          
          <button className="menu-item" onClick={() => navigate('/worker/history')}>ประวัติการประเมิน</button>

          <button className="menu-item" onClick={() => navigate('/worker/task-history')}>ประวัติการทำงาน</button>

          <button className="menu-item active">ตั้งค่าบัญชี</button>
          
          <button className="menu-item logout-btn" style={{ marginTop: '20px', color: '#ef4444', background: '#fef2f2', borderColor: '#fee2e2' }} onClick={handleLogoutClick}>
            ออกจากระบบ
          </button>
        </nav>
      </aside>

      <main className="dash-main">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <h1 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>ตั้งค่าบัญชีผู้ใช้</h1>

          {/* ข้อมูลส่วนตัว (Read Only) */}
          <section style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
            <h3 style={{ marginTop: 0, color: '#334155' }}>ข้อมูลส่วนตัว</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                    <label style={labelStyle}>ชื่อ-นามสกุล</label>
                    <input style={readOnlyStyle} value={formData.full_name} readOnly />
                </div>
                <div>
                    <label style={labelStyle}>ตำแหน่ง (Role)</label>
                    <input style={readOnlyStyle} value={formData.role} readOnly />
                </div>
                <div>
                    <label style={labelStyle}>ประเภทช่าง</label>
                    <input style={readOnlyStyle} value={formData.technician_type || '-'} readOnly />
                </div>
                <div>
                    <label style={labelStyle}>ประสบการณ์ (ปี)</label>
                    <input style={readOnlyStyle} value={formData.experience_years || 0} readOnly />
                </div>
            </div>
          </section>

          {/* เปลี่ยนรหัสผ่าน */}
          <section style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#334155' }}>เปลี่ยนรหัสผ่าน</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>รหัสผ่านปัจจุบัน</label>
                <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                    <label style={labelStyle}>รหัสผ่านใหม่</label>
                    <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>ยืนยันรหัสผ่านใหม่</label>
                    <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required style={inputStyle} />
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <button type="submit" style={submitBtnStyle}>บันทึกรหัสผ่านใหม่</button>
              </div>
            </form>
          </section>

        </div>
      </main>
    </div>
  );
};

const labelStyle = { fontWeight: '700', display: 'block', marginBottom: '8px', color: '#475569', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' };
const readOnlyStyle = { ...inputStyle, background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' };
const submitBtnStyle = { background: '#2563eb', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default WorkerSettings;