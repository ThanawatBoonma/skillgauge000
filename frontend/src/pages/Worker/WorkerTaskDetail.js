import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css';

const WorkerTaskDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // รับข้อมูลงานที่ส่งมาจากหน้า Dashboard
  const task = location.state?.task;
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // ✅ State สำหรับ Modal ยืนยันการส่งงาน
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ถ้าไม่มีข้อมูลงาน ให้เด้งกลับ
  if (!task) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>ไม่พบข้อมูลงาน</h3>
        <button onClick={() => navigate('/worker')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  // 1. กดปุ่มส่งงาน -> เปิด Modal
  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!photoFile) {
        alert("กรุณาแนบรูปภาพผลงานก่อนส่ง");
        return;
    }
    setShowConfirmModal(true); // เปิดป็อปอัพ
  };

  // 2. กด "ยืนยัน" ใน Modal -> ส่งข้อมูลจริง
  const confirmSubmit = async () => {
    setShowConfirmModal(false); // ปิดป็อปอัพ
    setLoading(true);
    
    try {
        const API = 'http://localhost:4000';
        
        // ใช้ FormData สำหรับส่งไฟล์
        const formData = new FormData();
        formData.append('task_id', task.id); 
        formData.append('photo', photoFile); 

        await axios.post(`${API}/api/wkdashboard/submit-task`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        navigate('/worker'); 

    } catch (err) {
        console.error("Submit Error:", err);
        alert("เกิดข้อผิดพลาดในการส่งงาน");
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("ต้องการออกจากระบบ?")) {
        sessionStorage.clear();
        navigate('/login');
    }
  };

  // Styles Modal
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
  const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '12px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
  const btnModalStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', margin: '0 5px', minWidth: '100px' };

  return (
    <div className="dash-layout">
      
      {/* ✅ === Confirm Submit Modal (ป็อปอัพยืนยันส่งงาน) === */}
      {showConfirmModal && (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>🚀</div>
                <h3 style={{color: '#1e293b', margin: '0 0 10px'}}>ยืนยันการส่งงาน</h3>
                
                <div style={{display:'flex', justifyContent:'center', gap: '15px'}}>
                    <button 
                        onClick={() => setShowConfirmModal(false)} 
                        style={{...btnModalStyle, background:'#e2e8f0', color:'#475569'}}
                    >
                        ยกเลิก
                    </button>
                    <button 
                        onClick={confirmSubmit} 
                        style={{...btnModalStyle, background:'#22c55e', color:'white', boxShadow: '0 4px 6px rgba(34, 197, 94, 0.3)'}}
                    >
                        ยืนยัน
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 1. Sidebar */}
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
          Worker Portal
        </div>
        <nav className="menu">
            <button className="menu-item" onClick={() => navigate('/worker')}>&larr; กลับหน้าหลัก</button>
            <button className="menu-item logout-btn" style={{ marginTop: '20px', color: '#ef4444' }} onClick={handleLogout}>ออกจากระบบ</button>
        </nav>
      </aside>

      {/* 2. Main Content */}
      <main className="dash-main">
        <div className="dash-topbar">
          <div className="role-pill">Worker</div>
          <div className="top-actions">
            <span className="profile">{user?.name || 'ช่าง'}</span>
          </div>
        </div>

        <section className="dash-content" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            
            {/* ส่วนแสดงรายละเอียดงาน */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h2 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px', color: '#334155' }}>
                    📋 ข้อมูลงานที่ได้รับมอบหมาย
                </h2>
                
                {/* Grid 4 ช่อง */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <strong style={{ display: 'block', color: '#64748b', fontSize: '14px' }}>ชื่องาน</strong>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{task.task_name}</div>
                    </div>
                    <div>
                        <strong style={{ display: 'block', color: '#64748b', fontSize: '14px' }}>ประเภทโครงการ</strong>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{task.project_name || '-'}</div>
                    </div>
                    <div>
                        <strong style={{ display: 'block', color: '#64748b', fontSize: '14px' }}>วันที่เริ่มงาน</strong>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb' }}>
                             {task.start_date ? new Date(task.start_date).toLocaleDateString('th-TH') : '-'}
                        </div>
                    </div>
                    <div>
                        <strong style={{ display: 'block', color: '#64748b', fontSize: '14px' }}>กำหนดส่งงาน</strong>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#e11d48' }}>
                             {task.end_date ? new Date(task.end_date).toLocaleDateString('th-TH') : '-'}
                        </div>
                    </div>
                </div>

                {/* สถานที่ปฏิบัติงาน (บล็อกยาว) */}
                <div style={{ marginBottom: '15px', padding: '15px', background: '#f0f9ff', borderRadius: '8px', border: '1px dashed #bae6fd' }}>
                    <strong style={{ color: '#0369a1', display:'block', marginBottom:'5px' }}>📍 สถานที่ปฏิบัติงาน:</strong>
                    <p style={{ margin: 0, color: '#334155', fontSize: '16px', lineHeight: '1.5' }}>
                        {task.site_location || "ไม่ได้ระบุ"}
                    </p>
                </div>

                {/* รายละเอียดเพิ่มเติม (บล็อกยาว) */}
                <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <strong style={{ color: '#475569', display:'block', marginBottom:'5px' }}>📝 รายละเอียดเพิ่มเติม:</strong>
                    <p style={{ margin: 0, color: '#64748b', lineHeight: '1.5' }}>
                        {task.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                    </p>
                </div>
            </div>

            {/* ฟอร์มส่งงาน */}
            <form onSubmit={handlePreSubmit} style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #22c55e', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h2 style={{ marginBottom: '20px', color: '#166534' }}>🚀 ส่งมอบงาน (Submit Work)</h2>
                
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>แนบรูปภาพผลงาน (Photo Evidence)</label>
                    <div style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '8px', textAlign: 'center', background: '#f8fafc', position: 'relative' }}>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '30px' }}>📷</span>
                            {photoFile ? (
                                <div style={{ color: '#0284c7', fontWeight: 'bold', fontSize: '16px' }}>{photoFile.name}</div>
                            ) : (
                                <div style={{ color: '#64748b' }}>คลิกเพื่อเลือกรูปภาพ หรือลากไฟล์มาวางที่นี่</div>
                            )}
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: '100%', padding: '14px', background: loading ? '#ccc' : '#22c55e', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 10px rgba(34, 197, 94, 0.3)' }}
                >
                    {loading ? 'กำลังส่งข้อมูล...' : 'ยืนยันส่งงาน'}
                </button>
            </form>

        </section>
      </main>
    </div>
  );
};

export default WorkerTaskDetail;