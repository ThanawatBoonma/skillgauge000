import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // ใช้ CSS ตัวหลัก
import './AdminDashboard.css';

// Import Components หน้าต่างๆ
import AdminOverview from './admin/AdminOverview';
import AdminUsersTable from './admin/AdminUsersTable';
import AdminQuizBank from './admin/AdminQuizBank'; // หรือ AdminQuestionForm ตามที่คุณใช้

import { performLogout } from '../utils/logout';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // กำหนด Tab เริ่มต้น
  const [tab, setTab] = useState(location.state?.initialTab || 'overview');
  
  // State สำหรับรูปโปรไฟล์ (ถ้ามี)
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const storedAvatar = localStorage.getItem('admin_avatar');
    if (storedAvatar) {
      setAvatar(storedAvatar);
    }
  }, []);

  // ฟังก์ชันสลับหน้า Content ตาม Tab ที่เลือก
  const renderContent = () => {
    switch (tab) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUsersTable />;
      case 'quiz': return <AdminQuizBank />;
      
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="admin-layout">
      {/* ส่วนเนื้อหาหลัก */}
      <main className="dash-main">
        <div className="dash-main-content-wrapper">
          
          {/* Topbar: แสดงชื่อ Role และปุ่ม Logout */}
          <div className="dash-topbar" style={{ marginBottom: '20px', justifyContent: 'space-between', display: 'flex' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <h2 style={{ margin: 0 }}>Admin Panel</h2>
               <div className="role-pill">Administrator</div>
            </div>
            <div className="top-actions">
              <button type="button" className="logout-btn" onClick={() => performLogout(navigate)}>
                ออกจากระบบ
              </button>
            </div>
          </div>

          {/* Menu Bar: เมนูแนวนอน */}
          <nav className="admin-top-menu">
            <div className="menu horizontal">
              <button 
                onClick={() => setTab('overview')} 
                className={`menu-item ${tab === 'overview' ? 'active' : ''}`}
              >
                Dashboard
              </button>
              
              <button 
                onClick={() => setTab('users')} 
                className={`menu-item ${tab === 'users' ? 'active' : ''}`}
              >
                จัดการผู้ใช้งาน
              </button>
              
              <button 
                onClick={() => setTab('quiz')} 
                className={`menu-item ${tab === 'quiz' ? 'active' : ''}`}
              >
                จัดการคำถาม
              </button>
                                                 
            </div>
          </nav>

          {/* Area สำหรับแสดงผลหน้าย่อย */}
          <div className="admin-content-area">
            {renderContent()}
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;