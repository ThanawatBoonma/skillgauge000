// SkillAssessmentQuiz.js (replace your existing file)
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './SkillAssessmentQuiz.css';
import { mockUser } from '../mock/mockData';

const PER_PAGE = 20; // ตามที่ต้องการ: แสดงทีละ 20 ข้อ
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const clean = (s) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim() : s);

const SkillAssessmentQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navUser = location.state?.user;
  const user = navUser || { ...mockUser, role: 'worker' };

  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const set_no = 1;

  useEffect(() => {
    const abortController = new AbortController();
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        // include sessionId if we have one, otherwise backend will create one
        const params = new URLSearchParams({ set_no: set_no, page: page, per_page: PER_PAGE });
        if (sessionId) params.set('sessionId', sessionId);
        const url = `${API_BASE}/api/questions/structural?${params.toString()}`;
        const res = await fetch(url, { signal: abortController.signal });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Fetch error ${res.status} ${text}`);
        }
        const json = await res.json();
        // save sessionId if provided
        if (json.sessionId) setSessionId(json.sessionId);
        setTotal(json.total || 0);
        setTotalPages(json.totalPages || 1);

        // --- แก้ตรงนี้: แปลง id เป็น string และ normalize ข้อความ/choices ---
        const qs = (json.questions || []).map(q => ({
          ...q,
          id: String(q.id), // แปลงเป็น string เสมอ เพื่อให้การแม็ป answers ไม่ผิดชนิด
          question_no: q.question_no,
          text: clean(q.text),
          choices: (q.choices || []).map(c => clean(c))
        }));
        setQuestions(qs);
      } catch (err) {
        if (abortController.signal.aborted) return;
        console.error('Failed to load questions', err);
        setError('ไม่สามารถโหลดคำถามได้');
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };
    fetchQuestions();
    return () => abortController.abort();
  }, [page, sessionId]);

  const isLastPage = page >= totalPages;
  const answeredCount = Object.keys(answers).length;
  const percent = total ? Math.round((answeredCount / total) * 100) : 0;

  // --- แก้ toggleChoice ให้เก็บ string เสมอ ---
  const toggleChoice = (qid, choiceIndex) => {
    const key = String(qid);
    const val = String(choiceIndex);
    setAnswers(prev => {
      const cur = prev[key];
      if (cur === val) {
        const { [key]: _omit, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: val };
    });
  };

  const goPrevPage = () => setPage(p => Math.max(1, p - 1));
  const goNextPageOrSubmit = async () => {
    if (!isLastPage) {
      setPage(p => Math.min(totalPages, p + 1));
      return;
    }

    try {
      if (!sessionId) throw new Error('sessionId missing');
      // Note: answers are strings of indices ("0","1","2","3")
      const payload = { sessionId, answers, user_id: user?.id || null };
      const res = await fetch(`${API_BASE}/api/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Submit failed ${res.status}`);
      }
      const result = await res.json();
      // navigate to result page and pass result
      navigate('/quiz-result', { state: { result } });
    } catch (err) {
      console.error('Submit error', err);
      alert('เกิดข้อผิดพลาดในการส่งคำตอบ: ' + err.message);
    }
  };

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <nav className="menu">
          <button type="button" className="menu-item" onClick={() => navigate('/dashboard', { state: { user } })}>Tasks</button>
          <button type="button" className="menu-item active">Skill Assessment Test</button>
          <button type="button" className="menu-item">Submit work</button>
          <button type="button" className="menu-item">Settings</button>
        </nav>
      </aside>

      <main className="dash-main">
        <div className="dash-topbar">
          <div className="role-pill">{user?.role ? user.role.charAt(0).toUpperCase()+user.role.slice(1) : 'Worker'}</div>
          <div className="top-actions">
            <span className="profile">
              <span className="avatar" />
              {user?.phone && (
                <span className="phone" style={{ marginLeft: '2rem' }}>{user.phone}</span>
              )}
            </span>
          </div>
        </div>

        <div className="quiz-page">
          <div className="progress">
            <div className="bar" style={{ width: `${percent}%` }} />
            <div className="pct">{percent}%</div>
          </div>

          <h1>หน้า {page} / {totalPages} — คำถามทั้งหมด {total}</h1>

          {loading && <p>กำลังโหลดคำถาม...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !questions.length && <p>ไม่มีคำถามในหน้านี้</p>}

          <div className="question-list">
            {questions.map((q) => (
              <div key={q.id} className="question-block">
                <div className="q-header">
                  <strong>{q.question_no}.</strong>
                </div>
                <p className="question">{q.text}</p>

                <div className="choices">
                  {q.choices.map((c, ci) => {
                    const key = String(q.id);
                    const isSelected = String(answers[key]) === String(ci);
                    return (
                      <label
                        key={ci}
                        className={`choice ${isSelected ? 'selected' : ''}`}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => toggleChoice(q.id, ci)}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleChoice(q.id, ci); }
                        }}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={isSelected}
                          readOnly
                        />
                        <span className="bullet" />
                        <span className="text">{c}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="nav-actions">
            <button className="btn-secondary" onClick={goPrevPage} disabled={page === 1}>ก่อนหน้า</button>
            <button className="btn-primary" onClick={goNextPageOrSubmit}>
              {isLastPage ? 'ส่งคำตอบ' : 'ต่อไป'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SkillAssessmentQuiz;
