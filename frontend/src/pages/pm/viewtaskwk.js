import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css'; 

const ViewTaskWk = () => {
  const navigate = useNavigate();
  
  // ดึง User จาก Session
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchHistory();
  }, []); 

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const API = 'http://localhost:4000';
      const res = await axios.get(`${API}/api/pm/task-history`); 
      setHistoryList(res.data);
    } catch (error) {
      console.error("Error fetching task history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetailClick = (task) => {
    navigate('/pm/viewtaskwkdetail', { state: { task: task } });
  };

  const handleLogoutClick = () => setShowLogoutModal(true);
  const confirmLogout = () => {
      sessionStorage.clear();
      localStorage.removeItem('token');
      navigate('/login');
  };
// ฟังก์ชันกรองข้อมูลตาม searchTerm (ค้นหาจากชื่องาน, ชื่อช่าง หรือสถานที่)
  const filteredList = historyList.filter(item => 
    (item.task_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.worker_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.site_location || '').toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  // Styles Modal
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
  const modalContentStyle = { background: 'white', padding: '25px', borderRadius: '12px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
  const btnModalStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', margin: '0 5px' };

  return (
    <div className="dash-layout">
      
      {/* Logout Modal */}
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

      {/* Sidebar ของ PM */}
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
          PM Portal
        </div>
        <nav className="menu">
          <button className="menu-item" onClick={() => navigate('/pm')}>หน้าหลัก</button>
          <button className="menu-item active">ประวัติการทำงานช่าง</button> 
          <button className="menu-item" onClick={() => navigate('/pm/assessment-history')}>ประวัติการประเมิน</button>
          <button className="menu-item" onClick={() => navigate('/pm-settings')}>ตั้งค่าบัญชี</button>
          <button className="menu-item logout-btn" style={{ marginTop: '20px', color: '#ef4444', background: '#fef2f2', borderColor: '#fee2e2' }} onClick={handleLogoutClick}>ออกจากระบบ</button>
        </nav>
      </aside>

      <main className="dash-main">
        <header className="dash-header">
          <div className="header-info">
            <h1>สวัสดี, {user?.name || user?.full_name || 'PM'}</h1>
            <p>บทบาท: Project Manager</p>
          </div>
        </header>

        <section className="dash-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
               <h2 style={{ margin: 0, color: '#1e293b' }}>ประวัติการทำงานของช่างทั้งหมด</h2>
               <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>รายการงานที่ช่างดำเนินการเสร็จสิ้นแล้ว</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="🔍 ค้นหาชื่องาน, ชื่อช่าง หรือสถานที่..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                        padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', 
                        width: '300px', outline: 'none' 
                    }}
                />
                <button onClick={fetchHistory} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
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
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: '600' }}>ชื่องาน</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: '600' }}>ชื่อช่างผู้รับผิดชอบ</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: '600' }}>สถานที่ปฏิบัติงาน</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: '600' }}>ประเภทงาน</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: '600' }}>วันที่ส่งงาน</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: '600', textAlign: 'right' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredList.length > 0 ? (
                            filteredList.map((item) => (
                                <tr key={item.t_a_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px', fontWeight: 'bold', color: '#1e293b' }}>
                                        {item.task_name}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        {item.worker_name} <br/>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>({item.worker_role || '-'})</span>
                                    </td>
                                    
                                    <td style={{ padding: '16px', color: '#475569' }}>
                                        📍 {item.site_location || '-'}
                                    </td>
                                    <td style={{ padding: '16px', color: '#1e293b' }}>
                                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                            {item.task_type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>
                                        📅 {item.date_formatted}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => handleViewDetailClick(item)}
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
                                {/* ✅ 3. แก้ไข colSpan จาก 5 เป็น 6 เพราะมีคอลัมน์เพิ่มขึ้นมา */}
                                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    ไม่พบประวัติการทำงาน
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

export default ViewTaskWk;