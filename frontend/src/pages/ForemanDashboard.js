import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import './AdminDashboard.css'; // ⚠️ ถ้ามีไฟล์ CSS นี้ให้เปิดใช้นะครับ หรือตรวจสอบว่าคลาสเหล่านี้อยู่ใน App.css

const ForemanDashboard = () => {
  const navigate = useNavigate();

  // ข้อมูลผู้ใช้งาน
  const user = { name: 'หัวหน้าวิชัย', role: 'Foreman' };

  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันดึงข้อมูล (API)
  const fetchWorkers = async () => {
    setLoading(true);
    try {
      console.log("Fetching workers...");
      
      // --- จำลองข้อมูล (Mock Data) ---
      // เปิดคอมเมนต์นี้เพื่อให้เห็นรายการ
      /*
      setPendingWorkers([
        { id: 101, name: 'นายสมชาย ใจดี', role: 'Structural', roleName: 'ช่างโครงสร้าง', date: '08/01/2026' },
        { id: 102, name: 'นายมีชัย เก่งงาน', role: 'Electrical', roleName: 'ช่างไฟฟ้า', date: '08/01/2026' },
      ]);
      */
      
      setPendingWorkers([]); // ค่าเริ่มต้น: ว่าง

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleAssessClick = (worker) => {
    navigate('/foreman/assessment', { state: { workerData: worker } });
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="sidebar-logo">SKILL GAUGE</div>
        <nav className="menu">
          <button className="menu-item active" onClick={() => navigate('/foreman')}>
            ภาพรวมงาน
          </button>
          <button className="menu-item" onClick={() => alert("ระบบกำลังพัฒนา")}>
            ประวัติการประเมิน
          </button>
          <button className="menu-item logout-btn" onClick={handleLogout} style={{ marginTop: 'auto', color: '#e74c3c' }}>
            ออกจากระบบ
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        <div className="dash-topbar">
          <div className="role-pill bg-warning text-dark">FOREMAN</div>
          <div className="top-actions">
            <span className="profile">
              <span className="avatar-circle" style={{ background: '#f39c12' }}>{user.name.charAt(0)}</span>
              <span className="username">{user.name}</span>
            </span>
          </div>
        </div>

        <div className="dashboard-content" style={{ padding: '30px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>รายการรอการประเมิน</h2>

          {loading ? (
            <div className="text-center">กำลังโหลดข้อมูล...</div>
          ) : pendingWorkers.length === 0 ? (
            // --- Empty State ---
            <div style={{ 
                background: 'white', padding: '50px', borderRadius: '10px', 
                textAlign: 'center', border: '1px solid #ddd' 
            }}>
                <h3 style={{ color: '#7f8c8d' }}>ไม่พบรายการรอประเมิน</h3>
                <p style={{ color: '#999' }}>ขณะนี้ไม่มีช่างที่ส่งคำขอเข้ามา</p>
                <button 
                    onClick={fetchWorkers}
                    style={{ marginTop: '15px', padding: '8px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    รีเฟรช
                </button>
            </div>
          ) : (
            // --- Worker List (Grid) ---
            <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {pendingWorkers.map((worker) => (
                <div key={worker.id} className="card-action" style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#2c3e50' }}>{worker.name}</h3>
                      <span style={{ background: '#ecf0f1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#7f8c8d' }}>
                        {worker.roleName}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#bdc3c7' }}>
                      {worker.date}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleAssessClick(worker)}
                    style={{ 
                        width: '100%', padding: '10px', background: '#2c3e50', color: 'white', 
                        border: 'none', borderRadius: '5px', cursor: 'pointer' 
                    }}
                  >
                    ประเมินผลงาน
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForemanDashboard;