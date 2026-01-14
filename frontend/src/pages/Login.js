import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { API_BASE_URL } from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const ADMIN_USERNAME = '0863125891';
  const ADMIN_PASSWORD = '0863503381';
  const ADMIN_EMAIL = 'admin@example.com';

  useEffect(() => {
    try {
      const pre = sessionStorage.getItem('login_prefill_username');
      if (pre) {
        setUsername(pre);
        sessionStorage.removeItem('login_prefill_username');
      }
      const msg = sessionStorage.getItem('login_message');
      if (msg) {
        setInfo(msg);
        sessionStorage.removeItem('login_message');
      }
    } catch {}
  }, []);

  const API = API_BASE_URL || process.env.REACT_APP_API_URL || '';

  const onLogin = async () => {
    setError(''); 
    
    if (!username || !password) {
      setError('กรุณากรอกเบอร์โทรศัพท์ (Admin) หรืออีเมล และรหัสผ่าน');
      return;
    }
    
    const trimmedUsername = username.trim();

    // Bypass สำหรับ Admin (Hardcoded)
    if (trimmedUsername === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setError('');
      const token = 'admin-bypass-token';
      const user = {
        id: '11111111-1111-1111-1111-111111111111',
        phone: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        roles: ['admin']
      };
      try {
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('user_id', user.id);
        sessionStorage.setItem('user_email', user.email);
        sessionStorage.setItem('role', 'admin');
      } catch {}
      const navUser = { username: user.phone, role: 'admin' };
      navigate('/admin', { state: { user: navUser, source: 'login' } });
      return;
    }

    try {
      const loginUrl = API ? `${API}/api/auth/login` : '/api/auth/login';
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedUsername, password }),
      });

      if (!res.ok) {
        setError('Username หรือ Password ไม่ถูกต้อง');
        return;
      }

      const data = await res.json();
      const { token, user: serverUser } = data; // เปลี่ยนชื่อตัวแปรเป็น serverUser เพื่อไม่ให้ซ้ำ

      // 1. ตรวจสอบ Role จากฐานข้อมูล
      let chosenRole = 'worker'; 
      if (Array.isArray(serverUser?.roles) && serverUser.roles.length > 0) {
        chosenRole = serverUser.roles[0];
      } else if (serverUser?.role) {
        chosenRole = serverUser.role;
      }

      // 2. ปรับการเซฟข้อมูลเข้า sessionStorage ให้เป็นแบบ Object
      try {
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('role', chosenRole); // เก็บแยกไว้ใช้เช็ค Route

        // สร้าง Object เพื่อเซฟให้ WorkerDashboard ไป JSON.parse ต่อได้
        const userToStore = {
          id: serverUser?.id || '',
          name: serverUser?.username || serverUser?.email || 'ผู้ใช้งาน', // ชื่อที่จะไปแสดงบน Dashboard
          role: chosenRole
        };
        sessionStorage.setItem('user', JSON.stringify(userToStore)); // เซฟเป็น JSON string

      } catch (e) {
        console.error("Session storage error:", e);
      }

      // 3. การ Navigate ไปยังหน้าต่างๆ (ตรวจสอบ Path ให้ตรงกับ App.js)
      const navUser = { username: serverUser?.phone || username, role: chosenRole };

      if (chosenRole === 'admin') {
        navigate('/admin', { state: { user: navUser, source: 'login' } });
      } else if (chosenRole === 'project_manager') {
        navigate('/pm', { state: { user: navUser, source: 'login' } });
      } else if (chosenRole === 'foreman') {
        navigate('/foreman', { state: { user: navUser, source: 'login' } }); // Path ต้องตรงกับ App.js
      } else if (chosenRole === 'worker') {
        navigate('/worker', { state: { user: navUser, source: 'login' } }); // Path ต้องตรงกับ App.js
      } else {
        navigate('/dashboard', { state: { user: navUser, source: 'login' } });
      }

    } catch (e) {
      console.error(e);
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-page">
        <div>
          <h1 className="login-header"></h1>
          <div className="login-card">
            {info && (
              <div style={{
                padding: '12px', marginBottom: '16px', backgroundColor: '#e6f4ea',
                border: '1px solid #c7e8cf', borderRadius: '8px', color: '#137333',
                fontSize: '14px', textAlign: 'center'
              }}>
                {info}
              </div>
            )}
            {error && (
              <div style={{
                padding: '12px', marginBottom: '16px', backgroundColor: 'rgba(255, 255, 255, 0)',
                border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '8px',
                color: '#ef4444', fontSize: '14px', textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            <div className="login-row">
              <label className="login-label">Username / Email</label>
              <input 
                className="login-input" 
                placeholder="เบอร์โทรศัพท์ (Admin) หรืออีเมล" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
              />
            </div>
            <div className="login-row">
              <label className="login-label">Password</label>
              <div className="input-with-eye">
                <input 
                  className="login-input" 
                  type={showPass ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
                <button
                  type="button"
                  className={`eye-btn ${showPass ? 'is-show' : 'is-hide'}`}
                  onClick={() => setShowPass(s => !s)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="login-links">
              <Link to="#">Forgot password</Link>
            </div>
            <button className="login-submit" type="button" onClick={onLogin}>Login</button>
            <div className="login-footer-link">
              ต้องการบัญชีใหม่? กรุณาติดต่อผู้ดูแลระบบเพื่อสร้างบัญชีให้คุณ
            </div>
          </div>
        </div>
        <div className="login-logo-side">
          <img src="/logo123.png" alt="Logo" />
        </div>
      </div>
    </div>
  );
};

export default Login;