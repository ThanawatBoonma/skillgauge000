import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../pages/pm/WKDashboard.css';

const WKSidebar = ({ onStartTest, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showWaitModal, setShowWaitModal] = useState(false);
  const [waitDaysLeft, setWaitDaysLeft] = useState(0);

  const getUser = () => {
    try {
      const stored = sessionStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  };

  const handleStartTestClick = async () => {
    if (onStartTest) {
      onStartTest();
      return;
    }

    const user = getUser();
    if (!user || !user.id) {
      alert('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    try {
      const API = 'http://localhost:4000';

      // 1. เช็ค Cooldown
      const cooldownRes = await axios.get(`${API}/api/wkdashboard/check-cooldown?user_id=${user.id}`);
      if (!cooldownRes.data.canTest) {
        setWaitDaysLeft(cooldownRes.data.daysLeft);
        setShowWaitModal(true);
        return;
      }

      // 2. เช็ค Status การสอบและ Level
      const res = await axios.get(`${API}/api/skillAssessment/status?user_id=${user.id}`);
      const { status, nextLevel } = res.data;

      if (status === 'pending_practical') {
        setShowPendingModal(true);
      } else if (status === 'max_level') {
        alert('คุณผ่านการประเมินระดับสูงสุด (Level 3) แล้ว');
      } else if (status === 'ready') {
        navigate('/worker/test', { state: { level: nextLevel } });
      }
    } catch (err) {
      console.error('Error checking assessment status:', err);
      navigate('/worker/test', { state: { level: 1 } });
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      setShowLogoutModal(true);
    }
  };

  const confirmLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('token');
    navigate('/login');
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  };

  const modalContentStyle = {
    background: 'white',
    padding: '25px',
    borderRadius: '12px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };

  const btnModalStyle = {
    padding: '8px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  return (
    <>
      {/* ป็อปอัพยืนยันการออกจากระบบ */}
      {showLogoutModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
            <h3 style={{ color: '#1e293b', margin: '0 0 10px' }}>ยืนยันการออกจากระบบ</h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>คุณต้องการออกจากระบบใช่หรือไม่?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{ ...btnModalStyle, background: '#e2e8f0', color: '#475569' }}
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmLogout}
                style={{ ...btnModalStyle, background: '#ef4444', color: 'white' }}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ป็อปอัพแจ้งเตือนรอการประเมินภาคปฏิบัติ */}
      {showPendingModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
            <h3 style={{ color: '#f59e0b', margin: '0 0 10px' }}>แจ้งเตือน</h3>
            <p style={{ color: '#555', fontSize: '16px', marginBottom: '25px', lineHeight: '1.5' }}>
              กรุณารอผลการประเมินภาคปฏิบัติ
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setShowPendingModal(false)}
                style={{ ...btnModalStyle, background: '#3b82f6', color: 'white', width: '100%' }}
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ป็อปอัพแจ้งเตือนเวลารอ Cooldown */}
      {showWaitModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ fontSize: '45px', marginBottom: '10px' }}>⏰</div>
            <h3 style={{ color: '#ef4444', margin: '0 0 10px' }}>ยังไม่ถึงเวลาทดสอบ</h3>
            <p style={{ color: '#555', fontSize: '15px', marginBottom: '20px', lineHeight: '1.5' }}>
              คุณเพิ่งทำแบบทดสอบไป <br />
              กรุณารออีก <strong style={{ color: '#ef4444', fontSize: '18px' }}>{waitDaysLeft} วัน</strong> จึงจะสอบใหม่ได้
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setShowWaitModal(false)}
                style={{ ...btnModalStyle, background: '#0f172a', color: 'white', width: '100%' }}
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar เมนูหลักของ Worker */}
      <aside className="dash-sidebar">
        <div
          className="sidebar-title"
          style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}
        >
          Worker Portal
        </div>
        <nav className="menu">
          <button
            className={`menu-item ${currentPath === '/worker' ? 'active' : ''}`}
            onClick={() => navigate('/worker')}
          >
            หน้าหลัก
          </button>

          <button
            className={`menu-item ${currentPath === '/worker/test' || currentPath === '/skill-assessment' ? 'active' : ''}`}
            onClick={handleStartTestClick}
          >
            สอบวัดระดับ
          </button>

          <button
            className={`menu-item ${currentPath === '/worker/issues' ? 'active' : ''}`}
            onClick={() => navigate('/worker/issues')}
          >
            รายงานปัญหา
          </button>

          <button
            className={`menu-item ${currentPath === '/worker/history' ? 'active' : ''}`}
            onClick={() => navigate('/worker/history')}
          >
            ประวัติการประเมิน
          </button>

          <button
            className={`menu-item ${currentPath === '/worker/task-history' || currentPath === '/worker/task-history-detail' ? 'active' : ''}`}
            onClick={() => navigate('/worker/task-history')}
          >
            ประวัติการทำงาน
          </button>

          <button
            className={`menu-item ${currentPath === '/worker-settings' ? 'active' : ''}`}
            onClick={() => navigate('/worker-settings')}
          >
            ตั้งค่าบัญชี
          </button>

          <button
            className="menu-item logout-btn"
            style={{ marginTop: '20px', color: '#ef4444', background: '#fef2f2', borderColor: '#fee2e2' }}
            onClick={handleLogoutClick}
          >
            ออกจากระบบ
          </button>
        </nav>
      </aside>
    </>
  );
};

export default WKSidebar;
