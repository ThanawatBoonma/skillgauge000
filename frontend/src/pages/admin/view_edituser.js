import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import Swal from 'sweetalert2'; // <--- 1. Import SweetAlert2
import './view_edituser.css';
import { apiRequest } from '../../utils/api';

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
  { value: 'projectmanager', label: 'ผู้จัดการโครงการ (PM)' },
  { value: 'foreman', label: 'หัวหน้าช่าง (FM)' },
  { value: 'worker', label: 'ช่าง (WK)' }
];

const ViewEditUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const editData = location.state?.editWorker;
  const isViewOnly = location.state?.viewOnly || false;

  // --- State Dropdown ---
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);

  const [selectedProvinceOpt, setSelectedProvinceOpt] = useState(null);
  const [selectedDistrictOpt, setSelectedDistrictOpt] = useState(null);
  const [selectedSubdistrictOpt, setSelectedSubdistrictOpt] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    firstName: '',
    lastName: '',
    idCard: '',
    birthDate: '',
    age: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    subdistrict: '', subdistrict_id: '',
    district: '', district_id: '',
    province: '', province_id: '',
    zipCode: '',
    currentAddress: '',
    issueDate: '',
    expiryDate: '',
    role: null,
    trade: null,
    experience: '',
  });

  // 1. โหลดจังหวัด
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await apiRequest('/api/location/provinces');
        setProvinces(response.map(p => ({ value: p.id, label: p.name_th, code: p.code })));
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
    };
    loadProvinces();
  }, []);

  // 2. Map ข้อมูลเดิม
  useEffect(() => {
    if (editData) {
      const initData = async () => {
        const fullName = editData.full_name || '';
        const nameParts = fullName.split(' ');
        const fName = nameParts[0] || '';
        const lName = nameParts.slice(1).join(' ') || '';

        const foundRole = roleOptions.find(r => r.value === editData.role) || 
                          { value: editData.role, label: editData.role };

        const foundTrade = tradeOptions.find(t => t.label === editData.technician_type || t.value === editData.technician_type) || 
                           (editData.technician_type ? { value: editData.technician_type, label: editData.technician_type } : null);

        let initProvince = null;
        let initDistrict = null;
        let initSubdistrict = null;

        if (editData.province_id) {
            initProvince = { value: editData.province_id, label: editData.province || 'กำลังโหลด...' };
            try {
                const distRes = await apiRequest(`/api/location/districts/${editData.province_id}`);
                const distOptions = distRes.map(d => ({ value: d.id, label: d.name_th, code: d.code }));
                setDistricts(distOptions);
                
                if (editData.district_id) {
                    const matchDist = distOptions.find(d => d.value === editData.district_id);
                    initDistrict = matchDist || { value: editData.district_id, label: editData.district };

                    const subRes = await apiRequest(`/api/location/subdistricts/${editData.district_id}`);
                    const subOptions = subRes.map(s => ({ value: s.id, label: s.name_th, zipCode: s.zip_code }));
                    setSubdistricts(subOptions);

                    if (editData.subdistrict_id) {
                        const matchSub = subOptions.find(s => s.value === editData.subdistrict_id);
                        initSubdistrict = matchSub || { value: editData.subdistrict_id, label: editData.sub_district };
                    }
                }
            } catch (err) {
                console.error("Error pre-loading location data:", err);
            }
        }

        setSelectedProvinceOpt(initProvince);
        setSelectedDistrictOpt(initDistrict);
        setSelectedSubdistrictOpt(initSubdistrict);

        setFormData({
          id: editData.id,
          firstName: fName,
          lastName: lName,
          idCard: editData.citizen_id || '',
          birthDate: editData.birth_date ? editData.birth_date.split('T')[0] : '',
          age: editData.age || '',
          phone: editData.phone || '',
          email: editData.email || '',
          password: '', // ไม่ดึงรหัสเดิม
          address: editData.address_id_card || '',
          province_id: editData.province_id, province: editData.province,
          district_id: editData.district_id, district: editData.district,
          subdistrict_id: editData.subdistrict_id, subdistrict: editData.sub_district,
          zipCode: editData.zip_code || '',
          currentAddress: editData.address_current || '',
          issueDate: editData.card_issue_date ? editData.card_issue_date.split('T')[0] : '',
          expiryDate: editData.card_expiry_date ? editData.card_expiry_date.split('T')[0] : '',
          role: foundRole,
          trade: foundTrade,
          experience: editData.experience_years || '',
        });
      };
      initData();
    }
  }, [editData]);

  // --- Handlers ---
  const handleProvinceChange = async (option) => {
    setSelectedProvinceOpt(option);
    setSelectedDistrictOpt(null);
    setSelectedSubdistrictOpt(null);
    setDistricts([]);
    setSubdistricts([]);

    setFormData(prev => ({
      ...prev,
      province_id: option ? option.value : '',
      district_id: '', subdistrict_id: '',
      zipCode: ''
    }));

    if (option) {
      try {
        const response = await apiRequest(`/api/location/districts/${option.value}`);
        setDistricts(response.map(d => ({ value: d.id, label: d.name_th, code: d.code })));
      } catch (error) { console.error(error); }
    }
  };

  const handleDistrictChange = async (option) => {
    setSelectedDistrictOpt(option);
    setSelectedSubdistrictOpt(null);
    setSubdistricts([]);

    setFormData(prev => ({
      ...prev,
      district_id: option ? option.value : '',
      subdistrict_id: '',
      zipCode: ''
    }));

    if (option) {
      try {
        const response = await apiRequest(`/api/location/subdistricts/${option.value}`);
        setSubdistricts(response.map(s => ({ value: s.id, label: s.name_th, zipCode: s.zip_code })));
      } catch (error) { console.error(error); }
    }
  };

  const handleSubdistrictChange = (option) => {
    setSelectedSubdistrictOpt(option);
    setFormData(prev => ({
      ...prev,
      subdistrict_id: option ? option.value : '',
      zipCode: option ? String(option.zipCode) : ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption }));
  };

  const handleClose = () => {
    navigate('/admin', { state: { initialTab: 'users' } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewOnly) return;

    // --- 2. ใช้ SweetAlert2 แทน window.confirm ---
    const confirmResult = await Swal.fire({
      title: 'ยืนยันการบันทึก?',
      text: "ตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0e4da4',
      cancelButtonColor: '#d33',
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก'
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);
    try {
      const payload = {
        citizen_id: formData.idCard,
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        birth_date: formData.birthDate,
        age: formData.age,
        phone: formData.phone,
        email: formData.email,
        password: formData.password || undefined, // ส่งเฉพาะถ้ามีการกรอกใหม่
        address_id_card: formData.address,
        province_id: formData.province_id,
        district_id: formData.district_id,
        subdistrict_id: formData.subdistrict_id,
        zip_code: formData.zipCode,
        address_current: formData.currentAddress,
        card_issue_date: formData.issueDate,
        card_expiry_date: formData.expiryDate,
        role: formData.role?.value,
        technician_type: formData.trade?.label || 'ไม่มี',
        experience_years: formData.experience,
      };

      await apiRequest(`/api/manageusers/updateuser/${formData.id}`, {
        method: 'PUT',
        body: payload
      });

      // --- 3. ใช้ SweetAlert2 แจ้งผลสำเร็จ ---
      await Swal.fire({
        title: 'สำเร็จ!',
        text: 'บันทึกข้อมูลเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonColor: '#0e4da4'
      });
      
      handleClose();

    } catch (err) {
      console.error(err);
      // --- 4. ใช้ SweetAlert2 แจ้ง Error ---
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.message || 'ไม่สามารถบันทึกข้อมูลได้',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-edit-container">
      <div className="view-edit-header">
        <h2>{isViewOnly ? 'ดูรายละเอียดพนักงาน' : 'แก้ไขข้อมูลพนักงาน'}</h2>
        <button className="close-btn" onClick={handleClose}>ปิด</button>
      </div>

      <form className="view-edit-form" onSubmit={handleSubmit}>
        {/* ข้อมูลส่วนตัว */}
        <section className="form-section">
          <h3>ข้อมูลส่วนตัว</h3>
          <div className="form-row">
            <div className="form-group">
              <label>ชื่อจริง</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} disabled={isViewOnly} />
            </div>
            <div className="form-group">
              <label>นามสกุล</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} disabled={isViewOnly} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>เลขบัตรประชาชน</label>
              <input type="text" name="idCard" value={formData.idCard} onChange={handleChange} disabled={isViewOnly} maxLength={13} />
            </div>
            <div className="form-group">
              <label>วันเกิด</label>
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} disabled={isViewOnly} />
            </div>
            <div className="form-group short">
              <label>อายุ</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} disabled={isViewOnly} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>เบอร์โทรศัพท์</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={isViewOnly} />
            </div>
          </div>
        </section>

        {/* ที่อยู่ */}
        <section className="form-section">
          <h3>ที่อยู่ตามบัตรประชาชน</h3>
          <div className="form-group">
            <label>ที่อยู่ (บ้านเลขที่, หมู่)</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} disabled={isViewOnly} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>จังหวัด</label>
              <Select 
                options={provinces} 
                value={selectedProvinceOpt} 
                onChange={handleProvinceChange} 
                isDisabled={isViewOnly}
                placeholder="เลือกจังหวัด"
                isClearable
                noOptionsMessage={() => "ไม่มีตัวเลือก"}
              />
            </div>
            <div className="form-group">
              <label>อำเภอ/เขต</label>
              <Select
                options={districts}
                value={selectedDistrictOpt}
                onChange={handleDistrictChange}
                placeholder="เลือกอำเภอ..."
                isDisabled={isViewOnly || !formData.province_id}
                isClearable
                noOptionsMessage={() => "ไม่มีตัวเลือก"}
              />
            </div>
            <div className="form-group">
              <label>ตำบล/แขวง</label>
              <Select
                options={subdistricts}
                value={selectedSubdistrictOpt}
                onChange={handleSubdistrictChange}
                placeholder="เลือกตำบล..."
                isDisabled={isViewOnly || !formData.district_id}
                isClearable
                noOptionsMessage={() => "ไม่มีตัวเลือก"}
              />
            </div>
            <div className="form-group short">
              <label>รหัสไปรษณีย์</label>
              <input type="text" name="zipCode" value={formData.zipCode} readOnly placeholder="xxxxx" />
            </div>
          </div>
        </section>

        {/* ตำแหน่งงาน */}
        <section className="form-section">
          <h3>ข้อมูลตำแหน่งงาน</h3>
          <div className="form-row">
            <div className="form-group">
              <label>ตำแหน่ง (Role)</label>
              <Select options={roleOptions} value={formData.role} onChange={(opt) => handleSelectChange('role', opt)} isDisabled={isViewOnly} />
            </div>
            <div className="form-group">
              <label>ประเภทช่าง (Trade)</label>
              <Select options={tradeOptions} value={formData.trade} onChange={(opt) => handleSelectChange('trade', opt)} isDisabled={isViewOnly} />
            </div>
            <div className="form-group short">
              <label>ประสบการณ์ (ปี)</label>
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} disabled={isViewOnly} />
            </div>
          </div>
        </section>

        {/* บัญชีผู้ใช้งาน */}
        <section className="form-section">
          <h3>บัญชีผู้ใช้งาน (Account)</h3>
          <div className="form-row">
            <div className="form-group">
              <label>อีเมล (Username)</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={isViewOnly} />
            </div>
            <div className="form-group">
              <label>รหัสผ่าน {isViewOnly ? '(ซ่อนอยู่)' : '(กำหนดใหม่)'}</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  disabled={isViewOnly}
                  placeholder={isViewOnly ? "********" : "กรอกเพื่อเปลี่ยนรหัสผ่าน"}
                />
                <button 
                  type="button" 
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title="แสดง/ซ่อน รหัสผ่าน"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
              {!isViewOnly && <small style={{color: '#888', marginTop: '5px'}}>* หากไม่ต้องการเปลี่ยนรหัสผ่าน ให้เว้นว่างไว้</small>}
            </div>
          </div>
        </section>

        {!isViewOnly && (
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleClose}>ยกเลิก</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ViewEditUser;