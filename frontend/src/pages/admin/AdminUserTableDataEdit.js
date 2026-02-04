import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import './AdminWorkerRegistration.css'; // ใช้ CSS เดิม
import ThaiDatePicker from '../../components/ThaiDatePicker';
import { apiRequest } from '../../utils/api';

// Options (ควรเหมือนไฟล์ Registration เดิม)
const tradeOptions = [
  { value: 'structure', label: 'ช่างโครงสร้าง' },
  { value: 'plumbing', label: 'ช่างประปา' },
  { value: 'roofing', label: 'ช่างหลังคา' },
  { value: 'masonry', label: 'ช่างก่ออิฐฉาบปูน' },
  { value: 'aluminum', label: 'ช่างประตูหน้าต่างอลูมิเนียม' },
  { value: 'ceiling', label: 'ช่างฝ้าเพดาล' },
  { value: 'electric', label: 'ช่างไฟฟ้า' },
  { value: 'tiling', label: 'ช่างกระเบื้อง' }
];

const roleOptions = [
  { value: 'pm', label: 'ผู้จัดการโครงการ (PM)' },
  { value: 'fm', label: 'หัวหน้าช่าง (FM)' },
  { value: 'worker', label: 'ช่าง (WK)' }
];

const AdminUserTableDataEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingUser = location.state?.editWorker || {}; // รับข้อมูลเก่า

  const [currentStep, setCurrentStep] = useState(1);
  
  // State สำหรับ Form (โหลดข้อมูลเก่าถ้ามี)
  const [formData, setFormData] = useState({
    // ข้อมูลส่วนตัว
    prefix: 'นาย',
    fullName: existingUser.full_name || '',
    citizenId: existingUser.citizen_id || '',
    birthDate: existingUser.birth_date ? new Date(existingUser.birth_date) : null,
    phone: existingUser.phone || '',
    lineId: existingUser.line_id || '',
    
    // ที่อยู่
    addressIdCard: existingUser.address_id_card || '',
    province: existingUser.province_id ? { value: existingUser.province_id, label: existingUser.province } : null,
    district: existingUser.district_id ? { value: existingUser.district_id, label: existingUser.district } : null,
    subDistrict: existingUser.subdistrict_id ? { value: existingUser.subdistrict_id, label: existingUser.sub_district } : null,
    zipCode: existingUser.zip_code || '',
    addressCurrent: existingUser.address_current || '',
    
    // งาน
    role: existingUser.role ? roleOptions.find(r => r.value === existingUser.role) : null,
    trade: existingUser.technician_type ? tradeOptions.find(t => t.value === existingUser.technician_type) : null,
    experience: existingUser.experience_years || '',
    
    // บัญชี
    email: existingUser.email || '',
    password: '', // ปล่อยว่างไว้ ถ้าไม่แก้ก็ไม่ต้องส่ง หรือถ้า user ต้องการแก้ก็ใส่ใหม่
    confirmPassword: ''
  });

  // Load ข้อมูลจังหวัด/อำเภอ (Mock หรือเรียก API จริงตามระบบคุณ)
  // ... (ใส่ Logic การโหลดจังหวัดเหมือนเดิมที่นี่) ...

  const handleNext = () => {
    // Validate ก่อนไปหน้าถัดไป (ตัดทอนเพื่อความกระชับ)
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
        // เตรียม Payload สำหรับ Update
        const payload = {
            ...formData,
            // แปลงค่าต่างๆ ให้ตรงกับ Database format
            role: formData.role?.value,
            technician_type: formData.trade?.value,
            province_id: formData.province?.value,
            district_id: formData.district?.value,
            subdistrict_id: formData.subDistrict?.value,
            // ... อื่นๆ
        };

        // ยิง API Update
        await apiRequest(`/api/manageusers/updateuser/${existingUser.id}`, {
            method: 'PUT',
            body: payload
        });
        
        alert('แก้ไขข้อมูลเรียบร้อย');
        navigate('/admin/users');
    } catch (error) {
        console.error(error);
        alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    }
  };

  // Render Steps
  const renderStep1 = () => (
    <div className="form-section fade-in">
       {/* ... ใส่ Input Fields ข้อมูลส่วนตัว/ที่อยู่ แบบเดียวกับไฟล์ Registration ... */}
       {/* ตัวอย่าง Input */}
       <div className="form-group">
          <label>ชื่อ-นามสกุล <span className="text-danger">*</span></label>
          <input 
            type="text" 
            className="form-control"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          />
       </div>
       {/* ... (ใส่ให้ครบตามเดิม) ... */}
    </div>
  );

  const renderStep2 = () => (
    <div className="form-section fade-in">
        <h3 className="section-title">2) บัญชีเข้าสู่ระบบ</h3>
        {/* ลบกล่องข้อความ "ขั้นตอนนี้ทำอะไร" ออกตามสั่ง */}
        
        <div className="form-grid two-columns">
            <div className="form-group">
                <label>อีเมล <span className="text-danger">*</span></label>
                <input 
                    type="email" 
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label>รหัสผ่าน (เว้นว่างหากไม่ต้องการเปลี่ยน)</label>
                <input 
                    type="password" 
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="********"
                />
            </div>
        </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-section fade-in">
       <h3 className="section-title">3) ตรวจสอบและยืนยันข้อมูล</h3>
       <p className="section-subtitle">กรุณาตรวจสอบข้อมูลก่อนบันทึกการแก้ไข</p>
       
       {/* Review Grid (เหมือนหน้า View แต่มีปุ่มแก้ไขย่อยๆ ได้ถ้าต้องการ หรือจะไม่มีก็ได้) */}
       <div className="review-section">
          {/* ... แสดงข้อมูล review ... */}
          <div className="review-item">
              <label>ชื่อ-นามสกุล</label>
              <span>{formData.fullName}</span>
          </div>
          {/* ... อื่นๆ ... */}
       </div>
    </div>
  );

  return (
    <div className="admin-worker-registration">
      {/* Sidebar ยังคงมีอยู่สำหรับหน้า Edit เพื่อดู Progress */}
      <aside className="registration-sidebar">
        <div className="sidebar-header">
           <h3>แก้ไขข้อมูล</h3>
           <p>แก้ไขรายละเอียดพนักงาน</p>
        </div>
        <ul className="step-list">
           <li className={currentStep === 1 ? 'active' : ''}>1. ข้อมูลส่วนตัว</li>
           <li className={currentStep === 2 ? 'active' : ''}>2. บัญชีผู้ใช้</li>
           <li className={currentStep === 3 ? 'active' : ''}>3. ยืนยัน</li>
        </ul>
      </aside>

      <main className="registration-main">
        <div className="registration-header">
           <h2>แก้ไขข้อมูลผู้ใช้งาน</h2>
           <button className="btn-secondary" onClick={() => navigate('/admin/users')}>ยกเลิก</button>
        </div>

        <div className="registration-form-container">
           {currentStep === 1 && renderStep1()}
           {currentStep === 2 && renderStep2()}
           {currentStep === 3 && renderStep3()}

           <div className="form-actions">
              {currentStep > 1 && (
                  <button className="btn-secondary" onClick={handleBack}>ย้อนกลับ</button>
              )}
              
              <button className="btn-outline-danger" onClick={() => window.location.reload()}>ล้างฟอร์ม</button>

              {currentStep < 3 ? (
                  <button className="btn-primary" onClick={handleNext}>ถัดไป</button>
              ) : (
                  <button className="btn-success" onClick={handleSubmit}>บันทึกการแก้ไข</button>
              )}
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserTableDataEdit;