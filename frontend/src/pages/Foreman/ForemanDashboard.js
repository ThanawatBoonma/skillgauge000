import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css'; 

const ForemanDashboard = () => {
  const navigate = useNavigate();
  // สมมติ user จาก session หรือ mock
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Foreman', role: 'Foreman' };
  
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ State สำหรับ Modal Logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ดึงข้อมูลจริงจาก API
  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const API = 'http://localhost:4000';
      const res = await axios.get(`${API}/api/assessment/foreman-pending`); 
      setPendingWorkers(res.data);
    } catch (error) {
      console.error("Error fetching workers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // เปลี่ยน Link ไปหน้า fmtask_detail
  const handleViewDetailClick = (workerTask) => {
    navigate('/foreman/task-detail', { state: { task: workerTask } });
  };

  // --- Logic Logout ใหม่ (ใช้ Modal) ---
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    sessionStorage.clear();
    // ถ้ามีการเก็บ token ใน localStorage ก็ควรลบด้วย
    localStorage.removeItem('token'); 
    navigate('/login');
  };

  const filteredWorkers = pendingWorkers.filter(worker => 
    (worker.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (worker.roleName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Styles สำหรับ Modal (เหมือน WorkerDashboard)
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
  const modalContentStyle = { background: 'white', padding: '25px', borderRadius: '12px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
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

      <aside className="dash-sidebar">
        <nav className="menu">
            <div style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
                Foreman Panel
            </div>
            
            <button className="menu-item active" onClick={() => navigate('/foreman')}>Dashboard</button>
            <button className="menu-item" onClick={() => navigate('/foreman-reports')}>รายงานสรุปงาน</button>
            <button className="menu-item" onClick={() => navigate('/foreman-settings')}>ตั้งค่า</button>

            {/* ✅ เรียกใช้ handleLogoutClick เพื่อเปิด Modal */}
            <button 
              className="menu-item" 
              onClick={handleLogoutClick}
              style={{ marginTop: '20px', color: '#ef4444', border: '1px solid #fee2e2', background: '#fef2f2' }}
            >
              ออกจากระบบ
            </button>
        </nav>
      </aside>

      <main className="dash-main">
        <header className="dash-header">
          <div className="header-info">
            <h1>สวัสดี, {user.name}</h1>
            <p>บทบาท: {user.role}</p>
          </div>
        </header>

        <section className="dash-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
               <h2 style={{ margin: 0, color: '#1e293b' }}>รายการช่างที่รอการประเมิน</h2>
               <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>ช่างที่ส่งผลงานแล้ว รอการตรวจสอบภาคปฏิบัติ</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="🔍 ค้นหาชื่อ หรือตำแหน่ง..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                        padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', 
                        width: '250px', outline: 'none' 
                    }}
                />
                <button onClick={fetchWorkers} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    รีเฟรช
                </button>
            </div>
          </div>

          {loading ? (
            <div style={{padding:'40px', textAlign:'center'}}>กำลังโหลดข้อมูล...</div>
          ) : (
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: '600' }}>ชื่อ-นามสกุล</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: '600' }}>ตำแหน่ง/ทักษะ</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: '600' }}>ชื่องานที่ส่ง</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: '600' }}>วันที่ส่ง</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: '600', textAlign: 'right' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWorkers.length > 0 ? (
                            filteredWorkers.map((w) => (
                                <tr key={w.task_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>
                                        {w.name}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                            {w.role_name || '-'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', color: '#1e293b' }}>
                                        {w.task_name}
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>
                                        📅 {w.date}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => handleViewDetailClick(w)}
                                            style={{ 
                                                padding: '8px 16px', background: '#0f172a', color: 'white', 
                                                border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' 
                                            }}
                                        >
                                            ดูรายละเอียด
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    ไม่พบรายการที่รอประเมิน
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ForemanDashboard;