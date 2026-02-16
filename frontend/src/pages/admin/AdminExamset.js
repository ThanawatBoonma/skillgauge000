import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { apiRequest } from '../../utils/api';
import './AdminExamset.css';

// Mapping ชื่อฟิลด์ใน DB กับชื่อที่จะแสดง และ Key สำหรับ State
const FIELDS_MAP = [
  { key: 'rebar_percent', label: 'งานเหล็กเสริม', db_skill: 'งานเหล็กเสริม' },
  { key: 'concrete_percent', label: 'งานคอนกรีต', db_skill: 'งานคอนกรีต' },
  { key: 'formwork_percent', label: 'งานไม้แบบ', db_skill: 'งานไม้แบบ' },
  { key: 'element_percent', label: 'องค์อาคาร', db_skill: 'องค์อาคาร' },
  { key: 'theory_percent', label: 'การออกแบบ/ทฤษฎี', db_skill: 'การออกแบบ/ทฤษฎี' }
];

const AdminExamset = () => {
  const navigate = useNavigate();

  // State
  const [currentLevel, setCurrentLevel] = useState('1'); // Default Level 1
  const [loading, setLoading] = useState(false);
  
  // เก็บค่า % ของแต่ละฟิลด์
  const [formData, setFormData] = useState({
    rebar_percent: 0,
    concrete_percent: 0,
    formwork_percent: 0,
    element_percent: 0,
    theory_percent: 0
  });

  // เก็บจำนวนข้อสอบรวม (จาก Exam Settings) และจำนวนข้อที่มีในคลัง
  const [totalQuestions, setTotalQuestions] = useState(60); 
  const [stockCounts, setStockCounts] = useState({});

  // 1. โหลดข้อมูลเมื่อเปลี่ยน Level
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // A. ดึง Setting จำนวนข้อสอบรวม (จาก API เดิม)
        const setting = await apiRequest(`/api/managequestion/setting/${currentLevel}`);
        if (setting) setTotalQuestions(setting.question_count || 60);

        // B. ดึง % ที่บันทึกไว้ (จาก API ใหม่ examset)
        const structureData = await apiRequest(`/api/examset/${currentLevel}`);
        if (structureData) {
          setFormData({
            rebar_percent: structureData.rebar_percent || 0,
            concrete_percent: structureData.concrete_percent || 0,
            formwork_percent: structureData.formwork_percent || 0,
            element_percent: structureData.element_percent || 0,
            theory_percent: structureData.theory_percent || 0
          });
        }

        // C. ดึงจำนวนข้อสอบที่มีในคลัง (เพื่อแสดง Stock)
        // ใช้ API managequestion/all แล้วมานับเอง
        const allQuestions = await apiRequest(`/api/managequestion/all?category=structure`);
        const counts = {};
        allQuestions.forEach(q => {
           // นับเฉพาะข้อที่ Level ตรงกับปัจจุบัน หรือนับรวม (ที่นี่ขอนับรวมตาม Skill Type)
           // แต่ถ้าจะละเอียดต้องเช็ค difficulty_level ด้วย
           const skill = q.skill_type; 
           if (skill) counts[skill] = (counts[skill] || 0) + 1;
        });
        setStockCounts(counts);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLevel]);

  // คำนวณผลรวม %
  const totalPercent = useMemo(() => {
    return Object.values(formData).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  }, [formData]);

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: parseInt(value) || 0
    }));
  };

  const handleSave = async () => {
    if (totalPercent !== 100) {
      return Swal.fire('แจ้งเตือน', `ผลรวมต้องเท่ากับ 100% (ปัจจุบัน ${totalPercent}%)`, 'warning');
    }

    try {
      // ยิง API ใหม่เพื่อบันทึก
      await apiRequest(`/api/examset/${currentLevel}`, {
        method: 'POST',
        body: formData
      });
      Swal.fire('บันทึกสำเร็จ', `โครงสร้างข้อสอบระดับ ${currentLevel} ถูกบันทึกแล้ว`, 'success');
    } catch (err) {
      Swal.fire('เกิดข้อผิดพลาด', err.message, 'error');
    }
  };

  return (
    <div className="admin-examset">
      <div className="examset-container">
        
        {/* Header */}
        <header className="examset-header">
           <button className="btn-back" onClick={() => navigate('/admin')}>
             <i className='bx bx-arrow-back'></i> กลับ
           </button>
           <div className="header-info">
             <h2>กำหนดโครงสร้างข้อสอบ (Test Blueprint)</h2>
             <span className="badge-cat">ช่างโครงสร้าง</span>
           </div>
        </header>

        {/* Main Card */}
        <div className="examset-card">
           <div className="examset-card-header">
              <div className="header-title">
                 <i className='bx bx-pie-chart-alt-2'></i> สัดส่วนข้อสอบรายหมวดหมู่ย่อย
              </div>
              
              {/* ✅ ส่วนเลือก Level และปุ่มบันทึก (อยู่ขวาบน) */}
              <div className="header-actions">
                 <div className="level-selector">
                    <span style={{ fontSize: '0.9rem', marginRight: '5px', color: '#555' }}>เลือกระดับ:</span>
                    {['1', '2', '3'].map(lvl => (
                      <button 
                        key={lvl}
                        className={`btn-level-select ${currentLevel === lvl ? 'active' : ''}`}
                        onClick={() => setCurrentLevel(lvl)}
                      >
                        ระดับ {lvl}
                      </button>
                    ))}
                 </div>
                 <button className="btn-save-formula" onClick={handleSave}>
                    <i className='bx bx-save'></i> บันทึกโครงสร้าง
                 </button>
              </div>
           </div>

           <p className="instruction-text">
              กำหนดเปอร์เซ็นต์ของแต่ละหมวดหมู่ย่อยสำหรับ <strong>ระดับ {currentLevel}</strong> (เป้าหมายรวม: <strong>{totalQuestions} ข้อ</strong>)
           </p>

           {/* Input Grid */}
           <div className="subcategory-grid">
              {FIELDS_MAP.map((field) => {
                 const percent = formData[field.key];
                 const count = Math.round((percent / 100) * totalQuestions);
                 const stock = stockCounts[field.db_skill] || 0; // จำนวนที่มีในคลัง

                 return (
                    <div key={field.key} className="sub-card">
                       <div className="sub-card-header">
                          <span className="sub-name">{field.label}</span>
                          <span className={`sub-stock ${stock < count ? 'low' : ''}`}>
                             คลัง: {stock} ข้อ
                          </span>
                       </div>
                       
                       <div className="sub-input-group">
                          <label>สัดส่วน (%)</label>
                          <input 
                            type="number" 
                            className="pct-input"
                            value={percent}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            min="0" max="100"
                          />
                       </div>

                       <div className="sub-footer">
                          <span className="text-calulated">
                             คิดเป็น {count} ข้อ
                          </span>
                          {count > stock && (
                             <span className="text-warning">
                                <i className='bx bx-error'></i> ขาด {count - stock} ข้อ
                             </span>
                          )}
                       </div>
                    </div>
                 );
              })}
           </div>

           {/* Footer Summary */}
           <div className="examset-footer-summary">
              <div className={`summary-box ${totalPercent === 100 ? 'valid' : 'invalid'}`}>
                 <span>ผลรวมสัดส่วน:</span>
                 <strong style={{ fontSize: '1.2rem', marginLeft: '10px' }}>{totalPercent}%</strong>
                 {totalPercent !== 100 && <span style={{ marginLeft: '10px', fontSize: '0.9rem' }}>(ต้องครบ 100%)</span>}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default AdminExamset;