import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { mockUser } from '../../mock/mockData';
import '../pm/WKDashboard.css';

const WKAssignWorker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { job, user: navUser } = location.state || { job: {}, user: {} };
  const user = navUser || { ...mockUser, role: 'Project Manager' };

  // ฟังก์ชัน Logout สำหรับ Sidebar
  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkers, setSelectedWorkers] = useState([]);

  // ✅ จำนวนช่างที่มึงต้องการจาก Step 2
  const requiredCount = parseInt(job.requiredWorkers) || 1;

  const MOCK_WORKERS = [
    { id: 1, name: "นายกอไก่ ใจดี", skill_type: "งานโครงสร้าง", status: "Available", age: 20, experience_years: 0, level: 0 },
    { id: 2, name: "นายขอไข่ ขยัน", skill_type: "งานไฟฟ้า", status: "Available", age: 21, experience_years: 0, level: 0 },
    { id: 3, name: "นายคอควาย คล่องแคล่ว", skill_type: "งานประปา", status: "Available", age: 19, experience_years: 0, level: 0 },
    { id: 4, name: "นายงองู งามสง่า", skill_type: "งานโครงสร้าง", status: "Available", age: 22, experience_years: 1, level: 0 },
    { id: 5, name: "นายจอจาน จริงใจ", skill_type: "งานก่ออิฐฉาบปูน", status: "Available", age: 20, experience_years: 0, level: 0 },
    { id: 6, name: "นายฉอฉิ่ง ตีดัง", skill_type: "งานโครงสร้าง", status: "Available", age: 24, experience_years: 2, level: 1 },
    { id: 7, name: "นายชอช้าง วิ่งหนี", skill_type: "งานไฟฟ้า", status: "Available", age: 25, experience_years: 2, level: 1 },
    { id: 8, name: "นายซอโซ่ ล่ามที", skill_type: "งานประปา", status: "Available", age: 23, experience_years: 1, level: 1 },
    { id: 9, name: "นายฌอเฌอ คู่กัน", skill_type: "งานก่ออิฐฉาบปูน", status: "Available", age: 26, experience_years: 3, level: 1 },
    { id: 10, name: "นายญอหญิง โสภา", skill_type: "งานหลังคา", status: "Available", age: 24, experience_years: 2, level: 1 },
    { id: 11, name: "นายฎอชฎา สวมพลัน", skill_type: "งานโครงสร้าง", status: "Available", age: 25, experience_years: 2, level: 1 },
    { id: 12, name: "นายฏอปฏัก หุนหัน", skill_type: "งานไฟฟ้า", status: "Available", age: 27, experience_years: 3, level: 1 },
    { id: 13, name: "นายฐอฐาน รองรับ", skill_type: "งานประปา", status: "Available", age: 24, experience_years: 2, level: 1 },
    { id: 14, name: "นายโฑมณโฑ หน้าขาว", skill_type: "งานโครงสร้าง", status: "Available", age: 30, experience_years: 5, level: 2 },
    { id: 15, name: "นายฒอผู้เฒ่า เดินย่อง", skill_type: "งานไฟฟ้า", status: "Available", age: 32, experience_years: 6, level: 2 },
    { id: 16, name: "นายณอเณร ไม่มอง", skill_type: "งานประปา", status: "Available", age: 29, experience_years: 4, level: 2 },
    { id: 17, name: "นายดอเด็ก ต้องนิมนต์", skill_type: "งานก่ออิฐฉาบปูน", status: "Available", age: 31, experience_years: 5, level: 2 },
    { id: 18, name: "นายตอเต่า หลังตุง", skill_type: "งานหลังคา", status: "Available", age: 33, experience_years: 7, level: 2 },
    { id: 19, name: "นายถอถุง แบกขน", skill_type: "งานโครงสร้าง", status: "Available", age: 30, experience_years: 5, level: 2 },
    { id: 20, name: "นายทอทหาร อดทน", skill_type: "งานโครงสร้าง", status: "Available", age: 40, experience_years: 15, level: 3 },
    { id: 21, name: "นายธอธง คนนิยม", skill_type: "งานไฟฟ้า", status: "Available", age: 38, experience_years: 12, level: 3 },
    { id: 22, name: "นายนอนู ฝักใฝ่", skill_type: "งานประปา", status: "Available", age: 42, experience_years: 18, level: 3 },
    { id: 23, name: "นายบอใบไม้ ทับถม", skill_type: "งานก่ออิฐฉาบปูน", status: "Available", age: 45, experience_years: 20, level: 3 },
  ];

  // ✅ กรองช่างตามประเภทงาน
  const filteredWorkers = MOCK_WORKERS.filter(w => {
    const isMatchType = w.skill_type === job.taskType;
    const isMatchSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase());
    return isMatchType && isMatchSearch;
  });

  const toggleSelectWorker = (worker) => {
    const isAlreadySelected = selectedWorkers.find(w => w.id === worker.id);
    if (isAlreadySelected) {
      setSelectedWorkers(selectedWorkers.filter(w => w.id !== worker.id));
    } else {
      if (selectedWorkers.length < requiredCount) {
        setSelectedWorkers([...selectedWorkers, worker]);
      } else {
        alert(`คุณระบุไว้ว่าต้องการช่างแค่ ${requiredCount} คน`);
      }
    }
  };

  const handleConfirmAssignment = () => {
    if (selectedWorkers.length < requiredCount) {
      alert(`กรุณาเลือกช่างให้ครบ ${requiredCount} คน`);
      return;
    }
    const currentJobs = JSON.parse(localStorage.getItem('mock_jobs') || '[]');
    const projectIndex = currentJobs.findIndex(p => p.projectName === job.projectName);
    const newTask = { ...job, assigned_workers: selectedWorkers, status: 'รอดำเนินการ' };

    let updatedProject;
    if (projectIndex !== -1) {
      if (!currentJobs[projectIndex].tasks) currentJobs[projectIndex].tasks = [];
      currentJobs[projectIndex].tasks.push(newTask);
      updatedProject = currentJobs[projectIndex];
    } else {
      updatedProject = { ...job, tasks: [newTask] };
      currentJobs.unshift(updatedProject);
    }

    localStorage.setItem('mock_jobs', JSON.stringify(currentJobs));
    navigate('/project-detail', { state: { project: updatedProject, user } });
  };

  const colName = { flex: 2 };
  const colSkill = { flex: 1.5 };
  const colInfo = { flex: 1.5 };
  const colLevel = { flex: 1 };
  const colAction = { flex: 1.2, textAlign: 'center' };

  return (
    <div className="dash-layout">
      {/* Sidebar - ปรับให้เหมือน Worker/Foreman */}
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
          PM Portal
        </div>
        <nav className="menu">
          <button 
            type="button" 
            className={`menu-item ${location.pathname === '/pm' || location.pathname === '/dashboard' ? 'active' : ''}`} 
            onClick={() => navigate('/pm', { state: { user } })}
          >
            หน้าหลัก
          </button>
          <button 
            type="button" 
            className={`menu-item ${location.pathname === '/project-tasks' || location.pathname === '/define-tasks' ? 'active' : ''}`} 
            onClick={() => navigate('/project-tasks', { state: { user } })}
          >
            มอบหมายงาน
          </button>
          <button 
            type="button" 
            className={`menu-item ${location.pathname === '/projects' ? 'active' : ''}`} 
            onClick={() => navigate('/projects', { state: { user } })}
          >
            โครงการทั้งหมด
          </button>
          <button 
            type="button" 
            className={`menu-item ${location.pathname === '/pm-settings' ? 'active' : ''}`} 
            onClick={() => navigate('/pm-settings', { state: { user } })}
          >
            ตั้งค่า
          </button>
          <button 
            type="button" 
            className="menu-item logout-btn" 
            style={{ marginTop: '20px', color: '#ef4444', background: '#fef2f2', borderColor: '#fee2e2' }}
            onClick={handleLogout}
          >
            ออกจากระบบ
          </button>
        </nav>
      </aside>

      <main className="dash-main">
        <div style={{ padding: '20px' }}>
          <div className="panel" style={{ background: 'white', padding: '30px', borderRadius: '15px', position: 'relative', minHeight: '80vh' }}>
            
            <header style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>เลือกช่างสำหรับ: {job.taskName}</h2>
              <p style={{ margin: '5px 0', color: '#27ae60', fontWeight: 'bold' }}>
                สถานะการเลือก: {selectedWorkers.length} / {requiredCount} คน (หมวด: {job.taskType})
              </p>
            </header>

            <input 
              type="text" 
              placeholder="🔍 ค้นหาชื่อช่าง..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}
            />

            <div className="table" style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', marginBottom: '80px' }}>
              <div className="thead" style={{ display: 'flex', background: '#f8f9fa', padding: '15px', fontWeight: 'bold', borderBottom: '2px solid #eee' }}>
                <div style={colName}>ชื่อช่าง</div>
                <div style={colSkill}>ทักษะ</div>
                <div style={colInfo}>อายุ/ประสบการณ์</div>
                <div style={colLevel}>ระดับ</div>
                <div style={colAction}>เลือกช่าง</div>
              </div>
              <div className="tbody" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                {filteredWorkers.map(w => {
                  const isSelected = selectedWorkers.find(sw => sw.id === w.id);
                  return (
                    <div key={w.id} style={{ display: 'flex', padding: '15px', borderBottom: '1px solid #f1f1f1', alignItems: 'center' }}>
                      <div style={colName}><strong>{w.name}</strong></div>
                      <div style={colSkill}>{w.skill_type}</div>
                      <div style={colInfo}>{w.age} ปี / {w.experience_years} ปี</div>
                      <div style={colLevel}>Lv. {w.level}</div>
                      <div style={colAction}>
                        <button 
                          onClick={() => toggleSelectWorker(w)}
                          style={{ 
                            background: isSelected ? '#e74c3c' : (selectedWorkers.length >= requiredCount ? '#ecf0f1' : '#27ae60'), 
                            color: isSelected || selectedWorkers.length < requiredCount ? 'white' : '#bdc3c7', 
                            border: 'none', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer' 
                          }}
                        >
                          {isSelected ? 'ยกเลิก' : 'เลือกคนนี้'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ✅ ย้ายปุ่มยืนยันมาไว้ล่างขวาสุดของ Panel */}
            <div style={{ position: 'absolute', bottom: '30px', right: '30px' }}>
              <button 
                onClick={handleConfirmAssignment} 
                style={{ 
                  background: selectedWorkers.length === requiredCount ? '#27ae60' : '#bdc3c7', 
                  color: 'white', 
                  padding: '15px 40px', 
                  borderRadius: '30px', 
                  border: 'none', 
                  fontWeight: 'bold', 
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s'
                }}
              >
                ยืนยันการมอบหมายงาน ➝
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default WKAssignWorker;