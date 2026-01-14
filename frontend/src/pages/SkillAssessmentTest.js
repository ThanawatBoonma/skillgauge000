import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import { API_BASE_URL } from '../utils/api'; // ถ้ายังไม่มีไฟล์นี้ ให้ใช้ fallback ด้านล่าง

const SkillAssessmentTest = () => {
  const navigate = useNavigate();
  
  // State
  const [step, setStep] = useState('intro'); // intro, test, review
  const [questions, setQuestions] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState({}); // เก็บ { questionId: index } (0,1,2,3)
  const [examResult, setExamResult] = useState(null); // เก็บผลคะแนนที่ได้จาก Backend

  const questionsPerPage = 15; 

  // ตารางเกณฑ์คะแนน (UI)
  const assessmentCriteria = [
    { topic: "1. งานเหล็กเสริม (Rebar)", weight: "25%" },
    { topic: "2. งานคอนกรีต (Concrete)", weight: "25%" },
    { topic: "3. งานไม้แบบ (Formwork)", weight: "20%" },
    { topic: "4. องค์อาคาร (คาน/เสา/ฐานราก)", weight: "20%" },
    { topic: "5. การออกแบบ/ทฤษฎี (Design Theory)", weight: "10%" },
  ];

  // --- 1. ดึงข้อสอบจาก API ---
  useEffect(() => {
    if (step === 'test') {
      const fetchQuestions = async () => {
        setLoading(true);
        try {
          const API = 'http://localhost:4000'; // Port 4000 ตาม Backend ของเรา
          const token = localStorage.getItem('token'); // ดึง Token
          
          const res = await axios.get(`${API}/api/skillAssessment/test`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.data && res.data.questions) {
            // แปลงข้อมูลจาก DB ให้เข้ากับ UI Component
            const transformedQuestions = res.data.questions.map(q => ({
              id: q.id,
              text: q.question_text,       // DB: question_text -> UI: text
              category: q.skill_type || 'ทั่วไป',
              choices: [q.choice_a, q.choice_b, q.choice_c, q.choice_d] // รวม Choice เป็น Array
            }));
            setQuestions(transformedQuestions);
          } else {
            setError("ไม่พบข้อมูลข้อสอบในระบบ");
          }
        } catch (err) {
          console.error("Error fetching questions:", err);
          setError("เกิดข้อผิดพลาดในการดึงข้อสอบ (กรุณาตรวจสอบการเชื่อมต่อ Server)");
        } finally {
          setLoading(false);
        }
      };
      
      fetchQuestions();
    }
  }, [step]);

  const handleAnswer = (qId, choiceIndex) => {
    setAnswers(prev => ({ ...prev, [qId]: choiceIndex }));
  };

  // --- Navigation Logic (Shortcut) ---
  const jumpToQuestion = (qId) => {
    // หา index ของข้อนั้นใน array เพื่อคำนวณหน้า
    const qIndex = questions.findIndex(q => q.id === qId);
    const targetPage = Math.ceil((qIndex + 1) / questionsPerPage);

    // ย้อนกลับหรืออยู่หน้าเดิม -> ไปได้เลย
    if (targetPage <= currentPage) {
        setCurrentPage(targetPage);
        scrollToQuestion(qId);
        return;
    }

    // จะไปหน้าใหม่ -> ต้องเช็คหน้าปัจจุบัน
    const indexOfLastQ = currentPage * questionsPerPage;
    const indexOfFirstQ = indexOfLastQ - questionsPerPage;
    const currentQIds = questions.slice(indexOfFirstQ, indexOfLastQ).map(q => q.id);
    const unanswered = currentQIds.filter(id => answers[id] === undefined);

    if (unanswered.length > 0) {
        alert(`ไม่สามารถข้ามได้!\nกรุณาทำข้อสอบในหน้านี้ให้ครบทุกข้อก่อน (${unanswered.length} ข้อที่เหลือ)`);
        return;
    }

    if (targetPage > currentPage + 1) {
        alert(`กรุณาทำข้อสอบเรียงตามลำดับหน้า`);
        return;
    }

    setCurrentPage(targetPage);
    scrollToQuestion(qId);
  };

  const scrollToQuestion = (qId) => {
    setTimeout(() => {
        const element = document.getElementById(`q-${qId}`);
        if(element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  // --- Pagination Logic ---
  const handleNextPage = () => {
    const indexOfLastQ = currentPage * questionsPerPage;
    const indexOfFirstQ = indexOfLastQ - questionsPerPage;
    const currentQIds = questions.slice(indexOfFirstQ, indexOfLastQ).map(q => q.id);
    const unanswered = currentQIds.filter(id => answers[id] === undefined);

    if (unanswered.length > 0) {
        alert(`กรุณาทำข้อสอบในหน้านี้ให้ครบทุกข้อก่อน (${unanswered.length} ข้อที่เหลือ)`);
        return;
    }
    setCurrentPage(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  // --- 2. ส่งคำตอบ (Submit) ---
  const handleSubmit = async () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
        alert(`คุณยังทำข้อสอบไม่ครบ ${unansweredCount} ข้อ`);
        return;
    }
    if (!window.confirm("ยืนยันการส่งคำตอบ?")) return;

    try {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        const token = localStorage.getItem('token');

        // แปลง Index (0-3) เป็น Choice (A-D) เพื่อส่ง Backend
        const choiceMap = ['A', 'B', 'C', 'D'];
        const formattedAnswers = {};
        Object.keys(answers).forEach(qId => {
            formattedAnswers[qId] = choiceMap[answers[qId]];
        });

        const API = 'http://localhost:4000';
        
        // ส่งคำตอบไปให้ Backend ตรวจ
        const res = await axios.post(`${API}/api/skillAssessment/submit`, {
            user_id: user.id, // ต้องมี user.id
            answers: formattedAnswers
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Backend จะส่งผลคะแนนกลับมา
        setExamResult(res.data); // { score, total, percentage, description }
        setStep('review'); 
        window.scrollTo(0, 0);

    } catch (err) {
        console.error("Error submitting exam:", err);
        alert("เกิดข้อผิดพลาดในการส่งคำตอบ");
    }
  };

  // --- Step 1: Intro ---
  if (step === 'intro') {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f6f9', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: 'white', maxWidth: '700px', width: '100%', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderTop: '5px solid #2c3e50' }}>
          <h2 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            ข้อตกลงและเงื่อนไขการสอบ
          </h2>
          
          <div style={{ marginBottom: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#34495e', fontSize: '18px' }}>เงื่อนไขการสอบ</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#555', lineHeight: '1.8' }}>
              <li>เวลาในการทำข้อสอบ: <strong>60 นาที</strong></li>
              <li>จำนวนข้อสอบ: <strong>60 ข้อ</strong> (ทำทีละหน้า)</li>
              <li>เกณฑ์การผ่าน: ต้องได้คะแนนรวมไม่ต่ำกว่า <strong>70%</strong></li>
              <li><strong>สำคัญ:</strong> ต้องทำครบทุกข้อในหน้าปัจจุบันจึงจะเปลี่ยนหน้าได้</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', color: '#34495e', marginBottom: '15px' }}>โครงสร้างคะแนน</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f1f2f6', color: '#555' }}>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>หัวข้อการประเมิน</th>
                  <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd', width: '100px' }}>น้ำหนัก</th>
                </tr>
              </thead>
              <tbody>
                {assessmentCriteria.map((c, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', color: '#333' }}>{c.topic}</td>
                    <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd', fontWeight: 'bold' }}>{c.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/worker')} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>ยกเลิก</button>
            <button onClick={() => setStep('test')} style={{ flex: 2, padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>เริ่มทำข้อสอบ</button>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 3: Review / Result ---
  if (step === 'review') {
    return (
       <div style={{ minHeight: '100vh', background: '#f4f6f9', padding: '50px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ background: 'white', maxWidth: '600px', margin: '0 auto', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
             <h2 style={{ color: '#27ae60', margin: '0 0 10px 0' }}>ส่งคำตอบเรียบร้อยแล้ว</h2>
             <div style={{ fontSize: '60px', margin: '20px 0' }}>🏆</div>
             
             {examResult ? (
                 <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ color: '#333' }}>ผลการทดสอบของคุณ</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50', margin: '10px 0' }}>
                        {examResult.score} / {examResult.total} คะแนน
                    </p>
                    <p style={{ fontSize: '18px', color: examResult.percentage >= 70 ? '#27ae60' : '#e74c3c' }}>
                        คิดเป็น {examResult.percentage}% ({examResult.percentage >= 70 ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'})
                    </p>
                 </div>
             ) : (
                 <p style={{ color: '#777', marginBottom: '30px' }}>ระบบได้บันทึกผลการสอบของคุณแล้ว</p>
             )}

             <button onClick={() => navigate('/worker')} style={{ padding: '12px 30px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>กลับหน้าหลัก</button>
          </div>
       </div>
    );
  }

  // --- Step 2: Test ---
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <div>กำลังดึงข้อสอบจากระบบ...</div>
    </div>
  );
  
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: '#e74c3c' }}>
        <h3>ข้อผิดพลาด</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/worker')} style={{ marginTop: '20px', padding: '10px 20px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>กลับหน้าหลัก</button>
    </div>
  );

  const indexOfLastQ = currentPage * questionsPerPage;
  const indexOfFirstQ = indexOfLastQ - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQ, indexOfLastQ);
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
       <header style={{ background: '#fff', height: '60px', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>แบบทดสอบวัดทักษะ</h3>
            <span style={{ fontSize: '14px', background: '#e3f2fd', color: '#1565c0', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                หน้า {currentPage} / {totalPages}
            </span>
       </header>

       <div style={{ maxWidth: '1100px', margin: '20px auto', width: '100%', padding: '0 20px', display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
            {/* Left: Questions */}
            <div style={{ flex: 1 }}>
                {currentQuestions.map((q, index) => {
                    const displayNum = indexOfFirstQ + index + 1;
                    return (
                        <div key={q.id} id={`q-${q.id}`} style={{ background: 'white', padding: '25px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <span style={{ background: '#eee', color: '#555', fontSize: '12px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>หมวด: {q.category}</span>
                            </div>
                            <div style={{ fontWeight: 'bold', marginBottom: '15px', color: '#333', fontSize: '16px', lineHeight: '1.5' }}>{displayNum}. {q.text}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {q.choices.map((choice, cIdx) => (
                                    <label key={cIdx} style={{ display: 'flex', alignItems: 'center', padding: '12px 15px', border: answers[q.id] === cIdx ? '1px solid #3498db' : '1px solid #eee', borderRadius: '6px', cursor: 'pointer', background: answers[q.id] === cIdx ? '#f0f9ff' : 'white', transition: 'all 0.2s' }}>
                                        <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === cIdx} onChange={() => handleAnswer(q.id, cIdx)} style={{ marginRight: '12px', accentColor: '#3498db' }} />
                                        <span style={{ color: answers[q.id] === cIdx ? '#2980b9' : '#555' }}>{choice}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', marginBottom: '60px' }}>
                    <button disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0,0); }} style={{ padding: '12px 25px', background: currentPage === 1 ? '#eee' : 'white', color: currentPage === 1 ? '#aaa' : '#555', border: '1px solid #ccc', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>&lt; ย้อนกลับ</button>
                    {currentPage < totalPages ? (
                         <button onClick={handleNextPage} style={{ padding: '12px 30px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(52, 152, 219, 0.2)' }}>ถัดไป &gt;</button>
                    ) : (
                         <button onClick={handleSubmit} style={{ padding: '12px 30px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(39, 174, 96, 0.2)' }}>ส่งคำตอบ</button>
                    )}
                </div>
            </div>

            {/* Right: Shortcut */}
            <div style={{ width: '280px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: '80px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#444', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>ทางลัดข้อสอบ</h4>
                
                <div style={{ marginBottom: '15px', fontSize: '13px', color: '#666', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                        <div style={{width:'12px', height:'12px', background:'white', border:'1px solid #ddd', borderRadius:'2px'}}></div> 
                        <span>ยังไม่ทำ</span>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                        <div style={{width:'12px', height:'12px', background:'#eafaf1', border:'1px solid #2ecc71', borderRadius:'2px'}}></div> 
                        <span>ทำแล้ว</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {questions.map((q, index) => {
                        const isAnswered = answers[q.id] !== undefined;
                        const pageOfQ = Math.ceil((index + 1) / questionsPerPage);
                        const isCurrentPage = pageOfQ === currentPage;
                        const displayNum = index + 1;

                        return (
                            <button 
                                key={q.id} 
                                onClick={() => jumpToQuestion(q.id)} 
                                style={{ 
                                    width: '100%', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    border: isCurrentPage ? '2px solid #3498db' : (isAnswered ? '1px solid #2ecc71' : '1px solid #ddd'), 
                                    borderRadius: '4px', 
                                    background: isAnswered ? '#eafaf1' : 'white', 
                                    color: isAnswered ? '#27ae60' : '#555', 
                                    fontSize: '12px', fontWeight: isCurrentPage ? 'bold' : 'normal', 
                                    cursor: 'pointer' 
                                }}
                            >
                                {displayNum}
                            </button>
                        )
                    })}
                </div>
                <div style={{ marginTop: '15px', fontSize: '12px', textAlign: 'center', color: '#666' }}>
                    ทำไปแล้ว {Object.keys(answers).length} / {questions.length} ข้อ
                </div>
            </div>
       </div>
    </div>
  );
};

export default SkillAssessmentTest;