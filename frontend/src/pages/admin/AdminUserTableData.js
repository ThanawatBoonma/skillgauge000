import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AdminWorkerRegistration.css'; // ✅ สำคัญ: ต้อง import CSS ตัวเดิมมาใช้

const AdminUserTableData = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // รับข้อมูล user ที่ส่งมาจากหน้า Table
  const user = location.state?.worker || {};

  // ฟังก์ชันแปลงวันที่
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    // ✅ Wrapper Class หลักต้องมี เพื่อให้ CSS ทำงาน
    <div className="admin-worker-registration">
      
      {/* ปรับ style ให้เต็มจอเพราะไม่มี Sidebar */}
      <main className="registration-main" style={{ marginLeft: 0, width: '100%', maxWidth: '100%' }}>
        
        {/* Header ส่วนบน */}
        <div className="registration-header">
          <div>
            <h2>ข้อมูลพนักงาน</h2>
            <p className="sub-header">รายละเอียดข้อมูลผู้ใช้งานในระบบ</p>
          </div>
          {/* ปุ่มย้อนกลับ */}
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate('/admin/users')}
          >
            กลับหน้าจัดการผู้ใช้งาน
          </button>
        </div>

        {/* Container หลักของฟอร์ม */}
        <div className="registration-form-container">
            
            {/* เลียนแบบ Step 3: Review Section */}
            <div className="form-section fade-in" style={{ display: 'block' }}>
                <h3 className="section-title">1) ตรวจสอบและยืนยันข้อมูล</h3>
                
                <div className="review-section">
                    {/* --- กลุ่มที่ 1: ข้อมูลส่วนตัว --- */}
                    <div className="review-group">
                      <div className="review-header">
                        <h4>ข้อมูลส่วนตัวและตำแหน่งงาน</h4>
                      </div>
                      <div className="review-grid">
                        <div className="review-item">
                          <label>ชื่อ-นามสกุล</label>
                          <span>{user.full_name || '-'}</span>
                        </div>
                        <div className="review-item">
                          <label>เลขบัตรประชาชน</label>
                          <span>{user.citizen_id || '-'}</span>
                        </div>
                        <div className="review-item">
                          <label>วันเกิด</label>
                          <span>{formatDate(user.birth_date)}</span>
                        </div>
                        <div className="review-item">
                          <label>อายุ</label>
                          <span>{user.age ? `${user.age} ปี` : '-'}</span>
                        </div>
                        <div className="review-item">
                          <label>เบอร์โทรศัพท์</label>
                          <span>{user.phone || '-'}</span>
                        </div>
                        <div className="review-item">
                          <label>ตำแหน่ง</label>
                          <span>{user.role || '-'}</span>
                        </div>
                        <div className="review-item">
                          <label>ประเภทช่าง</label>
                          <span>{user.technician_type || '-'}</span>
                        </div>
                        <div className="review-item">
                          <label>ประสบการณ์</label>
                          <span>{user.experience_years ? `${user.experience_years} ปี` : '-'}</span>
                        </div>
                      </div>
                    </div>

                    <hr className="divider" />

                    {/* --- กลุ่มที่ 2: ข้อมูลที่อยู่ --- */}
                    <div className="review-group">
                      <div className="review-header">
                        <h4>ข้อมูลที่อยู่</h4>
                      </div>
                      <div className="review-grid">
                        <div className="review-item full-width">
                          <label>ที่อยู่ตามบัตรประชาชน</label>
                          <span>{user.address_id_card || '-'}</span>
                        </div>
                        <div className="review-item">
                          <label>จังหวัด</label>
                          <span>{user.province || '-'}</span>
                        </div>
                        <div className="review-item">
                          <label>อำเภอ/เขต</label>
                          <span>{user.district || '-'}</span>
                        </div>
                        <div className="review-item">
                          <label>ตำบล/แขวง</label>
                          <span>{user.sub_district || '-'}</span>
                        </div>
                        <div className="review-item">
                          <label>รหัสไปรษณีย์</label>
                          <span>{user.zip_code || '-'}</span>
                        </div>
                        <div className="review-item full-width">
                          <label>ที่อยู่ปัจจุบัน</label>
                          <span>{user.address_current || 'ตรงกับที่อยู่ตามบัตรประชาชน'}</span>
                        </div>
                      </div>
                    </div>

                    <hr className="divider" />

                    {/* --- กลุ่มที่ 3: บัญชีผู้ใช้ --- */}
                    <div className="review-group">
                      <div className="review-header">
                        <h4>บัญชีเข้าสู่ระบบ</h4>
                      </div>
                      <div className="review-grid">
                        <div className="review-item">
                          <label>อีเมล (Username)</label>
                          <span>{user.email || '-'}</span>
                        </div>
                        <div className="review-item">
                          <label>รหัสผ่าน</label>
                          <span>********</span>
                        </div>
                      </div>
                    </div>
                </div>

                {/* ปุ่ม Action ด้านล่าง */}
                <div className="form-actions" style={{ justifyContent: 'center', marginTop: '40px' }}>
                    <button 
                      type="button" 
                      className="btn-primary"
                      style={{ minWidth: '200px' }}
                      onClick={() => navigate('/admin/users')}
                    >
                      ยืนยัน
                    </button>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserTableData;