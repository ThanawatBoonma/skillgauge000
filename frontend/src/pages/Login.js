import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

// ตั้งค่าฐาน API — แก้ URL ให้ตรงกับ backend ของคุณ
const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// ฟังก์ชันช่วยเลือก role (กัน error ตอนที่ backend ส่ง roles มา)
const chooseRole = (clientRole, serverRoles) => {
  if (serverRoles.includes(clientRole)) return clientRole;
  if (serverRoles.length > 0) return serverRoles[0];
  return 'worker';
};

const Login = () => {
  const [role, setRole] = useState('foreman');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // ฟังก์ชัน onLogin 
  const onLogin = async () => {
    console.log('onLogin clicked', { username, password, role });
    if (!username || !password) {
      alert('กรุณากรอก username และ password');
      return;
    }

    const payload = { identifier: username, phone: username, username, password };
    console.log('Login payload:', payload);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('fetch status', res.status, res.statusText);

      const text = await res.text();
      console.log('raw response text:', text);

      if (!res.ok) {
        let msg = text;
        try { msg = JSON.parse(text); } catch (e) {}
        console.error('Login failed response:', msg);
        alert('Login failed: ' + (msg?.error || res.statusText || 'Unknown'));
        return;
      }

      let data;
      try { data = JSON.parse(text); }
      catch (e) { console.error('Invalid JSON response', e); alert('Invalid server response'); return; }

      console.log('login success data:', data);

      try {
        if (data.token) sessionStorage.setItem('auth_token', data.token);
        if (data.user?.id) sessionStorage.setItem('user_id', data.user.id);
        if (data.user?.email) sessionStorage.setItem('user_email', data.user.email);
        console.log('sessionStorage set ok');
      } catch (e) {
        console.error('sessionStorage error', e);
      }

      let serverRoles = Array.isArray(data.user?.roles) ? data.user.roles : [];
      let chosenRole = 'worker';
      try {
        chosenRole = chooseRole(role, serverRoles);
      } catch (e) {
        console.error('chooseRole error', e);
        if (serverRoles.length) chosenRole = serverRoles[0];
      }
      console.log('chosenRole=', chosenRole);

      try { sessionStorage.setItem('role', chosenRole); } catch (e) { console.error('set role storage error', e); }

      const dest = chosenRole === 'project_manager' ? '/pm' : '/dashboard';
      console.log('navigating to', dest);
      navigate(dest, { state: { user: { username, role: chosenRole }, source: 'login' } });
    } catch (e) {
      console.error('Login request error', e);
      alert('Login failed: ' + e.message);
    }
  };

  // UI
  return (
    <div className="login-screen">
      <div className="login-page">
        <div>
          <h1 className="login-header">Login</h1>

          <div className="login-card">
            <div className="login-row">
              <label className="login-label">Username</label>
              <input
                className="login-input"
                placeholder="เบอร์โทรศัพท์"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="login-row">
              <label className="login-label">Password</label>
              <input
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="login-links">
              <Link to="#">Forgot password</Link>
              <div className="role-toggle">
                
              </div>
            </div>

            {/*  ปุ่ม login เรียก onLogin */}
            <button className="login-submit" onClick={onLogin}>
              Login
            </button>

            <div className="login-footer-link">
              Don't have an account? <Link to="/signup">Sign Up</Link>
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