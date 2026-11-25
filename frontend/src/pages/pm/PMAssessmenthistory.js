import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css';

const PMAssessmentHistory = () => {
  const navigate = useNavigate();
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'PM', role: 'Project Manager' };

  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ State สำหรับ Modal Logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const API = 'http://localhost:4000';
      const res = await axios.get(`${API}/api/assessment/history-all`);
      setHistoryList(res.data);
    } catch (error) {
      console.error("Error fetching assessment history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleViewDetail = (item) => {
    navigate('/pm/assessment-history-detail', { state: { assessment: item } });
  };

  // ✅ ฟังก์ชัน Logout ให้สอดคล้องกับป็อปอัพ
  const handleLogoutClick = () => setShowLogoutModal(true);
  
  const confirmLogout = () => {
      sessionStorage.clear();
      localStorage.removeItem('token');
      navigate('/login');
  };

  const filteredList = historyList.filter(item => 
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.role_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Styles สำหรับ Modal
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

      {/* ✅ Sidebar รูปแบบใหม่ตามที่คุณต้องการ */}
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
          PM Portal
        </div>
        <nav className="menu">
          <button className="menu-item" onClick={() => navigate('/pm')}>หน้าหลัก</button>
          <button className="menu-item" onClick={() => navigate('/pm/issues')}>ปัญหาของช่าง</button>
          <button className="menu-item" onClick={() => navigate('/pm/viewtaskwk')}>ประวัติการทำงานช่าง</button>        
          {/* ปุ่มนี้ Active */}
          <button className="menu-item active" onClick={() => navigate('/pm/assessment-history')}>ประวัติการประเมิน</button>          
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

      <main className="dash-main">
        <header className="dash-header">
          <div className="header-info">
            <h1>ประวัติการประเมินทักษะ</h1>
            <p>รายการผลการประเมินที่ดำเนินการเสร็จสิ้นแล้ว</p>
          </div>
        </header>

        <section className="dash-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
             <input 
                type="text" 
                placeholder="🔍 ค้นหาชื่อช่าง..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '300px' }}
             />
             <button onClick={fetchHistory} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                รีเฟรช
             </button>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '16px' }}>ชื่อ-นามสกุล</th>
                        <th style={{ padding: '16px' }}>ตำแหน่ง</th>
                        <th style={{ padding: '16px' }}>ระดับที่ได้</th>
                        <th style={{ padding: '16px' }}>คะแนนรวม</th>
                        <th style={{ padding: '16px' }}>วันที่ประเมิน</th>
                        <th style={{ padding: '16px', textAlign: 'right' }}>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredList.map((item) => (
                        <tr key={item.assessment_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px', fontWeight: 'bold' }}>{item.name}</td>
                            <td style={{ padding: '16px' }}>{item.role_name}</td>
                            <td style={{ padding: '16px' }}>
                                <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                    Level {item.skill_level}
                                </span>
                            </td>
                            <td style={{ padding: '16px' }}>{item.assessment_total}</td>
                            <td style={{ padding: '16px', color: '#64748b' }}>{item.date_formatted}</td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                <button onClick={() => handleViewDetail(item)} style={{ padding: '8px 16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    รายละเอียด
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PMAssessmentHistory;