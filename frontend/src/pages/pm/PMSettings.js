import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // ✅ เพิ่ม axios เพื่อเชื่อมต่อ API
import '../pm/WKDashboard.css';

const PMSettings = () => {
  const navigate = useNavigate();
  
  // ✅ ดึง user จาก sessionStorage เหมือน Worker
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'PM User', email: 'pm@example.com', role: 'projectmanager', id: 0 };

  // State สำหรับรหัสผ่าน
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ✅ State สำหรับ Modal Logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ✅ State สำหรับ Modal แจ้งเตือน (Success / Error)
  const [infoModal, setInfoModal] = useState({ show: false, type: '', message: '' });

  const handleInputChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // 1. เช็ครหัสผ่านไม่ตรงกัน -> เปิด Modal Error
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setInfoModal({ show: true, type: 'error', message: 'รหัสผ่านใหม่ไม่ตรงกัน กรุณาระบุใหม่อีกครั้ง' });
      return;
    }

    try {
        const API = 'http://localhost:4000';
        // เรียก API เปลี่ยนรหัสผ่าน
        await axios.post(`${API}/api/setting/password`, {
            user_id: user.id,
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });

        // 2. สำเร็จ -> เปิด Modal Success
        setInfoModal({ show: true, type: 'success', message: 'เปลี่ยนรหัสผ่านสำเร็จ!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (err) {
        console.error(err);
        // 3. เกิดข้อผิดพลาด -> เปิด Modal Error
        setInfoModal({ 
            show: true, 
            type: 'error', 
            message: err.response?.data?.error || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" 
        });
    }
  };

  // Logic Logout
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
  const btnModalStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', margin: '0 5px', minWidth: '100px' };

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

      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
          PM Portal
        </div>
        <nav className="menu">
          <button className="menu-item" onClick={() => navigate('/pm')}>หน้าหลัก</button>
          <button className="menu-item" onClick={() => navigate('/pm/viewtaskwk')}>ประวัติการทำงานช่าง</button>
          <button className="menu-item" onClick={() => navigate('/pm/assessment-history')}>ประวัติการประเมิน</button>
          <button className="menu-item" onClick={() => navigate('/pm-settings')}>ตั้งค่าบัญชี</button>
          <button 
            className="menu-item logout-btn" 
            style={{ marginTop: '20px', color: '#ef4444', background: '#fef2f2', borderColor: '#fee2e2' }}
            onClick={handleLogoutClick} 
          >
            ออกจากระบบ
          </button>
        </nav>
      </aside>

      <main className="dash-main" style={{ padding: '40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <header style={{ marginBottom: '30px' }}>
            <h1 style={{ color: '#1e293b', fontSize: '28px', fontWeight: '800' }}>การตั้งค่าบัญชี</h1>
            <p style={{ color: '#64748b' }}>จัดการข้อมูลส่วนตัวและรักษาความปลอดภัยของบัญชีคุณ</p>
          </header>

          <section style={{ background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            
            <div style={{ marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ color: '#1e293b', marginBottom: '20px' }}>ข้อมูลส่วนตัว</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>ชื่อ-นามสกุล (อ่านได้อย่างเดียว)</label>
                  <input type="text" value={user.full_name || user.name} readOnly style={readOnlyStyle} />
                </div>
                <div>
                  <label style={labelStyle}>อีเมล (อ่านได้อย่างเดียว)</label>
                  <input type="email" value={user.email} readOnly style={readOnlyStyle} />
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <h3 style={{ color: '#1e293b', marginBottom: '20px' }}>เปลี่ยนรหัสผ่าน</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>รหัสผ่านปัจจุบัน</label>
                  <input 
                    type="password" 
                    name="currentPassword"
                    value={passwordData.currentPassword} 
                    onChange={handleInputChange}
                    placeholder="ระบุรหัสผ่านปัจจุบัน" 
                    required 
                    style={inputStyle} 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>รหัสผ่านใหม่</label>
                    <input 
                      type="password" 
                      name="newPassword"
                      value={passwordData.newPassword} 
                      onChange={handleInputChange}
                      placeholder="ระบุรหัสผ่านใหม่" 
                      required 
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>ยืนยันรหัสผ่านใหม่</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={passwordData.confirmPassword} 
                      onChange={handleInputChange}
                      placeholder="ยืนยันรหัสผ่านใหม่" 
                      required 
                      style={inputStyle} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '30px' }}>
                <button 
                  type="submit" 
                  style={{ 
                    background: '#2563eb', 
                    color: 'white', 
                    padding: '12px 30px', 
                    borderRadius: '10px', 
                    border: 'none', 
                    fontWeight: 'bold', 
                    cursor: 'pointer' 
                  }}
                >
                  อัปเดตรหัสผ่าน
                </button>
              </div>
            </form>

          </section>
        </div>
      </main>
    </div>
  );
};

const labelStyle = { fontWeight: '700', display: 'block', marginBottom: '8px', color: '#475569', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' };
const readOnlyStyle = { ...inputStyle, background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0', cursor: 'not-allowed' };

export default PMSettings;