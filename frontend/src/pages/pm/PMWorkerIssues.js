import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css';

const PMWorkerIssues = () => {
  const navigate = useNavigate();
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State สำหรับ Modal จัดการปัญหา
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', resolution_note: '' });
  const [saving, setSaving] = useState(false);

  // ✅ เพิ่ม State สำหรับ Modal ออกจากระบบ
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/api/issues/pm/${user.id || user.user_id}`);
      if (res.data?.success) {
        setIssues(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching PM issues:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ เพิ่มฟังก์ชันจัดการการ Logout
  const handleLogoutClick = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('token');
    navigate('/login');
  };

  const openUpdateModal = (issue) => {
    setSelectedIssue(issue);
    setUpdateForm({
      status: issue.status,
      resolution_note: issue.resolution_note || ''
    });
    setShowUpdateModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`http://localhost:4000/api/issues/${selectedIssue.id}/status`, updateForm);
      alert('บันทึกการแก้ไขปัญหาเรียบร้อยแล้ว');
      setShowUpdateModal(false);
      fetchIssues(); // รีเฟรชข้อมูล
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'รอดำเนินการ': return { bg: '#fef3c7', color: '#d97706', text: '⏳ รอดำเนินการ' };
      case 'กำลังแก้ไข': return { bg: '#e0f2fe', color: '#0284c7', text: '🔄 กำลังแก้ไข' };
      case 'แก้ไขแล้ว': return { bg: '#dcfce7', color: '#16a34a', text: '✅ แก้ไขแล้ว' };
      default: return { bg: '#f1f5f9', color: '#64748b', text: status };
    }
  };

  return (
    <div className="dash-layout">
      
      {/* ✅ ป๊อปอัปยืนยันการออกจากระบบ */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: '#e74c3c', margin: '0 0 15px' }}>ยืนยันออกจากระบบ?</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', background: '#e2e8f0', color: '#475569' }}>ยกเลิก</button>
              <button onClick={confirmLogout} style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', background: '#ef4444', color: 'white' }}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal จัดการปัญหา --- */}
      {showUpdateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', width: '400px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>จัดการปัญหา</h3>
            <form onSubmit={handleUpdateStatus}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>สถานะปัญหา:</label>
                <select 
                  value={updateForm.status} 
                  onChange={e => setUpdateForm({...updateForm, status: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                  <option value="รอดำเนินการ">⏳ รอดำเนินการ</option>
                  <option value="กำลังแก้ไข">🔄 กำลังแก้ไข</option>
                  <option value="แก้ไขแล้ว">✅ แก้ไขแล้ว (เสร็จสิ้น)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ยืนยันการแก้ปัญหา / ตอบกลับช่าง:</label>
                <textarea 
                  rows="4"
                  value={updateForm.resolution_note}
                  onChange={e => setUpdateForm({...updateForm, resolution_note: e.target.value})}
                  placeholder="อธิบายว่าแก้ไขปัญหาอย่างไร..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowUpdateModal(false)} style={{ padding: '8px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>ยกเลิก</button>
                <button type="submit" disabled={saving} style={{ padding: '8px 15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  {saving ? 'กำลังบันทึก...' : 'บันทึกสถานะ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Sidebar ที่ปรับใหม่ของคุณ */}
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
          PM Portal
        </div>
        <nav className="menu">
          <button className="menu-item" onClick={() => navigate('/pm')}>หน้าหลัก</button>
          <button className="menu-item active" onClick={() => navigate('/pm/issues')}>ปัญหาของช่าง</button>
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
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ color: '#1e293b' }}>รายการปัญหาที่ช่างรายงาน</h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>ตรวจสอบและอัปเดตสถานะปัญหาที่เกิดขึ้นในโครงการของคุณ</p>

          {loading ? (
            <p>กำลังโหลด...</p>
          ) : issues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '10px' }}>ไม่มีรายการปัญหาในขณะนี้</div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {issues.map(issue => {
                const badge = getStatusBadge(issue.status);
                return (
                  <div key={issue.id} style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>{issue.category}</span>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>🕒 {issue.date_formatted}</span>
                        <span style={{ background: badge.bg, color: badge.color, padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>{badge.text}</span>
                      </div>
                      
                      <strong style={{ fontSize: '15px' }}>ผู้รายงาน: {issue.worker_name}</strong>
                      {issue.task_name && <p style={{ margin: '5px 0', fontSize: '14px', color: '#475569' }}>งาน: {issue.task_name} ({issue.project_name})</p>}
                      
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginTop: '10px', fontSize: '14px' }}>
                        {issue.description}
                      </div>

                      {issue.resolution_note && (
                        <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '6px', marginTop: '10px', fontSize: '14px', color: '#065f46' }}>
                          <strong>ตอบกลับ:</strong> {issue.resolution_note}
                        </div>
                      )}
                    </div>

                    <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {issue.photo_url && (
                        <a href={issue.photo_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', textAlign: 'center' }}>
                          <img src={issue.photo_url} alt="หลักฐาน" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ccc' }} />
                          <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>ดูรูปเต็ม</div>
                        </a>
                      )}
                      
                      <button 
                        onClick={() => openUpdateModal(issue)}
                        style={{ background: '#3b82f6', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        จัดการ / อัปเดต
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PMWorkerIssues;