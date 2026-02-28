import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css'; 

const PMProjectManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || JSON.parse(sessionStorage.getItem('user'));

  // --- State สำหรับ Modal Logout ---
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ตรวจสอบสิทธิ์
  useEffect(() => {
    // if (!user || user.role !== 'projectmanager') navigate('/login');
  }, [user, navigate]);

  // --- Logic Logout ใหม่ (ใช้ Modal) ---
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const API = 'http://localhost:4000';
  const [stats, setStats] = useState({ pendingAssessment: 0, assessedWorkers: 0, totalWorkers: 0, totalForemen: 0 });
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
        const resStats = await axios.get(`${API}/api/pm/stats`);
        setStats(resStats.data);

        const resWorkers = await axios.get(`${API}/api/pm/workers-status`);
        setWorkers(resWorkers.data);

    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteTask = async (taskId) => {
      if(window.confirm("ยืนยันการลบงานที่มอบหมายนี้?")) {
          try {
              await axios.delete(`${API}/api/pm/task/${taskId}`);
              fetchData(); 
          } catch(err) {
              alert("ลบไม่สำเร็จ");
          }
      }
  };

  const getLevelBadge = (level) => {
      const numLevel = parseInt(level);
      if (!numLevel || numLevel === 0) {
          return <span className="pill small" style={{background:'#f1f5f9', color:'#64748b', border:'1px solid #cbd5e1'}}>ไม่มี</span>;
      }
      return <span className="pill small" style={{background:'#e0f2fe', color:'#0284c7', border:'1px solid #bae6fd'}}>Level {numLevel}</span>;
  };

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

      <main className="dash-main">
        <div className="dash-topbar">
          <div className="role-pill">{user?.role || 'Project Manager'}</div>
          <div className="top-actions">
            <span className="profile">{user?.full_name || 'PM'}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="pm-stats" style={{ marginTop: '25px', marginBottom: '25px', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'20px' }}>
          <div className="stat" style={{background:'white', padding:'20px', borderRadius:'12px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
              <div className="value" style={{fontSize:'24px', fontWeight:'bold', color:'#e11d48'}}>{stats.pendingAssessment}</div>
              <div className="label" style={{color:'#64748b'}}>ช่างที่รอการประเมิน</div>
          </div>
          <div className="stat" style={{background:'white', padding:'20px', borderRadius:'12px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
              <div className="value" style={{fontSize:'24px', fontWeight:'bold', color:'#22c55e'}}>{stats.assessedWorkers}</div>
              <div className="label" style={{color:'#64748b'}}>ช่างที่ประเมินแล้ว</div>
          </div>
          <div className="stat" style={{background:'white', padding:'20px', borderRadius:'12px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
              <div className="value" style={{fontSize:'24px', fontWeight:'bold', color:'#3b82f6'}}>{stats.totalWorkers}</div>
              <div className="label" style={{color:'#64748b'}}>ช่างทั้งหมด</div>
          </div>
          <div className="stat" style={{background:'white', padding:'20px', borderRadius:'12px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
              <div className="value" style={{fontSize:'24px', fontWeight:'bold', color:'#f59e0b'}}>{stats.totalForemen}</div>
              <div className="label" style={{color:'#64748b'}}>โฟร์แมนทั้งหมด</div>
          </div>
        </div>

        {/* ตารางจัดการช่าง */}
        <div className="panel" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '15px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>👷‍♂️ รายชื่อช่างที่รอการประเมิน</h3>
            <button className="pill" onClick={fetchData}>🔄 รีเฟรชข้อมูล</button>
          </div>
          
          <div className="table">
            <div className="thead" style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 2fr' }}>
              <div>ชื่อช่าง</div>
              <div>สาขาทักษะ</div>
              <div>ระดับปัจจุบัน</div>
              <div>การจัดการ</div>
            </div>
            <div className="tbody">
              {loading ? <div className="empty" style={{padding:'20px', textAlign:'center'}}>กำลังโหลด...</div> : 
                workers.map((w) => (
                  <div className="tr" key={w.id} style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 2fr', alignItems:'center' }}>
                    <div className="td"><strong>{w.full_name}</strong></div>
                    <div className="td">{w.skill || '-'}</div>
                    <div className="td">{getLevelBadge(w.current_level)}</div>
                    <div className="td" style={{display:'flex', gap:'10px'}}>
                      {w.t_a_id ? (
                        <>
                            <div style={{
                                padding: '6px 12px', 
                                borderRadius: '6px', 
                                fontSize: '12px', 
                                fontWeight: 'bold',
                                background: w.status === 'เสร็จสิ้น' ? '#dcfce7' : '#fef9c3',
                                color: w.status === 'เสร็จสิ้น' ? '#166534' : '#854d0e',
                                border: w.status === 'เสร็จสิ้น' ? '1px solid #bbf7d0' : '1px solid #fde047'
                            }}>
                                {w.status || 'กำลังดำเนินการ'}
                            </div>
                            <button 
                                onClick={() => navigate('/task-assessment', { state: { worker: w, mode: 'edit', taskId: w.t_a_id } })}
                                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                            >
                                ✏️ แก้ไข
                            </button>
                            <button 
                                onClick={() => handleDeleteTask(w.t_a_id)}
                                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                            >
                                🗑️ ลบ
                            </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => navigate('/task-assessment', { state: { worker: w, mode: 'create' } })}
                          style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          + มอบหมายงาน
                        </button>
                      )}
                    </div>
                  </div>
                ))
              }
              {workers.length === 0 && !loading && <div className="empty" style={{padding:'20px', textAlign:'center'}}>ไม่มีช่างที่รอการประเมินในขณะนี้</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PMProjectManager;