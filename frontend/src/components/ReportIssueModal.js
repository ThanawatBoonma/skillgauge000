import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ISSUE_CATEGORIES = [
  { value: 'อุปกรณ์ชำรุด', label: '🛠️ อุปกรณ์ชำรุด / เครื่องมือไม่พร้อม' },
  { value: 'วัสดุไม่เพียงพอ', label: '🧱 วัสดุไม่เพียงพอ / ขาดแคลน' },
  { value: 'อุปสรรคหน้างาน', label: '🚧 อุปสรรคหน้างาน / สภาพแวดล้อม' },
  { value: 'ความปลอดภัย', label: '🦺 ความปลอดภัย / อุบัติเหตุ' },
  { value: 'ปัญหาอื่นๆ', label: '❓ ปัญหาอื่นๆ' },
];

const ReportIssueModal = ({ isOpen, onClose, task, user, onSuccess }) => {
  const [category, setCategory] = useState(ISSUE_CATEGORIES[0].value);
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State สำหรับควบคุมป๊อปอัปความสำเร็จ
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ล้างฟอร์มเวลาเปิดขึ้นมาใหม่
  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setPhotoFile(null);
      setPreviewUrl(null);
      setErrorMsg('');
      setCategory(ISSUE_CATEGORIES[0].value);
      setShowSuccessModal(false); // ซ่อนป๊อปอัปความสำเร็จเมื่อเปิดฟอร์มใหม่
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('กรุณากรอกรายละเอียดปัญหา');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const API = 'http://localhost:4000';
      const formData = new FormData();
      formData.append('worker_id', user?.id || user?.user_id || '');
      formData.append('category', category);
      formData.append('description', description.trim());

      // ⚠️ แมป task_id ให้ตรงกับตารางของคุณ (t_a_id)
      if (task) {
        formData.append('task_id', task.t_a_id || task.id || '');
      }

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      // ยิงไปที่ /api/issues 
      const res = await axios.post(`${API}/api/issues`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        // แทนที่ alert ด้วยการเปิด Modal ความสำเร็จ
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Submit issue error:', err);
      setErrorMsg(err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งรายงานปัญหา');
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันเมื่อกดปุ่ม "ตกลง" ในหน้าต่างความสำเร็จ
  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    if (onSuccess) onSuccess(); // รีเฟรชข้อมูลหน้าหลัก
    onClose(); // ปิดฟอร์มแจ้งปัญหา
  };

  return (
    <>
      {/* --- ป๊อปอัปแจ้งเตือนความสำเร็จ (จะซ้อนทับฟอร์มอีกที) --- */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 10001,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '12px', width: '350px',
            textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>✅</div>
            <h3 style={{ color: '#16a34a', margin: '0 0 10px' }}>รายงานปัญหาเรียบร้อย</h3>
            <p style={{ color: '#475569', fontSize: '15px', marginBottom: '25px' }}>ผู้คุมงานได้รับเรื่องของคุณแล้ว</p>
            <button
              onClick={handleSuccessOk}
              style={{
                background: '#16a34a', color: 'white', border: 'none', padding: '10px 20px',
                borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '15px'
              }}
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* --- ฟอร์มแจ้งปัญหาหลัก --- */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
        zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
      }}>
        <div style={{
          background: 'white', borderRadius: '16px', width: '100%', maxWidth: '520px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '20px 24px', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>⚠️ รายงานปัญหาที่พบระหว่างทำงาน</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.9 }}>แจ้งปัญหาหน้างานเพื่อให้หัวหน้างานเข้าช่วยเหลือ</p>
            </div>
            <button onClick={onClose} disabled={loading} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', cursor: 'pointer' }}>✕</button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
            {errorMsg && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>{errorMsg}</div>}

            {task && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>งานที่พบปัญหา</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{task.task_name || 'งานที่ได้รับมอบหมาย'}</div>
                {task.task_type && <div style={{ fontSize: '13px', color: '#475569' }}>ประเภท: {task.task_type}</div>}
              </div>
            )}

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>หมวดหมู่ปัญหา <span style={{ color: '#ef4444' }}>*</span></label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                {ISSUE_CATEGORIES.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>รายละเอียด <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>แนบรูปภาพ (ถ้ามี)</label>
              {previewUrl ? (
                <div style={{ position: 'relative', textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <img src={previewUrl} alt="Preview" style={{ maxHeight: '180px', borderRadius: '8px' }} />
                  <button type="button" onClick={handleRemovePhoto} style={{ position: 'absolute', top: '18px', right: '18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px' }}>✕</button>
                </div>
              ) : (
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', textAlign: 'center', background: '#f8fafc', position: 'relative' }}>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                  <div style={{ fontSize: '32px' }}>📷</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>คลิกแนบภาพปัญหา</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} disabled={loading} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer' }}>ยกเลิก</button>
              <button type="submit" disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: loading ? '#94a3b8' : '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'ส่งข้อมูล...' : '🚨 ยืนยันรายงาน'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReportIssueModal;