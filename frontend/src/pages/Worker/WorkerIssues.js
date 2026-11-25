import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css';
import WKSidebar from '../../components/Sidebar/WKSidebar';
import ReportIssueModal from '../../components/ReportIssueModal';

const WorkerIssues = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [assignedTask, setAssignedTask] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 🛑 แก้บั๊ก Infinite Loop: ให้ useEffect รันแค่ครั้งเดียวตอนเปิดหน้า
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchIssues();

    // เช็คคำสั่งเปิด Modal อัตโนมัติจากหน้า Dashboard
    if (location.state?.autoOpenModal) {
      setAssignedTask(location.state.taskData);
      setShowReportModal(true);
      // ✅ ใช้คำสั่งนี้ล้างค่า location.state ทิ้ง เพื่อให้เวลากด "ปิด" Modal จะไม่เด้งกลับมาอีก
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      fetchCurrentTask();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <--- วงเล็บว่างตรงนี้สำคัญมาก ป้องกันการวนลูป

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/api/issues/worker/${user.id || user.user_id}`);
      if (res.data?.success) {
        setIssues(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching worker issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentTask = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/wkdashboard/info?user_id=${user.id || user.user_id}`);
      if (res.data?.assignedTask) {
        setAssignedTask(res.data.assignedTask);
      }
    } catch (err) {
      console.error('Error fetching task for issue reporting:', err);
    }
  };

  const handleLogoutClick = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'รอดำเนินการ': return { bg: '#fef3c7', color: '#d97706', border: '#fde68a', text: '⏳ รอดำเนินการ' };
      case 'กำลังแก้ไข': return { bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd', text: '🔄 กำลังดำเนินการแก้ไข' };
      case 'แก้ไขแล้ว': return { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0', text: '✅ แก้ไขเรียบร้อย' };
      default: return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', text: status };
    }
  };

  const filteredIssues = issues.filter((item) => {
    const matchSearch = (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.task_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === 'all') return matchSearch;
    return matchSearch && item.status === filterStatus;
  });

  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
  const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '12px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
  const btnModalStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', margin: '0 5px' };

  return (
    <div className="dash-layout">
      {/* Logout Modal */}
      {showLogoutModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ color: '#e74c3c', margin: '0 0 15px' }}>ยืนยันออกจากระบบ?</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ ...btnModalStyle, background: '#e2e8f0', color: '#475569' }}>ยกเลิก</button>
              <button onClick={confirmLogout} style={{ ...btnModalStyle, background: '#ef4444', color: 'white' }}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        task={assignedTask}
        user={user}
        onSuccess={fetchIssues}
      />

      {/* Sidebar */}
      <WKSidebar onLogout={handleLogoutClick} />

      {/* Main Content */}
      <main className="dash-main">
        <div className="dash-topbar">
          <div className="role-pill">Worker</div>
          <div className="top-actions">
            <span className="profile">{user?.full_name || user?.name || 'ช่าง'}</span>
          </div>
        </div>

        <section className="dash-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h1 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>⚠️</span> รายงานปัญหาที่พบระหว่างการทำงาน
              </h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>ติดตามสถานะปัญหาหน้างานที่รายงานไปยังโฟร์แมนและผู้จัดการโครงการ</p>
            </div>
            <button onClick={() => setShowReportModal(true)} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', padding: '12px 22px', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)' }}>
              <span>➕</span> แจ้งปัญหาหน้างานใหม่
            </button>
          </div>

          <div style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'ทั้งหมด' },
                { key: 'รอดำเนินการ', label: '⏳ รอดำเนินการ' },
                { key: 'กำลังแก้ไข', label: '🔄 กำลังแก้ไข' },
                { key: 'แก้ไขแล้ว', label: '✅ แก้ไขแล้ว' },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setFilterStatus(tab.key)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid', borderColor: filterStatus === tab.key ? '#ef4444' : '#cbd5e1', background: filterStatus === tab.key ? '#fef2f2' : '#fff', color: filterStatus === tab.key ? '#dc2626' : '#64748b', fontWeight: filterStatus === tab.key ? 'bold' : '500', fontSize: '13px', cursor: 'pointer' }}>
                  {tab.label}
                </button>
              ))}
            </div>
            <input type="text" placeholder="🔍 ค้นหาหมวดหมู่, ชื่องาน, รายละเอียด..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', width: '260px', outline: 'none' }} />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>กำลังโหลดรายการปัญหา...</div>
          ) : filteredIssues.length === 0 ? (
            <div style={{ background: 'white', padding: '60px 20px', borderRadius: '12px', border: '2px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
              <h3 style={{ margin: '0 0 6px 0', color: '#475569' }}>ไม่พบรายการปัญหา</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredIssues.map((item) => {
                const badge = getStatusBadge(item.status);
                return (
                  <div key={item.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px 24px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' }}>{item.category}</span>
                          <span style={{ fontSize: '13px', color: '#94a3b8' }}>🕒 {item.date_formatted}</span>
                        </div>
                        {item.task_name && (
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginTop: '6px' }}>
                            งาน: {item.task_name}
                            {item.project_name && <span style={{ fontWeight: 'normal', color: '#64748b', fontSize: '14px' }}> ({item.project_name})</span>}
                          </div>
                        )}
                      </div>
                      <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {badge.text}
                      </span>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '14px', color: '#334155', lineHeight: '1.6', marginBottom: item.photo_url || item.resolution_note ? '14px' : '0' }}>
                      <strong style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>รายละเอียดที่รายงาน:</strong>
                      {item.description}
                    </div>

                    {item.photo_url && (
                      <div style={{ marginBottom: item.resolution_note ? '14px' : '0' }}>
                        <strong style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '6px' }}>📷 รูปภาพหน้างาน:</strong>
                        <a href={item.photo_url} target="_blank" rel="noreferrer">
                          <img src={item.photo_url} alt="หลักฐานปัญหา" style={{ maxHeight: '160px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }} />
                        </a>
                      </div>
                    )}

                    {item.resolution_note && (
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', color: '#065f46' }}>
                        <strong>👷‍♂️ ข้อความตอบกลับ / บันทึกการแก้ไขจากหัวหน้างาน:</strong>
                        <p style={{ margin: '4px 0 0 0', lineHeight: '1.5' }}>{item.resolution_note}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default WorkerIssues;