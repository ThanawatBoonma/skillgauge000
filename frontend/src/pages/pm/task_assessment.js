import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ThaiDatePicker from '../../components/ThaiDatePicker'; // ตรวจสอบ path ให้ถูก
import '../pm/WKDashboard.css';
import PMSidebar from '../../components/Sidebar/PMSidebar';

const TaskAssessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // รับข้อมูลจากหน้า PMProjectManager
  const { worker, mode, taskId } = location.state || {};
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // --- State for Modals ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [taskInfo, setTaskInfo] = useState({
    task_name: '',
    task_type: 'บ้านพักอาศัย', // ✅ แก้ไขค่าเริ่มต้นให้ตรงกับตัวเลือกใหม่
    site_location: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
      // ถ้าไม่มี worker ส่งมาให้กลับไปหน้าเดิม
      if (!worker && mode !== 'edit') {
          navigate('/pm');
      }
      // TODO: ถ้า mode='edit' ควรดึงข้อมูลเก่ามาใส่
  }, [worker, mode, navigate]);

  const handleTaskChange = (e) => {
    setTaskInfo({ ...taskInfo, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name, dateValue) => {
    let formattedDate = dateValue;
    if (dateValue instanceof Date) {
        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, '0');
        const day = String(dateValue.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
    }
    setTaskInfo(prev => ({ ...prev, [name]: formattedDate }));
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!user) { setAlertMessage('กรุณาเข้าสู่ระบบก่อน'); return; }
    
    setLoading(true);
    try {
        const payload = { 
            ...taskInfo, 
            manager_id: user.id,
            worker_id: worker.id // ผูกงานกับช่างคนนี้
        };
        const API = 'http://localhost:4000'; 
        
        if (mode === 'create') {
            await axios.post(`${API}/api/pm/task/add`, payload);
        } else {
            // Logic แก้ไข (ต้องทำ API update เพิ่ม)
            // await axios.put(`${API}/api/pm/task/${taskId}`, payload);
        }
        
        setShowSuccessModal(true);
    } catch (err) {
        console.error(err);
        setAlertMessage('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
        setLoading(false);
    }
  };

  const handleSuccessClose = () => {
      setShowSuccessModal(false);
      navigate('/pm'); // กลับหน้า PM
  };

  // Styles
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
  const modalContentStyle = { background: 'white', padding: '25px', borderRadius: '12px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
  const btnStyle = { padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', margin: '0 5px' };
  const labelStyle = { fontWeight: 'bold', marginBottom: '8px', display: 'block', color: '#34495e' };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7', fontSize: '16px' };
  const btnSaveStyle = { background: '#27ae60', color: 'white', padding: '12px 40px', border: 'none', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(39, 174, 96, 0.3)' };

  return (
    <div className="dash-layout">
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={{fontSize: '40px', marginBottom: '10px'}}>🎉</div>
                <h3 style={{color: '#27ae60', margin: '0 0 10px'}}>บันทึกสำเร็จ!</h3>
                <p style={{color: '#555', marginBottom: '20px'}}>มอบหมายงานให้ช่างเรียบร้อยแล้ว</p>
                <button onClick={handleSuccessClose} style={{...btnStyle, background:'#27ae60', color:'white'}}>ตกลง</button>
            </div>
        </div>
      )}

      {/* Alert Error */}
      {alertMessage && (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h3 style={{color: '#c0392b', margin: '0 0 15px'}}>แจ้งเตือน</h3>
                <p style={{color: '#555', marginBottom: '20px'}}>{alertMessage}</p>
                <button onClick={() => setAlertMessage('')} style={{...btnStyle, background:'#3498db', color:'white'}}>ตกลง</button>
            </div>
        </div>
      )}

      <PMSidebar />

      <main className="dash-main">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <h1 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
              {mode === 'edit' ? 'แก้ไขงาน' : 'สร้างงานใหม่'} (สำหรับ: {worker?.full_name})
          </h1>
          
          <form onSubmit={handleSaveTask} style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            
            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>ชื่องาน *</label>
                <input className="input" type="text" name="task_name" value={taskInfo.task_name} onChange={handleTaskChange} required style={inputStyle} placeholder="ระบุชื่องาน" />
            </div>

            {/* ✅ แก้ไขตัวเลือกประเภทงานตามที่ต้องการ */}
            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>ประเภทงาน *</label>
                <select className="input" name="task_type" value={taskInfo.task_type} onChange={handleTaskChange} style={inputStyle}>
                    <option value="บ้านพักอาศัย">บ้านพักอาศัย</option>
                    <option value="อาคารพาณิชย์">อาคารพาณิชย์</option>
                    <option value="คอนโดมิเนียม">คอนโดมิเนียม</option>
                    <option value="โรงงาน/คลังสินค้า">โรงงาน/คลังสินค้า</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>สถานที่ปฏิบัติงาน</label>
                <textarea className="input" name="site_location" value={taskInfo.site_location} onChange={handleTaskChange} rows="3" style={inputStyle} placeholder="ระบุที่อยู่ หรือพิกัด" />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>รายละเอียดเพิ่มเติม</label>
                <textarea className="input" name="description" value={taskInfo.description} onChange={handleTaskChange} rows="4" style={inputStyle} placeholder="รายละเอียดสังเขป" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                    <label style={labelStyle}>วันที่เริ่มงาน</label>
                    <ThaiDatePicker 
                        value={taskInfo.start_date}
                        onChange={(val) => handleDateChange('start_date', val)}
                        placeholder="เลือกวันเริ่ม"
                        className="input"
                        popperPlacement="top-start" // ✅ ปรับให้ปฏิทินเด้งขึ้นด้านบน
                    />
                </div>
                <div>
                    <label style={labelStyle}>วันที่สิ้นสุด (โดยประมาณ)</label>
                    <ThaiDatePicker 
                        value={taskInfo.end_date}
                        onChange={(val) => handleDateChange('end_date', val)}
                        placeholder="เลือกวันสิ้นสุด"
                        className="input"
                        popperPlacement="top-start" // ✅ ปรับให้ปฏิทินเด้งขึ้นด้านบน
                    />
                </div>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button type="submit" disabled={loading} style={btnSaveStyle}>
                  {loading ? 'กำลังบันทึก...' : 'บันทึกงาน'}
                </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default TaskAssessment;