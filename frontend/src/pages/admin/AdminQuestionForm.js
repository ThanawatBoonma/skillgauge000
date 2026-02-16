import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { apiRequest } from '../../utils/api';
import './AdminQuestionForm.css';

const CATEGORY_OPTIONS = [
  { value: 'structure', label: '1.โครงสร้าง' },
  { value: 'plumbing', label: '2.ประปา' },
  { value: 'roofing', label: '3.หลังคา' },
  { value: 'masonry', label: '4.ก่ออิฐฉาบปูน' },
  { value: 'aluminum', label: '5.ประตูหน้าต่างอลูมิเนียม' },
  { value: 'ceiling', label: '6.ฝ้าเพดาล' },
  { value: 'electric', label: '7.ไฟฟ้า' },
  { value: 'tiling', label: '8.กระเบื้อง' }
];

// ✅ ตัวเลือกทักษะย่อยตาม ENUM ที่กำหนด
const SKILL_TYPE_OPTIONS = [
  'งานเหล็กเสริม',
  'งานคอนกรีต',
  'งานไม้แบบ',
  'องค์อาคาร',
  'การออกแบบ/ทฤษฎี'
];

const DIFFICULTY_OPTIONS = [
  { value: '1', label: 'ระดับ 1 (ง่าย)' },
  { value: '2', label: 'ระดับ 2 (ปานกลาง)' },
  { value: '3', label: 'ระดับ 3 (ยาก)' }
];

const AdminQuestionForm = ({ 
  initialData,       
  category,          
  onClose,           
  onSuccess,         
  viewOnly = false   
}) => {
  
  const [form, setForm] = useState({
    text: '',
    difficulty: '1',
    subcategory: '', // skill_type
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        text: initialData.text || '',
        difficulty: initialData.difficulty === 'easy' ? '1' : initialData.difficulty === 'medium' ? '2' : '3',
        subcategory: initialData.subcategory || '',
        options: initialData.options || [
          { text: '', isCorrect: true }, { text: '', isCorrect: false },
          { text: '', isCorrect: false }, { text: '', isCorrect: false }
        ]
      });
    } else {
      setForm(prev => ({ ...prev, options: [
        { text: '', isCorrect: true }, { text: '', isCorrect: false },
        { text: '', isCorrect: false }, { text: '', isCorrect: false }
      ]}));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index].text = value;
    setForm(prev => ({ ...prev, options: newOptions }));
  };

  const setCorrectOption = (index) => {
    if (viewOnly) return;
    const newOptions = form.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setForm(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (viewOnly) return;
    
    if (!form.text.trim()) return Swal.fire('แจ้งเตือน', 'กรุณากรอกโจทย์', 'warning');
    if (!form.subcategory) return Swal.fire('แจ้งเตือน', 'กรุณาเลือกทักษะย่อย', 'warning'); // เพิ่มเช็คทักษะย่อย
    if (form.options.some(o => !o.text.trim())) return Swal.fire('แจ้งเตือน', 'กรุณากรอกตัวเลือกให้ครบ', 'warning');

    setSaving(true);
    try {
      const correctIndex = form.options.findIndex(o => o.isCorrect);
      const answerVal = ['A', 'B', 'C', 'D'][correctIndex]; 

      const payload = {
        question_text: form.text,
        skill_type: form.subcategory, 
        category: category,           
        difficulty_level: parseInt(form.difficulty),
        choice_a: form.options[0].text,
        choice_b: form.options[1].text,
        choice_c: form.options[2].text,
        choice_d: form.options[3].text,
        answer: answerVal
      };

      if (initialData?.id) {
        await apiRequest(`/api/managequestion/update/${initialData.id}`, {
          method: 'PUT',
          body: payload
        });
        Swal.fire('สำเร็จ', 'แก้ไขข้อมูลเรียบร้อย', 'success');
      } else {
        await apiRequest('/api/managequestion/add', {
          method: 'POST',
          body: [payload] 
        });
        Swal.fire('สำเร็จ', 'เพิ่มข้อสอบเรียบร้อย', 'success');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message || 'บันทึกไม่สำเร็จ', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="aqf-modal-content">
      <div className="aqf-header-modal">
        <h3>{viewOnly ? 'รายละเอียดข้อสอบ' : (initialData ? 'แก้ไขข้อสอบ' : 'เพิ่มข้อสอบใหม่')}</h3>
        <button type="button" onClick={onClose} className="btn-close-x">×</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
           <div>
             <label>หมวดหมู่ช่าง</label>
             <input 
               type="text" 
               value={CATEGORY_OPTIONS.find(c => c.value === category)?.label || category} 
               disabled 
               className="input-modal disabled"
             />
           </div>
           <div>
             <label>ระดับความยาก</label>
             <select 
               name="difficulty" 
               value={form.difficulty} 
               onChange={handleChange}
               disabled={viewOnly}
               className="input-modal"
             >
               {DIFFICULTY_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
             </select>
           </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>ทักษะย่อย (Skill Type)</label>
          {/* ✅ เปลี่ยนเป็น Dropdown และใช้ SKILL_TYPE_OPTIONS */}
          <select 
             name="subcategory"
             value={form.subcategory} 
             onChange={handleChange}
             disabled={viewOnly}
             className="input-modal"
             required
           >
             <option value="">-- เลือกทักษะย่อย --</option>
             {SKILL_TYPE_OPTIONS.map((skill, idx) => (
               <option key={idx} value={skill}>{skill}</option>
             ))}
           </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>โจทย์คำถาม</label>
          <textarea 
            name="text" 
            value={form.text} 
            onChange={handleChange} 
            disabled={viewOnly}
            rows="3" 
            className="input-modal"
            placeholder="กรอกคำถาม..."
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>ตัวเลือก (เลือกข้อที่ถูก)</label>
          {form.options.map((opt, idx) => (
            <div key={idx} className={`option-row-modal ${opt.isCorrect ? 'correct' : ''}`}>
               <input 
                 type="radio" 
                 name="correct" 
                 checked={opt.isCorrect} 
                 onChange={() => setCorrectOption(idx)}
                 disabled={viewOnly}
               />
               <span style={{ width: '25px', fontWeight: 'bold' }}>{['A','B','C','D'][idx]}.</span>
               <input 
                 type="text" 
                 value={opt.text} 
                 onChange={e => handleOptionChange(idx, e.target.value)} 
                 disabled={viewOnly}
                 placeholder={`ตัวเลือก ${['ก','ข','ค','ง'][idx]}`}
                 className="input-option"
                 required
               />
            </div>
          ))}
        </div>

        <div className="aqf-actions-modal">
           <button type="button" onClick={onClose} className="btn-secondary">ปิด</button>
           {!viewOnly && (
             <button type="submit" disabled={saving} className="btn-primary">
               {saving ? 'กำลังบันทึก...' : 'บันทึก'}
             </button>
           )}
        </div>
      </form>
    </div>
  );
};

export default AdminQuestionForm;