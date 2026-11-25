import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../pages/pm/WKDashboard.css';

const FMSidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const getUser = () => {
    try {
      const stored = sessionStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  };

  const user = getUser();

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

  const isHomeActive = currentPath === '/foreman' || currentPath === '/foreman/task-detail' || currentPath === '/foreman/assessment';
  const isAssessmentHistoryActive = currentPath === '/foreman/assessment-history' || currentPath === '/foreman/assessment-history-detail';
  const isReportsActive = currentPath === '/foreman-reports';
  const isSettingsActive = currentPath === '/foreman-settings';

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

      {/* Sidebar เมนูหลักของ Foreman */}
      <aside className="dash-sidebar">
        <div
          className="sidebar-title"
          style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}
        >
          Foreman Panel
        </div>
        <nav className="menu">
          <button
            type="button"
            className={`menu-item ${isHomeActive ? 'active' : ''}`}
            onClick={() => navigate('/foreman', { state: { user } })}
          >
            หน้าหลัก
          </button>

          <button
            type="button"
            className={`menu-item ${isAssessmentHistoryActive ? 'active' : ''}`}
            onClick={() => navigate('/foreman/assessment-history', { state: { user } })}
          >
            ประวัติการประเมิน
          </button>

          <button
            type="button"
            className={`menu-item ${isReportsActive ? 'active' : ''}`}
            onClick={() => navigate('/foreman-reports', { state: { user } })}
          >
            รายงานสรุปงาน
          </button>

          <button
            type="button"
            className={`menu-item ${isSettingsActive ? 'active' : ''}`}
            onClick={() => navigate('/foreman-settings', { state: { user } })}
          >
            ตั้งค่าบัญชี
          </button>

          <button
            type="button"
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

export default FMSidebar;
