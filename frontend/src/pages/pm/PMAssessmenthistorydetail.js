import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css';

const PMAssessmentHistoryDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // รับข้อมูลการประเมินที่ส่งมาจากหน้า List
  const assessment = location.state?.assessment;

  const [workerHistory, setWorkerHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!assessment) return;
    fetchWorkerHistory(assessment.user_id);
  }, [assessment]);

  const fetchWorkerHistory = async (userId) => {
    setLoadingHistory(true);
    try {
        const API = 'http://localhost:4000';
        const res = await axios.get(`${API}/api/wkdashboard/history?user_id=${userId}`);
        setWorkerHistory(res.data);
    } catch (err) {
        console.error("Error fetching worker history:", err);
    } finally {
        setLoadingHistory(false);
    }
  };

  const formatDate = (isoString) => {
      if (!isoString) return '-';
      return new Date(isoString).toLocaleDateString('th-TH', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
  };

  if (!assessment) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>ไม่พบข้อมูล</h3>
        <button onClick={() => navigate('/pm/assessment-history')} style={{ padding: '10px 20px', cursor: 'pointer' }}>กลับ</button>
      </div>
    );
  }

  return (
    <div className="dash-layout">
      {/* ✅ Sidebar ของ PM */}
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
          PM Portal
        </div>
        <nav className="menu">
            <button className="menu-item" onClick={() => navigate('/pm/assessment-history')}>&larr; กลับหน้าประวัติ</button>
        </nav>
      </aside>

      <main className="dash-main">
        <div className="dash-topbar">
            {/* ✅ เปลี่ยน Role Pill เป็น Project Manager */}
            <div className="role-pill">Project Manager</div>
            <div className="top-actions">รายละเอียดการประเมิน</div>
        </div>

        <section className="dash-content" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            
            {/* ส่วนที่ 1: ข้อมูลประวัติการวัดระดับทักษะ */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
                    📜 ประวัติการวัดระดับทักษะของ {assessment.name}
                </h3>
                
                {loadingHistory ? (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>กำลังโหลดประวัติ...</div>
                ) : workerHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>ยังไม่มีประวัติการประเมิน</div>
                ) : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {workerHistory.map((item) => (
                            <div key={item.assessment_id} style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '15px', background: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#334155' }}>การประเมิน</div>
                                    <div style={{ fontSize: '16px', color: '#101112' }}>{formatDate(item.created_at)}</div>
                                    <div style={{ fontSize: '16px', color: '#141517', marginTop: '4px' }}>ผู้ประเมิน: {item.assessor_name || `ID ${item.fm_id}`}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '16px', color: '#64748b' }}>คะแนนรวม</div>
                                    <div style={{ fontWeight: 'bold', color: '#2563eb' }}>{item.assessment_total}</div>
                                </div>
                                <div>
                                    <span style={{ background: '#2563eb', color: 'white', padding: '5px 12px', borderRadius: '15px', fontSize: '12px' }}>
                                        Level {item.skill_level}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ส่วนที่ 2: รายละเอียดการประเมินครั้งที่คลิกเข้ามา */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px', color: '#334155' }}>
                    รายละเอียดการประเมิน
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <strong style={{ display: 'block', color: '#64748b', fontSize: '14px' }}>ชื่องานอ้างอิง</strong>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{assessment.task_name || '-'}</div>
                    </div>
                    <div>
                        <strong style={{ display: 'block', color: '#64748b', fontSize: '14px' }}>วันที่ประเมิน</strong>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>📅 {assessment.date_formatted}</div>
                    </div>
                    <div>
                        <strong style={{ display: 'block', color: '#64748b', fontSize: '14px' }}>คะแนนทฤษฎี</strong>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{assessment.theory_score}</div>
                    </div>
                    <div>
                        <strong style={{ display: 'block', color: '#64748b', fontSize: '14px' }}>คะแนนปฏิบัติ</strong>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{assessment.practical_score}</div>
                    </div>
                </div>

                <div style={{ background: '#fffbeb', padding: '15px', borderRadius: '8px', border: '1px solid #fcd34d', marginBottom: '20px' }}>
                    <strong style={{ color: '#d97706', display:'block', marginBottom:'5px' }}>ความคิดเห็นผู้ประเมิน:</strong>
                    <p style={{ margin: 0, color: '#92400e' }}>
                        "{assessment.assessment_comment || '-'}"
                    </p>
                </div>

                {/* รูปภาพผลงาน */}
                <div style={{ marginTop: '20px' }}>
                    <strong style={{ display: 'block', marginBottom: '10px', color: '#334155' }}>📷 รูปภาพผลงาน:</strong>
                    <div style={{ textAlign: 'center', background: '#1e293b', padding: '20px', borderRadius: '8px' }}>
                        {assessment.photo_url ? (
                            <img 
                                src={assessment.photo_url} 
                                alt="Submitted Work" 
                                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px', border: '1px solid #475569' }} 
                            />
                        ) : (
                            <div style={{ color: '#94a3b8', padding: '30px' }}>ไม่พบไฟล์รูปภาพ</div>
                        )}
                    </div>
                </div>
            </div>

        </section>
      </main>
    </div>
  );
};

export default PMAssessmentHistoryDetail;