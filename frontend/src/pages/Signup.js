
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API = process.env.REACT_APP_API_URL || '';

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // basic validation
    if (!form.full_name || !form.email || !form.username || !form.password) {
      setError('โปรดกรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    const payload = {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      username: form.username,
      password: form.password
    };

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (data.errors && data.errors.map(x=>x.msg).join(', ')) || 'สมัครไม่สำเร็จ');
      } else {
        // สมัครสำเร็จ - ไปหน้า login
        navigate('/login');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดเครือข่าย');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-screen">
      <div className="signup-page">
        <div className="signup-logo-side">
          <img src="/logo123.png" alt="SkillGauge" />
        </div>

        <div>
          <h1 className="signup-header">Register</h1>
          <div className="signup-card">
            {error && <div style={{color:'red', marginBottom:10}}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="signup-row">
                <label className="signup-label">Full Name</label>
                <input name="full_name" value={form.full_name} onChange={onChange} className="signup-input" placeholder="ชื่อ-นามสกุล" />
              </div>
              <div className="signup-row">
                <label className="signup-label">Email</label>
                <input name="email" value={form.email} onChange={onChange} className="signup-input" type="email" placeholder="sakya@gmail.com" />
              </div>
              <div className="signup-row">
                <label className="signup-label">Phone Number</label>
                <input name="phone" value={form.phone} onChange={onChange} className="signup-input" placeholder="086-xxxx-xxx" />
              </div>
              <div className="signup-row">
                <label className="signup-label">Role</label>
                <select name="role" className="signup-select" value={form.role} onChange={onChange}>
                  <option value="project_manager">Project Manager</option>
                  <option value="foreman">Foreman</option>
                  <option value="worker">Worker</option>
                </select>
              </div>
              <div className="signup-row">
                <label className="signup-label">Username</label>
                <input name="username" value={form.username} onChange={onChange} className="signup-input" placeholder="username or phone" />
              </div>
              <div className="signup-row">
                <label className="signup-label">Password</label>
                <input name="password" value={form.password} onChange={onChange} className="signup-input" type="password" placeholder="********" />
              </div>
              <div className="signup-row">
                <label className="signup-label">Confirm Password</label>
                <input name="confirmPassword" value={form.confirmPassword} onChange={onChange} className="signup-input" type="password" placeholder="********" />
              </div>

              <button type="submit" className="signup-submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>

            <div className="signup-footer">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
