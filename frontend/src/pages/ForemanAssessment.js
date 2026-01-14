import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// หัวข้อการประเมิน (มาตรฐาน)
const ONSITE_CRITERIA = [
  { id: "readiness", title: "A. ความเข้าใจงานและความพร้อม", questions: ["1. ความเข้าใจในแบบและคำสั่งงาน", "2. การเตรียมเครื่องมือและวัสดุ", "3. การคำนวณและการวัดระยะ"] },
  { id: "quality", title: "B. คุณภาพของงาน", questions: ["4. ความถูกต้องของขนาดและตำแหน่ง", "5. ความแข็งแรงและมาตรฐานงาน", "6. ความเรียบร้อยและการเก็บงาน"] },
  { id: "safety", title: "C. ความปลอดภัยและวินัย", questions: ["7. การปฏิบัติตามกฎความปลอดภัย (PPE)", "8. การรักษาความสะอาดพื้นที่งาน", "9. วินัยและการตรงต่อเวลา"] }
];

const ForemanAssessment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [scores, setScores] = useState({});
  const [workerName, setWorkerName] = useState("");
  const [skillType, setSkillType] = useState("-");

  // รับข้อมูลช่างที่ส่งมาจาก Dashboard
  useEffect(() => {
    if (location.state && location.state.workerData) {
      const { name, roleName } = location.state.workerData;
      setWorkerName(name);
      setSkillType(roleName);
    } else {
        alert("กรุณาเลือกรายชื่อจากหน้า Dashboard");
        navigate('/foreman');
    }
  }, [location, navigate]);

  const handleScoreChange = (category, index, value) => {
    setScores(prev => ({
      ...prev,
      [`${category}_${index}`]: parseInt(value)
    }));
  };

  const handleSubmit = () => {
    // ตรวจสอบว่ากรอกครบไหม
    let totalQuestions = 0;
    ONSITE_CRITERIA.forEach(c => totalQuestions += c.questions.length);
    
    if (Object.keys(scores).length < totalQuestions) {
      alert(`กรุณาประเมินให้ครบทุกหัวข้อ (${Object.keys(scores).length}/${totalQuestions})`);
      return;
    }

    // คำนวณคะแนนรวม
    let totalScore = 0;
    ONSITE_CRITERIA.forEach(cat => {
      cat.questions.forEach((_, idx) => {
        totalScore += scores[`${cat.id}_${idx}`] || 0;
      });
    });

    // ยิง API บันทึกผล (Mockup)
    console.log("Submitting assessment for:", workerName, "Score:", totalScore);
    
    alert(`บันทึกการประเมินเสร็จสิ้น\nพนักงาน: ${workerName}\nคะแนนรวม: ${totalScore}`);
    navigate('/foreman');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "sans-serif", backgroundColor: '#f4f6f9' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '250px', background: '#2c3e50', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' }}>SKILL GAUGE</div>
        <nav>
          <button onClick={() => navigate('/foreman')} style={{ width: '100%', padding: '12px 15px', background: 'transparent', color: '#bdc3c7', border: 'none', textAlign: 'left', cursor: 'pointer' }}>&lt; กลับสู่หน้าหลัก</button>
        </nav>
      </aside>

      {/* Main Form */}
      <main style={{ flex: 1, padding: '30px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <h2 style={{ color: '#2c3e50', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            แบบประเมินผลการปฏิบัติงานหน้างาน
          </h2>

          {/* ข้อมูลพนักงาน */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '30px', display: 'flex', gap: '40px' }}>
            <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>ชื่อ-นามสกุล ผู้ถูกประเมิน</label>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>{workerName}</div>
            </div>
            <div>
                <label style={{ fontSize: '12px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>ตำแหน่ง/ทักษะ</label>
                <div style={{ fontSize: '18px', color: '#333' }}>{skillType}</div>
            </div>
          </div>

          {/* ตารางคะแนน */}
          {ONSITE_CRITERIA.map((cat) => (
            <div key={cat.id} style={{ background: 'white', padding: '25px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#34495e', fontSize: '16px', background: '#f8f9fa', padding: '10px', borderLeft: '4px solid #3498db' }}>
                {cat.title}
              </h3>
              
              {cat.questions.map((q, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px dashed #eee' }}>
                  <div style={{ flex: 1, color: '#555', fontSize: '14px' }}>{q}</div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4].map(score => (
                      <label key={score} 
                        style={{ 
                            width: '40px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            border: '1px solid #ccc', cursor: 'pointer', fontSize: '14px',
                            background: scores[`${cat.id}_${idx}`] === score ? '#3498db' : 'white',
                            color: scores[`${cat.id}_${idx}`] === score ? 'white' : '#666',
                            fontWeight: scores[`${cat.id}_${idx}`] === score ? 'bold' : 'normal'
                        }}
                      >
                        <input 
                            type="radio" 
                            name={`${cat.id}_${idx}`} 
                            value={score} 
                            onChange={(e) => handleScoreChange(cat.id, idx, e.target.value)} 
                            style={{display:'none'}} 
                        />
                        {score}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* ปุ่ม Submit */}
          <div style={{ marginTop: '30px', textAlign: 'right' }}>
            <button onClick={() => navigate('/foreman')} style={{ padding: '10px 25px', background: 'white', border: '1px solid #ccc', color: '#555', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>ยกเลิก</button>
            <button onClick={handleSubmit} style={{ padding: '10px 25px', background: '#27ae60', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>บันทึกผลการประเมิน</button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ForemanAssessment;