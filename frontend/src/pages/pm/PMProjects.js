import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ThaiDatePicker from '../../components/ThaiDatePicker';
import '../pm/WKDashboard.css';
import PMSidebar from '../../components/Sidebar/PMSidebar';

const PMProjects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // --- State ข้อมูล ---
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- State สำหรับ Modals ---
  // ใช้ object เดียวคุมทุก modal (edit, delete, logout, alert)
  const [modal, setModal] = useState({
    type: null, // 'edit' | 'delete' | 'logout' | 'alert'
    show: false,
    data: null, // เก็บ ID หรือ ข้อมูลที่ต้องใช้
    message: '' // สำหรับ alert
  });

  // --- State สำหรับฟอร์มแก้ไข ---
  const [editForm, setEditForm] = useState({
    project_name: '',
    project_type: 'บ้านพักอาศัย',
    site_location: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  const API = 'http://localhost:4000'; 

  // 1. ดึงข้อมูล
  const fetchProjects = async () => {
    if (!user) return;
    try {
        const res = await axios.get(`${API}/api/manageproject/all?user_id=${user.id}`);
        setProjects(res.data);
    } catch (err) {
        console.error("Error fetching projects:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- Helper Functions ---
  const closeModal = () => {
    setModal({ type: null, show: false, data: null, message: '' });
  };

  const showCustomAlert = (msg) => {
    setModal({ type: 'alert', show: true, message: msg });
  };

  // --- Logic 1: Logout ---
  const handleLogoutClick = () => {
    setModal({ type: 'logout', show: true });
  };
  const confirmLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- Logic 2: Delete ---
  const handleDeleteClick = (pj_id) => {
    setModal({ type: 'delete', show: true, data: pj_id });
  };
  const confirmDelete = async () => {
    try {
        await axios.delete(`${API}/api/manageproject/delete/${modal.data}`);
        closeModal();
        fetchProjects(); 
    } catch (err) {
        closeModal();
        showCustomAlert("ลบไม่สำเร็จ");
    }
  };

  // --- Logic 3: Edit (เปิดป็อปอัพ + ดึงข้อมูลเดิม) ---
  const handleEditClick = (project) => {
    // เตรียมข้อมูลลงฟอร์ม (ตัดเวลา T00:00:00.000Z ออกถ้ามี)
    setEditForm({
        project_name: project.project_name,
        project_type: project.project_type,
        site_location: project.site_location || '',
        description: project.description || '',
        start_date: project.start_date ? project.start_date.split('T')[0] : '',
        end_date: project.end_date ? project.end_date.split('T')[0] : ''
    });
    // เปิด Modal Edit
    setModal({ type: 'edit', show: true, data: project.pj_id });
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditDateChange = (name, dateValue) => {
    let formattedDate = dateValue;
    if (dateValue instanceof Date) {
        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, '0');
        const day = String(dateValue.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
    }
    setEditForm(prev => ({ ...prev, [name]: formattedDate }));
  };

  const saveEditProject = async (e) => {
    e.preventDefault();
    try {
        await axios.put(`${API}/api/manageproject/update/${modal.data}`, editForm);
        closeModal();
        showCustomAlert("บันทึกการแก้ไขเรียบร้อยแล้ว");
        fetchProjects();
    } catch (err) {
        console.error(err);
        showCustomAlert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const formatDateThai = (dateString) => {
      if(!dateString) return "-";
      const d = new Date(dateString);
      return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()+543}`;
  };

  const filteredProjects = projects.filter(p => p.project_name.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- Styles ---
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
  const modalContentStyle = { background: 'white', padding: '25px', borderRadius: '12px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
  const editModalStyle = { ...modalContentStyle, width: '600px', maxWidth: '90%', textAlign: 'left' }; // Modal แก้ไขจะกว้างกว่า
  const btnStyle = { padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', margin: '0 5px' };
  const labelStyle = { fontWeight: 'bold', marginBottom: '5px', display: 'block', color: '#34495e', fontSize: '14px' };
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', fontSize: '14px', marginBottom: '15px' };

  return (
    <div className="dash-layout">
       
       {/* === ZONE MODAL POPUPS === */}
       {modal.show && (
         <div style={modalOverlayStyle}>
            
            {/* 1. Modal Alert */}
            {modal.type === 'alert' && (
                <div style={modalContentStyle}>
                    <h3 style={{color: '#2c3e50', margin:'0 0 15px'}}>แจ้งเตือน</h3>
                    <p style={{marginBottom:'20px', color:'#555'}}>{modal.message}</p>
                    <button onClick={closeModal} style={{...btnStyle, background:'#3498db', color:'white'}}>ตกลง</button>
                </div>
            )}

            {/* 2. Modal Logout */}
            {modal.type === 'logout' && (
                <div style={modalContentStyle}>
                    <h3 style={{color: '#e74c3c', margin:'0 0 15px'}}>ยืนยันออกจากระบบ?</h3>
                    <div style={{display:'flex', justifyContent:'center'}}>
                        <button onClick={closeModal} style={{...btnStyle, background:'#ccc'}}>ยกเลิก</button>
                        <button onClick={confirmLogout} style={{...btnStyle, background:'#e74c3c', color:'white'}}>ยืนยัน</button>
                    </div>
                </div>
            )}

            {/* 3. Modal Delete */}
            {modal.type === 'delete' && (
                <div style={modalContentStyle}>
                    <h3 style={{color: '#c0392b', margin:'0 0 15px'}}>ยืนยันการลบ?</h3>
                    <p style={{marginBottom:'20px', color:'#555'}}>ข้อมูลโครงการจะหายไปถาวร</p>
                    <div style={{display:'flex', justifyContent:'center'}}>
                        <button onClick={closeModal} style={{...btnStyle, background:'#ccc'}}>ยกเลิก</button>
                        <button onClick={confirmDelete} style={{...btnStyle, background:'#e74c3c', color:'white'}}>ลบเลย</button>
                    </div>
                </div>
            )}

            {/* 4. Modal Edit (ฟอร์มแก้ไข) */}
            {modal.type === 'edit' && (
                <div style={editModalStyle}>
                    <h2 style={{color: '#2c3e50', borderBottom:'2px solid #eee', paddingBottom:'10px', marginTop:0}}>แก้ไขโครงการ</h2>
                    <form onSubmit={saveEditProject}>
                        
                        <div>
                            <label style={labelStyle}>ชื่อโครงการ *</label>
                            <input className="input" type="text" name="project_name" value={editForm.project_name} onChange={handleEditFormChange} required style={inputStyle} />
                        </div>

                        <div>
                            <label style={labelStyle}>ประเภทโครงการ *</label>
                            <select className="input" name="project_type" value={editForm.project_type} onChange={handleEditFormChange} style={inputStyle}>
                                <option value="บ้านพักอาศัย">บ้านพักอาศัย</option>
                                <option value="อาคารพาณิชย์">อาคารพาณิชย์</option>
                                <option value="คอนโดมิเนียม">คอนโดมิเนียม</option>
                                <option value="โรงงาน/คลังสินค้า">โรงงาน/คลังสินค้า</option>
                                <option value="อื่นๆ">อื่นๆ</option>
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>สถานที่ตั้งโครงการ</label>
                            <textarea className="input" name="site_location" value={editForm.site_location} onChange={handleEditFormChange} rows="2" style={inputStyle} />
                        </div>

                        <div>
                            <label style={labelStyle}>รายละเอียดเพิ่มเติม</label>
                            <textarea className="input" name="description" value={editForm.description} onChange={handleEditFormChange} rows="2" style={inputStyle} />
                        </div>

                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginBottom:'20px'}}>
                            <div>
                                <label style={labelStyle}>วันที่เริ่มโครงการ</label>
                                <ThaiDatePicker 
                                    value={editForm.start_date}
                                    onChange={(val) => handleEditDateChange('start_date', val)}
                                    placeholder="เลือกวันเริ่ม"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>วันที่สิ้นสุด (โดยประมาณ)</label>
                                <ThaiDatePicker 
                                    value={editForm.end_date}
                                    onChange={(val) => handleEditDateChange('end_date', val)}
                                    placeholder="เลือกวันสิ้นสุด"
                                />
                            </div>
                        </div>

                        <div style={{display:'flex', justifyContent:'flex-end', marginTop:'20px'}}>
                            <button type="button" onClick={closeModal} style={{...btnStyle, background:'#95a5a6', color:'white'}}>ยกเลิก</button>
                            <button type="submit" style={{...btnStyle, background:'#27ae60', color:'white'}}>บันทึกโครงการ</button>
                        </div>
                    </form>
                </div>
            )}

         </div>
       )}

      <PMSidebar />

      <main className="dash-main">
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
                <h1 style={{ margin: 0, color: '#2c3e50' }}>โครงการทั้งหมด</h1>
                <p style={{ color: '#7f8c8d' }}>จัดการโครงการที่คุณดูแล ({filteredProjects.length})</p>
            </div>
            <button onClick={() => navigate('/create-project')} style={{ background: '#27ae60', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              + สร้างโครงการใหม่
            </button>
          </div>

          <input 
            type="text" 
            placeholder="🔍 ค้นหาชื่อโครงการ..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}
          />

          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', color: '#7f8c8d', textAlign: 'left' }}>
                  <th style={{ padding: '15px' }}>ชื่อโครงการ</th>
                  <th style={{ padding: '15px' }}>ประเภท</th>
                  <th style={{ padding: '15px' }}>สถานที่</th>
                  <th style={{ padding: '15px' }}>ระยะเวลา</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((p) => (
                    <tr key={p.pj_id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px', fontWeight: 'bold', color: '#2c3e50' }}>{p.project_name}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ background: '#eaf2f8', color: '#3498db', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{p.project_type}</span>
                      </td>
                      <td style={{ padding: '15px', color: '#555' }}>{p.site_location || '-'}</td>
                      <td style={{ padding: '15px', fontSize: '13px' }}>
                        {formatDateThai(p.start_date)} - {formatDateThai(p.end_date)}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                         <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                            <button 
                                onClick={() => navigate('/project-detail', { state: { pj_id: p.pj_id } })}
                                style={{ ...actionBtnStyle, background: '#3498db' }} title="ดูรายละเอียด / เพิ่มงาน"
                            >
                                📋 เพิ่มงาน
                            </button>
                            <button 
                                onClick={() => handleEditClick(p)} // เรียกใช้ป็อปอัพแก้ไข
                                style={{ ...actionBtnStyle, background: '#f1c40f' }} title="แก้ไข"
                            >
                                ✏️
                            </button>
                            <button 
                                onClick={() => handleDeleteClick(p.pj_id)}
                                style={{ ...actionBtnStyle, background: '#e74c3c' }} title="ลบ"
                            >
                                🗑️
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>ไม่พบข้อมูลโครงการ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

// Styles
const actionBtnStyle = { border: 'none', color: 'white', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' };

export default PMProjects;