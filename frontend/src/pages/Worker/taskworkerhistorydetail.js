import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../pm/WKDashboard.css';

const TaskWorkerHistoryDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const task = location.state?.task;

  if (!task) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>ไม่พบข้อมูลงาน</h3>
        <button onClick={() => navigate('/worker/task-history')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            กลับหน้าประวัติ
        </button>
      </div>
    );
  }

  return (
    <div className="dash-layout">
      {/* Sidebar ของ Worker */}
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
          Worker Portal
        </div>
        <nav className="menu">
            <button className="menu-item" onClick={() => navigate('/worker/task-history')}>&larr; กลับหน้าประวัติ</button>
        </nav>
      </aside>

      <main className="dash-main">
        <div className="dash-topbar">
            <div className="role-pill">Worker</div>
            <div className="top-actions">
                <span className="profile">รายละเอียดงานที่เสร็จสิ้น</span>
            </div>
        </div>

        <section className="dash-content" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            
            {/* Header Card */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{task.task_name}</h2>
                        <span style={{ color: '#64748b', fontSize: '14px' }}>
                            โครงการ: {task.task_type || '-'}
                        </span>
                    </div>
                    <div>
                        <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '16px', border:'1px solid #22c55e', padding:'5px 15px', borderRadius:'8px' }}>
                            {task.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* รายละเอียด */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px', color: '#334155' }}>
                    ข้อมูลงาน
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <strong style={{ display: 'block', color: '#64748b', fontSize: '14px' }}>วันที่เริ่มงาน</strong>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb' }}>
                             {task.start_date ? new Date(task.start_date).toLocaleDateString('th-TH') : '-'}
                        </div>
                    </div>
                    <div>
                        <strong style={{ display: 'block', color: '#64748b', fontSize: '14px' }}>วันที่ส่งงาน (เสร็จสิ้น)</strong>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#e11d48' }}>📅 {task.date_formatted}</div>
                    </div>
                    <div>
                        <strong style={{ display: 'block', color: '#64748b', fontSize: '14px' }}>PM ผู้มอบหมาย</strong>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{task.manager_name || '-'}</div>
                    </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <strong style={{ color: '#0369a1', display:'block', marginBottom:'5px' }}>📍 สถานที่ปฏิบัติงาน:</strong>
                    <div style={{ padding: '10px', background: '#f0f9ff', borderRadius: '6px', color: '#334155' }}>
                        {task.site_location || "ไม่ได้ระบุ"}
                    </div>
                </div>

                <div>
                    <strong style={{ color: '#475569', display:'block', marginBottom:'5px' }}>📝 รายละเอียดเพิ่มเติม:</strong>
                    <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', color: '#64748b' }}>
                        {task.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                    </div>
                </div>
            </div>

            {/* รูปภาพผลงาน */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #f59e0b' }}>
                <h3 style={{ marginBottom: '20px', color: '#d97706' }}>📷 รูปภาพผลงานที่ส่ง (Evidence)</h3>
                
                <div style={{ textAlign: 'center', background: '#1e293b', padding: '20px', borderRadius: '8px' }}>
                    {task.photo_url ? (
                        <img 
                            src={task.photo_url} 
                            alt="Submitted Work" 
                            style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '4px', border: '1px solid #475569' }} 
                        />
                    ) : (
                        <div style={{ color: '#94a3b8', padding: '50px' }}>ไม่พบไฟล์รูปภาพ</div>
                    )}
                </div>
            </div>

        </section>
      </main>
    </div>
  );
};

export default TaskWorkerHistoryDetail;