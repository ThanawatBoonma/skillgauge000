import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css';
import PMSidebar from '../../components/Sidebar/PMSidebar';

const ProjectDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // รับ ID จากการส่ง State หรือจาก URL (ถ้ามีการปรับ Router ในอนาคต)
  const pj_id = location.state?.pj_id;
  
  // ดึง User เพื่อใช้ใน Sidebar
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API = 'http://localhost:4000';

  // ฟังก์ชัน Logout
  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      sessionStorage.clear();
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  useEffect(() => {
    // 1. ป้องกันหน้าค้าง: ถ้าไม่มี ID ให้ดีดกลับ
    if (!pj_id) {
        alert("ไม่พบรหัสโครงการ กรุณาเลือกโครงการใหม่");
        navigate('/projects');
        return;
    }

    const fetchData = async () => {
        setLoading(true);
        try {
            // ยิง API 2 ตัวพร้อมกัน: รายละเอียดโปรเจค และ งานย่อย
            const [resProj, resTasks] = await Promise.all([
                axios.get(`${API}/api/manageproject/get/${pj_id}`),
                axios.get(`${API}/api/manageprojecttask/project/${pj_id}`)
            ]);

            setProject(resProj.data);
            setTasks(resTasks.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching detail:", err);
            setError("ไม่สามารถดึงข้อมูลได้");
            setLoading(false);
        }
    };

    fetchData();
  }, [pj_id, navigate]);

  const formatDate = (date) => {
      if(!date) return '-';
      const d = new Date(date);
      return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()+543}`;
  };

  // Helper สำหรับสี Priority
  const getPriorityColor = (p) => {
      switch(p) {
          case 'ชำนาญงานพิเศษ': return '#e74c3c';
          case 'ชำนาญ': return '#f39c12';
          default: return '#27ae60';
      }
  };

  if (loading) return (
    <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#f0f2f5'}}>
        <div style={{fontSize:'20px', color:'#555'}}>⏳ กำลังโหลดข้อมูล...</div>
    </div>
  );

  if (error) return <div style={{padding:'40px', textAlign:'center', color:'red'}}>{error}</div>;

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <PMSidebar />

      <main className="dash-main">
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header & Back Button */}
          <div style={{ marginBottom: '20px' }}>
            <button onClick={() => navigate('/projects')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '14px', marginBottom: '10px' }}>
                ← กลับหน้ารวมโครงการ
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: '#2c3e50', margin: 0 }}>{project.project_name}</h1>
                <button 
                    onClick={() => navigate('/define-tasks', { state: { project } })} 
                    style={{ background: '#e67e22', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(230, 126, 34, 0.3)' }}
                >
                    + สร้างงานย่อย (Task)
                </button>
            </div>
          </div>

          {/* Card 1: Project Overview */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
            <h3 style={{ borderBottom: '2px solid #f1f2f6', paddingBottom: '15px', marginTop: 0, color: '#34495e' }}>📌 รายละเอียดโครงการ</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div>
                    <p style={detailRowStyle}><span style={labelStyle}>ประเภท:</span> {project.project_type}</p>
                    <p style={detailRowStyle}><span style={labelStyle}>สถานที่:</span> {project.site_location || '-'}</p>
                    <p style={detailRowStyle}><span style={labelStyle}>PM ผู้ดูแล ID:</span> {project.manager_id}</p>
                </div>
                <div>
                    <p style={detailRowStyle}><span style={labelStyle}>ระยะเวลา:</span> {formatDate(project.start_date)} - {formatDate(project.end_date)}</p>
                    <p style={detailRowStyle}><span style={labelStyle}>รายละเอียด:</span> {project.description || '-'}</p>
                </div>
            </div>
          </div>

          {/* Card 2: Task List */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
             <h3 style={{ borderBottom: '2px solid #f1f2f6', paddingBottom: '15px', marginTop: 0, color: '#34495e', display:'flex', justifyContent:'space-between' }}>
                📋 รายการงานย่อย (Tasks)
                <span style={{fontSize:'14px', color:'#7f8c8d', fontWeight:'normal'}}>ทั้งหมด {tasks.length} งาน</span>
             </h3>
             
             {tasks.length > 0 ? (
                 <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', color: '#7f8c8d', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>ชื่องาน</th>
                                <th style={{ padding: '12px' }}>สายงานช่าง</th>
                                <th style={{ padding: '12px' }}>ความสำคัญ</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>คนงาน (ต้องการ)</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>สถานะมอบหมาย</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.pj_t_id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{task.task_name}</td>
                                    <td style={{ padding: '12px' }}>{task.technician_type}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ color: getPriorityColor(task.priority), fontWeight: 'bold', border: `1px solid ${getPriorityColor(task.priority)}`, padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>{task.required_workers} คน</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {/* แสดงจำนวนคนที่ Assign ไปแล้ว */}
                                        <span style={{ 
                                            background: task.assigned_count >= task.required_workers ? '#d4edda' : '#fff3cd', 
                                            color: task.assigned_count >= task.required_workers ? '#155724' : '#856404',
                                            padding: '4px 10px', borderRadius: '6px', fontSize: '13px' 
                                        }}>
                                            {task.assigned_count} / {task.required_workers}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             ) : (
                 <div style={{ textAlign: 'center', padding: '40px', color: '#999', border: '2px dashed #eee', borderRadius: '8px' }}>
                    <p style={{fontSize:'18px'}}>ยังไม่มีงานย่อยในโครงการนี้</p>
                    <button onClick={() => navigate('/project-tasks', { state: { project } })} style={{color:'#3498db', background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}>
                        สร้างงานย่อยแรกเลย
                    </button>
                 </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
};

const labelStyle = { color: '#7f8c8d', fontWeight: 'bold', marginRight: '10px' };
const detailRowStyle = { marginBottom: '12px', fontSize: '15px', color: '#2c3e50' };

export default ProjectDetail;