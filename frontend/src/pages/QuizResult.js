// QuizResult.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const levelLabel = (level) => {
  if (level === 3) return 'ระดับ 3 (ชำนาญ)';
  if (level === 2) return 'ระดับ 2 (ปานกลาง)';
  if (level === 1) return 'ระดับ 1 (พื้นฐาน)';
  return 'ไม่ทราบระดับ';
};

const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>ไม่พบผลการสอบ</p>
        <button onClick={() => navigate(-1)}>กลับ</button>
      </div>
    );
  }

  return (
    <div className="dash-layout" style={{ padding: '2rem' }}>
      <h1>ผลการสอบ</h1>
      <div style={{ marginTop: '1rem', maxWidth: 720 }}>
        <p><strong>ถูก:</strong> {result.correct} / {result.total}</p>
        <p><strong>คะแนน:</strong> {result.scorePercent}%</p>
        <p><strong>ระดับ:</strong> {levelLabel(result.level)} (level {result.level})</p>

        <div style={{ marginTop: '1.5rem' }}>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>กลับสู่หน้าหลัก</button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;