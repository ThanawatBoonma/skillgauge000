import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; // อย่าลืม import useNavigate
import '../Dashboard.css';
import './AdminQuizBank.css';
import { apiRequest } from '../../utils/api';
// Import Component Form
import AdminQuestionForm from './AdminQuestionForm';

const ITEMS_PER_PAGE = 10;

// ตัวเลือก 8 ช่าง
const CATEGORY_BUTTONS = [
  { value: 'structure', label: 'ช่างโครงสร้าง' },
  { value: 'electric', label: 'ช่างไฟฟ้า' },
  { value: 'plumbing', label: 'ช่างประปา' },
  { value: 'masonry', label: 'ช่างก่ออิฐฉาบปูน' },
  { value: 'aluminum', label: 'ช่างประตู-หน้าต่าง' },
  { value: 'ceiling', label: 'ช่างฝ้าเพดาน' },
  { value: 'roofing', label: 'ช่างหลังคา' },
  { value: 'tiling', label: 'ช่างกระเบื้อง' }
];

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'ทุกระดับ' },
  { value: 'easy', label: 'ระดับ 1 (ง่าย)' },
  { value: 'medium', label: 'ระดับ 2 (ปานกลาง)' },
  { value: 'hard', label: 'ระดับ 3 (ยาก)' }
];

