import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css';

const FMAssessmentHistory = () => {
  const navigate = useNavigate();
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Foreman', role: 'Foreman' };

  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
    navigate('/foreman/assessment-history-detail', { state: { assessment: item } });
  };

  const handleLogout = () => {
    if (window.confirm("ต้องการออกจากระบบใช่หรือไม่?")) {
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const filteredList = historyList.filter(item => 
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.role_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
            Foreman Panel
        </div>
        <nav className="menu">
            <button className="menu-item" onClick={() => navigate('/foreman')}>หน้าหลัก</button>
            <button className="menu-item active">ประวัติการประเมิน</button>
            <button className="menu-item" onClick={() => navigate('/foreman-settings')}>ตั้งค่าบัญชี</button>
            <button className="menu-item logout-btn" onClick={handleLogout} style={{ marginTop: '20px', color: '#ef4444', background: '#fef2f2', borderColor: '#fee2e2' }}>
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
                                    {item.skill_level}
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

export default FMAssessmentHistory;