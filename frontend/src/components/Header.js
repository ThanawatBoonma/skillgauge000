import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {

  return (
    <header className="header">
      <div className="container">
        {/* ส่วน Logo เก็บไว้ */}
        <Link to="/" className="logo">
          <img src="/logo192.png" alt="Skill Gauge Logo" className="logo-img" />
          <h1>Skill Gauge</h1>
        </Link>

        {/* Header Actions: เหลือแค่ปุ่มเข้าสู่ระบบ (หรือจะลบออกก็ได้ถ้าหน้าแรกเป็น Login อยู่แล้ว) */}
        <div className="header-actions">
           
          <Link to="/login" className="sign-in-btn" role="button">
            เข้าสู่ระบบ
          </Link> 
        </div>
      </div>
    </header>
  );
};

export default Header;