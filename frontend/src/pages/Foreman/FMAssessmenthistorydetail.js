import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css';
import FMSidebar from '../../components/Sidebar/FMSidebar';

const FMAssessmentHistoryDetail = () => {
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

  // ✅ ดึงข้อมูลประวัติการวัดระดับทักษะ (เหมือน WorkerHistory.js)
  const fetchWorkerHistory = async (userId) => {
    setLoadingHistory(true);
    try {
        const API = 'http://localhost:4000';
        // ใช้ API เดียวกับที่ Worker ใช้ดึงประวัติ
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
        <button onClick={() => navigate('/foreman/assessment-history')} style={{ padding: '10px 20px', cursor: 'pointer' }}>กลับ</button>
      </div>
    );
  }

  return (
    <div className="dash-layout">
      <FMSidebar />

      <main className="dash-main">
        <div className="dash-topbar">
            <div className="role-pill">Foreman</div>
            <div className="top-actions">รายละเอียดการประเมิน</div>
        </div>

        <section className="dash-content" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            
            {/* ✅ ส่วนที่ 1: ข้อมูลประวัติการวัดระดับทักษะ (เพิ่มเข้ามาตามที่ขอ) */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
                    📜 ประวัติการวัดระดับทักษะของ {assessment.name}
                </h3>
                
                {loadingHistory ? (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>กำลังโหลดประวัติ...</div>
                ) : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {workerHistory.map((item) => (
                            <div key={item.assessment_id} style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '15px', background: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#334155' }}>ครั้งที่ #{item.assessment_id}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{formatDate(item.created_at)}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>คะแนนรวม</div>
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

            {/* ✅ ส่วนที่ 2: รายละเอียดงานที่ส่งมอบ (จาก fmtask_detail.js) */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px', color: '#334155' }}>
                    รายละเอียดการประเมินครั้งนี้
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <strong style={{ display: 'block', color: '#64748b', fontSize: '14px' }}>ชื่องาน</strong>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{assessment.task_name || '-'}</div>
                    </div>
                    <div>
                        <strong style={{ display: 'block', color: '#64748b', fontSize: '14px' }}>คะแนนที่ได้</strong>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb' }}>
                            ทฤษฎี: {assessment.theory_score} | ปฏิบัติ: {assessment.practical_score}
                        </div>
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

export default FMAssessmentHistoryDetail;