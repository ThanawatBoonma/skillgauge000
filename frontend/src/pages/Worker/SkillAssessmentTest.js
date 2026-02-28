import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../pm/WKDashboard.css';

const SkillAssessmentTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ รับ Level ที่ต้องสอบจาก Dashboard (ถ้าไม่มี Default เป็น 1)
  const targetLevel = location.state?.targetLevel || 1;

  // State หลัก
  const [step, setStep] = useState('intro'); 
  const [questions, setQuestions] = useState([]); 
  
  // Config เริ่มต้น: 30 ข้อ
  const [examConfig, setExamConfig] = useState({ 
      duration_minutes: 60, 
      total_questions: 30, 
      cat_rebar_percent: 20, cat_concrete_percent: 20, cat_formwork_percent: 20,
      cat_element_percent: 20, cat_theory_percent: 20,
      level_1_percent: 100, level_2_percent: 0, level_3_percent: 0 
  }); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); 
  
  const [warningModal, setWarningModal] = useState({ show: false, message: '' }); 
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [scoreResult, setScoreResult] = useState(null);

  const timerRef = useRef(null); 
  const questionsPerPage = 15; 

  // --- Logic การดึงข้อมูล ---
  useEffect(() => {
    const fetchExamData = async () => {
        setLoading(true);
        try {
          const API = 'http://localhost:4000'; 
          const token = localStorage.getItem('token');
          
          // ✅ ส่ง level ที่ถูกต้องไปขอข้อสอบ
          const res = await axios.get(`${API}/api/skillAssessment/test?level=${targetLevel}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.data) {
            if (res.data.questions) {
                const transformedQuestions = res.data.questions.map(q => ({
                    id: q.id,
                    text: q.question_text,
                    choices: [q.choice_a, q.choice_b, q.choice_c, q.choice_d]
                }));
                setQuestions(transformedQuestions);
            }
            if (res.data.exam_config) {
                setExamConfig(res.data.exam_config);
                setTimeLeft(res.data.exam_config.duration_minutes * 60);
            }
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("ไม่สามารถดึงข้อมูลข้อสอบได้");
        } finally {
          setLoading(false);
        }
    };
    fetchExamData();
  }, [targetLevel]);

  // --- Timer Logic ---
  useEffect(() => {
    if (step === 'test' && timeLeft > 0) {
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleTimeoutSubmit(); 
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]); 

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (qId, choiceIndex) => {
    setAnswers(prev => ({ ...prev, [qId]: choiceIndex }));
  };

  const showWarning = (msg) => {
    setWarningModal({ show: true, message: msg });
  };

  // --- Navigation ---
  const jumpToQuestion = (qId) => {
    const qIndex = questions.findIndex(q => q.id === qId);
    const targetPage = Math.ceil((qIndex + 1) / questionsPerPage);

    if (targetPage <= currentPage) {
        setCurrentPage(targetPage);
        scrollToQuestion(qId);
        return;
    }

    const indexOfLastQ = currentPage * questionsPerPage;
    const indexOfFirstQ = indexOfLastQ - questionsPerPage;
    const currentQIds = questions.slice(indexOfFirstQ, indexOfLastQ).map(q => q.id);
    const unanswered = currentQIds.filter(id => answers[id] === undefined);

    if (unanswered.length > 0) {
        showWarning(`กรุณาทำข้อสอบในหน้านี้ให้ครบทุกข้อก่อน (${unanswered.length} ข้อที่เหลือ)`);
        return;
    }
    if (targetPage > currentPage + 1) {
        showWarning(`กรุณาทำข้อสอบเรียงตามลำดับหน้า`);
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

  const handleNextPage = () => {
    const indexOfLastQ = currentPage * questionsPerPage;
    const indexOfFirstQ = indexOfLastQ - questionsPerPage;
    const currentQIds = questions.slice(indexOfFirstQ, indexOfLastQ).map(q => q.id);
    const unanswered = currentQIds.filter(id => answers[id] === undefined);

    if (unanswered.length > 0) {
        showWarning(`กรุณาทำข้อสอบในหน้านี้ให้ครบทุกข้อก่อน (${unanswered.length} ข้อที่เหลือ)`);
        return;
    }
    setCurrentPage(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleTimeoutSubmit = async () => {
    showWarning("หมดเวลาสอบ! ระบบจะส่งคำตอบของคุณโดยอัตโนมัติ");
    await submitToBackend();
  };

  const handlePreSubmit = () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
        showWarning(`คุณยังทำข้อสอบไม่ครบ ${unansweredCount} ข้อ`);
        return;
    }
    setShowConfirmModal(true);
  };

  const submitToBackend = async () => {
    setShowConfirmModal(false);
    try {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        const token = localStorage.getItem('token');
        const choiceMap = ['A', 'B', 'C', 'D'];
        const formattedAnswers = {};
        Object.keys(answers).forEach(qId => {
            formattedAnswers[qId] = choiceMap[answers[qId]];
        });

        const API = 'http://localhost:4000';
        const res = await axios.post(`${API}/api/skillAssessment/submit`, {
            user_id: user.id,
            answers: formattedAnswers,
            level: targetLevel // ส่ง Level ที่สอบกลับไปบอก Backend
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("👉 ข้อมูลดิบที่ได้จาก Backend คือ:", res.data);

        setScoreResult({
            correct: res.data.correct,
            total: res.data.total
        });

        setStep('review'); 
        window.scrollTo(0, 0);
    } catch (err) {
        console.error("Error submitting:", err);
        showWarning("เกิดข้อผิดพลาดในการส่งคำตอบ");
    }
  };

  // --- Styles ---
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
  const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' };
  const btnStyle = { padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '16px', margin: '0 10px' };

  // --- Step 1: Intro ---
  if (step === 'intro') {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f6f9', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ background: 'white', maxWidth: '800px', width: '100%', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderTop: '5px solid #2c3e50' }}>
          
          <h2 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            📝 ข้อตกลงและเงื่อนไขการสอบ (Level {targetLevel})
          </h2>
          
          <div style={{ marginBottom: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#34495e', fontSize: '18px' }}>เงื่อนไขการสอบ</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#555', lineHeight: '1.8' }}>
              <li>เวลาในการทำข้อสอบ: <strong>{examConfig.duration_minutes} นาที</strong></li>
              <li>จำนวนข้อสอบ: <strong>{examConfig.total_questions} ข้อ</strong> (ทำทีละหน้า)</li>
              <li>ต้องทำครบทุกข้อในหน้าปัจจุบันจึงจะเปลี่ยนหน้าได้</li>
              <li>เมื่อหมดเวลา ระบบจะส่งคำตอบอัตโนมัติ (ข้อที่ทำไม่ทันจะได้ 0 คะแนน)</li>
            </ul>
          </div>

          <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '18px', color: '#34495e', marginBottom: '10px' }}>โครงสร้างเนื้อหา (โดยประมาณ)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f1f2f6', color: '#555' }}>
                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>หัวข้อการประเมิน</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>1. งานเหล็กเสริม (Rebar)</td></tr>
                        <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>2. งานคอนกรีต (Concrete)</td></tr>
                        <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>3. งานไม้แบบ (Formwork)</td></tr>
                        <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>4. องค์อาคาร (คาน/เสา/ฐานราก)</td></tr>
                        <tr><td style={{ padding: '10px', border: '1px solid #ddd' }}>5. การออกแบบ/ทฤษฎี</td></tr>
                    </tbody>
                </table>
              </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/worker')} style={{ padding: '12px 30px', background: 'white', border: '1px solid #ccc', borderRadius: '30px', cursor: 'pointer', color: '#7f8c8d', fontWeight: 'bold' }}>ยกเลิก</button>
            <button onClick={() => setStep('test')} style={{ padding: '12px 50px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)' }}>เริ่มทำข้อสอบ</button>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 3: Review ---
if (step === 'review') {
    return (
       <div style={{ minHeight: '100vh', background: '#f4f6f9', display:'flex', justifyContent:'center', alignItems:'center', padding: '20px', fontFamily: 'sans-serif' }}>
          <div style={{ background: 'white', maxWidth: '600px', width: '100%', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' }}>
             
             <h2 style={{ color: '#27ae60', margin: '0 0 15px 0' }}>ส่งคำตอบเรียบร้อยแล้ว</h2>
             
             {/* ✅ เพิ่มกล่องแสดงคะแนนที่นี่ */}
             {scoreResult && (
                 <div style={{ margin: '25px auto', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '300px' }}>
                     <div style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px', fontWeight: 'bold' }}>คะแนนที่ได้</div>
                     <div style={{ fontSize: '42px', fontWeight: '900', color: '#1e293b' }}>
                         <span style={{ color: '#22c55e' }}>{scoreResult.correct}</span> 
                         <span style={{ fontSize: '24px', color: '#94a3b8', margin: '0 5px' }}>/</span> 
                         <span style={{ fontSize: '28px' }}>{scoreResult.total}</span>
                     </div>
                 </div>
             )}

             <p style={{ fontSize: '18px', color: '#555', margin: '10px 0' }}>ระบบได้บันทึกคะแนนของคุณแล้ว</p>
             <div style={{ marginTop: '40px' }}>
                <button onClick={() => navigate('/worker')} style={{ padding: '12px 40px', background: '#3498db', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>กลับหน้าหลัก</button>
             </div>
          </div>
       </div>
    );
  }

  // --- Step 2: Test ---
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>กำลังโหลดข้อสอบ...</div>;
  if (error) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;

  const indexOfLastQ = currentPage * questionsPerPage;
  const indexOfFirstQ = indexOfLastQ - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQ, indexOfLastQ);
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const timerColor = timeLeft < 300 ? '#e74c3c' : '#2c3e50';

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', position: 'relative' }}>
       
       {/* === MODALS === */}
       {warningModal.show && (
         <div style={modalOverlayStyle}>
           <div style={modalContentStyle}>
             <h3 style={{ margin: '0 0 15px 0', color: '#e74c3c' }}>แจ้งเตือน</h3>
             <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>{warningModal.message}</p>
             <button onClick={() => setWarningModal({ show: false, message: '' })} style={{ ...btnStyle, background: '#3498db', color: 'white' }}>ตกลง</button>
           </div>
         </div>
       )}

       {showConfirmModal && (
         <div style={modalOverlayStyle}>
           <div style={modalContentStyle}>
             <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>ยืนยันการส่งคำตอบ?</h3>
             <p style={{ fontSize: '14px', color: '#777', marginBottom: '20px' }}>เมื่อส่งแล้วจะไม่สามารถแก้ไขได้อีก</p>
             <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => setShowConfirmModal(false)} style={{ ...btnStyle, background: '#95a5a6', color: 'white' }}>ยกเลิก</button>
                <button onClick={submitToBackend} style={{ ...btnStyle, background: '#27ae60', color: 'white' }}>ยืนยัน</button>
             </div>
           </div>
         </div>
       )}

       <header style={{ background: '#fff', height: '70px', padding: '0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>แบบทดสอบวัดทักษะ (Level {targetLevel})</h3>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: timerColor, background: '#f8f9fa', padding: '8px 20px', borderRadius: '30px', border: `1px solid ${timerColor}`, minWidth: '120px', textAlign: 'center' }}>
                {formatTime(timeLeft)}
            </div>
            <span style={{ fontSize: '14px', background: '#e3f2fd', color: '#1565c0', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
                หน้า {currentPage} / {totalPages}
            </span>
       </header>

       <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', display: 'flex', gap: '30px', alignItems: 'flex-start', width: '100%', boxSizing: 'border-box' }}>
            
            {/* Main Question Area */}
            <div style={{ flex: 1 }}>
                {currentQuestions.map((q, index) => {
                    const displayNum = indexOfFirstQ + index + 1;
                    return (
                        <div key={q.id} id={`q-${q.id}`} style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '20px', color: '#2c3e50', fontSize: '18px', lineHeight: '1.6' }}>
                                <span style={{color: '#3498db', marginRight: '10px'}}>{displayNum}.</span> 
                                {q.text}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {q.choices.map((choice, cIdx) => (
                                    <label key={cIdx} style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', border: answers[q.id] === cIdx ? '2px solid #3498db' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', background: answers[q.id] === cIdx ? '#f0f9ff' : 'white', transition: 'all 0.2s' }}>
                                        <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === cIdx} onChange={() => handleAnswer(q.id, cIdx)} style={{ marginRight: '15px', width: '18px', height: '18px', accentColor: '#3498db' }} />
                                        <span style={{ color: answers[q.id] === cIdx ? '#2980b9' : '#555', fontSize: '16px' }}>{choice}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
                
                {/* Footer Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', marginBottom: '60px' }}>
                    <button disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0,0); }} style={{ padding: '12px 30px', background: currentPage === 1 ? '#eee' : 'white', color: currentPage === 1 ? '#aaa' : '#555', border: '1px solid #ccc', borderRadius: '30px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>&lt; ย้อนกลับ</button>
                    {currentPage < totalPages ? (
                         <button onClick={handleNextPage} style={{ padding: '12px 40px', background: '#3498db', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(52, 152, 219, 0.3)' }}>ถัดไป &gt;</button>
                    ) : (
                         <button onClick={handlePreSubmit} style={{ padding: '12px 50px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)' }}>ส่งคำตอบ</button>
                    )}
                </div>
            </div>

            {/* Sidebar Navigator (ขวามือ) */}
            <div style={{ width: '300px', background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', position: 'sticky', top: '100px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                <h4 style={{ margin: '0 0 20px 0', color: '#2c3e50', borderBottom: '2px solid #f1f2f6', paddingBottom: '10px' }}>📌 ทางลัดข้อสอบ</h4>
                <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}><div style={{width:'14px', height:'14px', background:'white', border:'1px solid #ddd', borderRadius:'3px'}}></div> <span>ยังไม่ทำ</span></div>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}><div style={{width:'14px', height:'14px', background:'#eafaf1', border:'1px solid #2ecc71', borderRadius:'3px'}}></div> <span>ทำแล้ว</span></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    {questions.map((q, index) => {
                        const isAnswered = answers[q.id] !== undefined;
                        const pageOfQ = Math.ceil((index + 1) / questionsPerPage);
                        const isCurrentPage = pageOfQ === currentPage;
                        return (
                            <button key={q.id} onClick={() => jumpToQuestion(q.id)} style={{ width: '100%', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isCurrentPage ? '2px solid #3498db' : (isAnswered ? '1px solid #2ecc71' : '1px solid #ddd'), borderRadius: '6px', background: isAnswered ? '#eafaf1' : 'white', color: isAnswered ? '#27ae60' : '#555', fontSize: '14px', fontWeight: isCurrentPage ? 'bold' : 'normal', cursor: 'pointer', transition: 'all 0.2s' }}>{index + 1}</button>
                        )
                    })}
                </div>
                <div style={{ marginTop: '20px', fontSize: '14px', textAlign: 'center', color: '#666', background: '#f8f9fa', padding: '10px', borderRadius: '8px' }}>
                    ทำไปแล้ว <strong style={{color: '#27ae60'}}>{Object.keys(answers).length}</strong> / {questions.length} ข้อ
                </div>
            </div>
       </main>
    </div>
  );
};

export default SkillAssessmentTest;