const AdminQuizBank = () => {
  const navigate = useNavigate(); // เรียกใช้ Hook

  // --- STATE: Exam Settings ---
  const [currentLevel, setCurrentLevel] = useState('1'); 
  const [settingForm, setSettingForm] = useState({ passing_score: 60, question_count: 60, duration_minutes: 60 });
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const [isLoadingSetting, setIsLoadingSetting] = useState(false);

  // --- STATE: Question Table ---
  const [selectedCategory, setSelectedCategory] = useState('structure');
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // --- STATE: Modal ---
  const [modal, setModal] = useState({
    show: false,
    type: null, // 'add', 'edit', 'view'
    data: null
  });

  // ===================== SETTINGS LOGIC =====================
  const loadExamSetting = useCallback(async (level) => {
    setIsLoadingSetting(true);
    try {
      const data = await apiRequest(`/api/managequestion/setting/${level}`);
      if (data) setSettingForm({ passing_score: data.passing_score, question_count: data.question_count, duration_minutes: data.duration_minutes });
    } catch (err) { console.error(err); } 
    finally { setIsLoadingSetting(false); }
  }, []);

  useEffect(() => { loadExamSetting(currentLevel); }, [currentLevel, loadExamSetting]);

  const handleSaveSetting = async (e) => {
    e.preventDefault();
    setIsSavingSetting(true);
    try {
      await apiRequest('/api/managequestion/setting', { method: 'POST', body: { difficulty_level: currentLevel, ...settingForm } });
      Swal.fire({ icon: 'success', title: 'บันทึกเรียบร้อย', timer: 1500, showConfirmButton: false });
    } catch (err) { Swal.fire('ผิดพลาด', err.message, 'error'); } 
    finally { setIsSavingSetting(false); }
  };

  // ===================== QUESTION TABLE LOGIC =====================
  const loadQuestions = useCallback(async () => {
    setQuestionsLoading(true);
    try {
      const response = await apiRequest(`/api/managequestion/all?category=${selectedCategory}`);
      const items = Array.isArray(response) ? response : [];

      const mappedItems = items.map(item => ({
        id: item.id,
        text: item.question_text,
        category: selectedCategory,
        subcategory: item.skill_type,
        difficulty: String(item.difficulty_level) === '1' ? 'easy' : String(item.difficulty_level) === '2' ? 'medium' : 'hard',
        difficultyLabel: String(item.difficulty_level) === '1' ? 'ระดับ 1' : String(item.difficulty_level) === '2' ? 'ระดับ 2' : 'ระดับ 3',
        answer: item.answer,
        options: [
           { text: item.choice_a, isCorrect: item.answer === 'A' },
           { text: item.choice_b, isCorrect: item.answer === 'B' },
           { text: item.choice_c, isCorrect: item.answer === 'C' },
           { text: item.choice_d, isCorrect: item.answer === 'D' }
        ]
      }));
      setQuestions(mappedItems);
    } catch (error) { console.error(error); } 
    finally { setQuestionsLoading(false); }
  }, [selectedCategory]);

  useEffect(() => {
    loadQuestions();
    setCurrentPage(1);
  }, [loadQuestions]);

  const handleDelete = async (id) => {
    if (await Swal.fire({ title: 'ยืนยันการลบ?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'ลบเลย' }).then(res => res.isConfirmed)) {
      try {
        await apiRequest(`/api/managequestion/delete/${id}?category=${selectedCategory}`, { method: 'DELETE' });
        setQuestions(prev => prev.filter(q => q.id !== id));
        Swal.fire('ลบสำเร็จ', '', 'success');
      } catch (err) { Swal.fire('ผิดพลาด', err.message, 'error'); }
    }
  };

  // ===================== MODAL HANDLERS =====================
  const handleOpenAdd = () => setModal({ show: true, type: 'add', data: null });
  const handleOpenEdit = (q) => setModal({ show: true, type: 'edit', data: q });
  const handleOpenView = (q) => setModal({ show: true, type: 'view', data: q });
  const handleCloseModal = () => setModal({ show: false, type: null, data: null });
  
  const handleSuccess = () => {
    handleCloseModal();
    loadQuestions();
  };

  // Filter & Pagination
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) || (q.subcategory && q.subcategory.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
      return matchSearch && matchDiff;
    });
  }, [questions, searchTerm, filterDifficulty]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const actionBtnStyle = { 
    border: 'none', color: 'white', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' 
  };

  return (
    <div className="admin-quiz-bank">
      
      {modal.show && (
        <div className="modal-overlay">
           <div className="modal-container">
              <AdminQuestionForm 
                 initialData={modal.data}
                 category={selectedCategory}
                 onClose={handleCloseModal}
                 onSuccess={handleSuccess}
                 viewOnly={modal.type === 'view'}
              />
           </div>
        </div>
      )}

      <div className="quiz-content">
        <header className="quiz-header">
          <h2>จัดการโครงสร้างข้อสอบและคลังคำถาม</h2>
        </header>

        <div className="quiz-form-card">
          <h3>โครงสร้างข้อสอบ (Exam Settings)</h3>
          <form onSubmit={handleSaveSetting}>
            <div className="setting-grid-layout">
              <div className="setting-column left-col">
                <h4 className="col-header"><i className='bx bx-slider-alt'></i> การตั้งค่าทั่วไป</h4>
                {isLoadingSetting ? <div className="loading-setting">กำลังโหลด...</div> : (
                  <>
                    <div className="form-group">
                      <label>เกณฑ์ผ่าน (%)</label>
                      <input type="number" value={settingForm.passing_score} onChange={e => setSettingForm({...settingForm, passing_score: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>จำนวนข้อสอบ (ข้อ)</label>
                      <input type="number" value={settingForm.question_count} onChange={e => setSettingForm({...settingForm, question_count: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>เวลาทำข้อสอบ (นาที)</label>
                      <input type="number" value={settingForm.duration_minutes} onChange={e => setSettingForm({...settingForm, duration_minutes: e.target.value})} required />
                    </div>
                  </>
                )}
              </div>
              <div className="setting-column right-col">
                <h4 className="col-header"><i className='bx bx-layer'></i> เงื่อนไขความยากง่าย</h4>
                <div className="level-tabs">
                  {['1', '2', '3'].map(lvl => (
                    <button key={lvl} type="button" className={`level-tab-btn ${currentLevel === lvl ? 'active' : ''}`} onClick={() => setCurrentLevel(lvl)}>ระดับ {lvl}</button>
                  ))}
                </div>
                <div className="info-box">
                    <p><strong>ระดับ {currentLevel}</strong>: ค่าที่บันทึกจะใช้สำหรับพนักงานระดับนี้เท่านั้น</p>
                </div>
                <button type="submit" className="save-setting-btn" disabled={isSavingSetting}>{isSavingSetting ? 'กำลังบันทึก...' : 'บันทึกโครงสร้างข้อสอบ'}</button>
              </div>
            </div>
          </form>
        </div>

        <div className="quiz-form-card quiz-table-card">
          <div className="category-tabs-container">
            {CATEGORY_BUTTONS.map(cat => (
              <button key={cat.value} className={`category-pill ${selectedCategory === cat.value ? 'active' : ''}`} onClick={() => setSelectedCategory(cat.value)}>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="quiz-table-header" style={{ marginTop: '20px' }}>
            <h3>รายการข้อสอบ: {CATEGORY_BUTTONS.find(c => c.value === selectedCategory)?.label} ({filteredQuestions.length} ข้อ)</h3>
            <div className="quiz-table-action-box">
              <button className="pill secondary" onClick={loadQuestions}><i className='bx bx-refresh'></i> รีเฟรช</button>
               
               {/* --- ปุ่มจัดการโครงสร้างใหม่ --- */}
              <button 
                className="pill secondary" 
                onClick={() => navigate('/admin/exam-set', { 
                  state: { 
                    category: selectedCategory, // ส่งหมวดหมู่ที่เลือกปัจจุบัน (structure/electric...)
                    level: currentLevel         // ส่งระดับที่เลือกปัจจุบัน (1/2/3)
                  } 
                })}
                style={{ backgroundColor: '#f0f4f8', color: '#2c3e50', border: '1px solid #dce2e8' }}
              >
                <i className='bx bx-cog'></i> จัดการโครงสร้าง
              </button>
               {/* --------------------------- */}

              <button className="pill primary" onClick={handleOpenAdd}><i className='bx bx-plus'></i> เพิ่มข้อสอบใหม่</button>
            </div>
          </div>

          <div className="quiz-table-controls">
             <div className="search-box">
               <i className='bx bx-search'></i>
               <input type="text" placeholder="ค้นหาโจทย์ / ทักษะ..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             </div>
             <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)} className="filter-select">
                {DIFFICULTY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
             </select>
          </div>

          {questionsLoading ? <div className="empty-state">กำลังโหลดข้อมูล...</div> : (
            <div className="table-responsive">
              <table className="quiz-table">
                <thead>
                  <tr>
                    <th width="5%">ลำดับ</th>
                    <th width="15%">ทักษะ</th>
                    <th width="10%">ระดับ</th>
                    <th width="40%">โจทย์</th>
                    <th width="10%">เฉลย</th>
                    <th width="20%" className="text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQuestions.map((q, idx) => (
                    <tr key={q.id}>
                      <td>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                      <td><span className="badge category-badge">{q.subcategory || '-'}</span></td>
                      <td><span className={`badge difficulty-${q.difficulty}`}>{q.difficultyLabel}</span></td>
                      <td className="text-left" style={{maxWidth: '300px'}}>{q.text}</td>
                      <td className="text-center"><strong>{q.answer}</strong></td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'center' }}>
                          <button onClick={() => handleOpenView(q)} style={{...actionBtnStyle, background: '#3498db'}} title="ดูรายละเอียด">
                             👁️ ดู
                          </button>
                          <button onClick={() => handleOpenEdit(q)} style={{...actionBtnStyle, background: '#f1c40f', color: '#333'}} title="แก้ไข">
                             ✏️ แก้ไข
                          </button>
                          <button onClick={() => handleDelete(q.id)} style={{...actionBtnStyle, background: '#e74c3c'}} title="ลบ">
                             🗑️ ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedQuestions.length === 0 && <tr><td colSpan="6" className="table-empty">ไม่พบข้อมูล</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
             <div className="pagination-controls">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>&lt; ก่อนหน้า</button>
                <span>หน้า {currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>ถัดไป &gt;</button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQuizBank;