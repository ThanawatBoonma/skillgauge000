import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PMSidebar = ({ user }) => { // รับ user เพื่อส่งต่อ state
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // สไตล์ปุ่ม (ก๊อปมาจากโค้ดเดิมของคุณ)
  const btnStyle = {
    display: 'block', width: '100%', textAlign: 'left',
    padding: '12px 20px', background: '#c9cfd7', border: 'none',
    color: '#000000', fontSize: '15px', fontWeight: '800',
    cursor: 'pointer', marginBottom: '8px', borderRadius: '8px',
    transition: 'all 0.2s' 
  };

  const activeBtnStyle = { ...btnStyle, background: '#0f172a', color: 'white' };

  // ฟังก์ชันเช็คว่าหน้าไหน Active
  const getStyle = (path) => currentPath === path ? activeBtnStyle : btnStyle;

  return (
    <aside className="dash-sidebar">
      <nav className="menu">
        <div style={{ marginBottom: '20px', paddingLeft: '20px', color: '#000000', fontSize: '18px', fontWeight: '800' }}>PROJECT MANAGER</div>

        <button style={getStyle('/pm')} onClick={() => navigate('/pm', { state: { user } })}>
          หน้าหลัก
        </button>
        
        <button style={getStyle('/projects')} onClick={() => navigate('/projects', { state: { user } })}>
          โครงการ
        </button>

        <button style={getStyle('/project-tasks')} onClick={() => navigate('/project-tasks', { state: { user } })}>
          สร้างโครงการ
        </button>
        
        <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />
        
        <button style={btnStyle}>Settings</button>
      </nav>
    </aside>
  );
};

export default PMSidebar;