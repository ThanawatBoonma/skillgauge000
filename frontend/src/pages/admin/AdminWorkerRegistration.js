import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import './AdminWorkerRegistration.css';
import ThaiDatePicker from '../../components/ThaiDatePicker';
import { apiRequest } from '../../utils/api';

const provinceOptions = [];

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

const RANDOM_PASSWORD_LENGTH = 12;
const UPPERCASE_SET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWERCASE_SET = 'abcdefghijkmnopqrstuvwxyz';
const DIGIT_SET = '23456789';
const SYMBOL_SET = '!@#$%^&*';
const MIN_PHONE_LENGTH = 10;
const MAX_PHONE_LENGTH = 10;

const buildRandomPassword = (length = RANDOM_PASSWORD_LENGTH) => {
  const pickFrom = source => source[Math.floor(Math.random() * source.length)];
  const baseSets = [UPPERCASE_SET, LOWERCASE_SET, DIGIT_SET, SYMBOL_SET];
  const merged = baseSets.join('');
  const characters = baseSets.map(pickFrom);

  while (characters.length < length) {
    characters.push(pickFrom(merged));
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }

  return characters.join('');
};

const STEP_FLOW = [
  {
    key: 'personal',
    title: '1) ข้อมูลส่วนตัว ตำแหน่งงาน และที่อยู่',
    label: 'ข้อมูลส่วนตัว/ตำแหน่ง/ที่อยู่',
    description: 'กรอกข้อมูลประจำตัว รายละเอียดตำแหน่ง ที่อยู่ และข้อมูลบัตรในหน้าเดียว'
  },
  {
    key: 'credentials',
    title: '2) สร้างบัญชีเข้าสู่ระบบ',
    label: 'สร้างบัญชีเข้าสู่ระบบ',
    description: 'สร้างอีเมลและรหัสผ่านสำหรับเข้าสู่ระบบ'
  },
  {
    key: 'review',
    title: '3) ตรวจสอบและยืนยันข้อมูล',
    label: 'ตรวจสอบข้อมูล',
    description: 'ตรวจสอบความถูกต้องของข้อมูลทั้งหมดก่อนบันทึก'
  }
];

const STEP_INDEX_BY_KEY = STEP_FLOW.reduce((accumulator, step, index) => {
  accumulator[step.key] = index;
  return accumulator;
}, {});

const STEP_FIELD_PATHS = {
  personal: [
    ['personal', 'nationalId'], ['personal', 'fullName'], ['personal', 'birthDate'],
    ['employment', 'role'], ['employment', 'tradeType'],
    ['address', 'phone'], ['address', 'addressOnId'],
    ['address', 'province_id'], ['address', 'district_id'], ['address', 'subdistrict_id'], // ใช้ ID
    ['address', 'postalCode'], ['address', 'currentAddress'],
    ['identity', 'issueDate'], ['identity', 'expiryDate']
  ],
  credentials: [['credentials', 'email'], ['credentials', 'password']],
  review: []
};

const IMPORTANT_FIELD_PATHS = {
  personal: [
    ['personal', 'nationalId'],
    ['personal', 'fullName'],
    ['personal', 'birthDate'],
    ['employment', 'role'],
    ['employment', 'tradeType'],
    ['address', 'phone'],
    ['address', 'addressOnId'],
    ['address', 'currentAddress'],
    ['identity', 'issueDate'],
    ['identity', 'expiryDate']
  ],
  credentials: [
    ['credentials', 'email'],
    ['credentials', 'password']
  ]
};

const REQUIRED_FIELD_MESSAGES = {
  'personal.nationalId': 'กรุณากรอกเลขบัตรประชาชน',
  'personal.fullName': 'กรุณากรอกชื่อ-นามสกุล',
  'personal.birthDate': 'กรุณาระบุวันเกิด',
  'employment.role': 'กรุณาเลือกตำแหน่ง',
  'employment.tradeType': 'กรุณาเลือกประเภทช่าง',
  'address.province': 'กรุณาระบุจังหวัด',
  'address.district': 'กรุณาระบุอำเภอ',
  'address.subdistrict': 'กรุณาระบุตำบล',
  'address.postalCode': 'กรุณาระบุรหัสไปรษณีย์',
  'address.phone': 'กรุณากรอกเบอร์โทรศัพท์',
  'address.addressOnId': 'กรุณากรอกที่อยู่ตามบัตรประชาชน',
  'address.currentAddress': 'กรุณากรอกที่อยู่ปัจจุบัน',
  'identity.issueDate': 'กรุณาระบุวันออกบัตร',
  'identity.expiryDate': 'กรุณาระบุวันหมดอายุบัตร'
};

const serverErrorMessages = {
  duplicate_email: 'อีเมลนี้ถูกใช้งานแล้ว',
  duplicate_national_id: 'เลขบัตรประชาชนนี้ถูกใช้งานแล้ว',
  invalid_email: 'รูปแบบอีเมลไม่ถูกต้อง',
  password_required: 'กรุณากำหนดรหัสผ่านให้ครบถ้วน',
  invalid_phone: 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง',
  invalid_national_id_length: 'เลขบัตรประชาชนต้องมี 13 หลัก',
  workers_table_missing_id: 'ตาราง workers ไม่มีคอลัมน์ id กรุณาตรวจสอบฐานข้อมูล',
  worker_accounts_table_missing_columns: 'ตารางบัญชีผู้ใช้ยังไม่พร้อมใช้งาน'
};

const getValueByPath = (obj, path) => path.reduce((value, key) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  return value[key];
}, obj);

const isFilledValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return Boolean(value);
};

const formatDate = (value) => {
  if (!value) {
    return 'ไม่ระบุ';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  try {
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return date.toISOString().split('T')[0];
  }
};

const formatThaiDateForInput = (isoDate) => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [y, m, d] = parts;
  const thYear = parseInt(y, 10) + 543;
  return `${d}/${m}/${thYear}`;
};

const buildInitialFormState = () => ({
  personal: {
    nationalId: '',
    fullName: '',
    birthDate: ''
  },
  identity: {
    issueDate: '',
    expiryDate: ''
  },
  address: {
    phone: '', addressOnId: '',
    province_id: '', district_id: '', subdistrict_id: '', // เก็บ ID
    province_label: '', district_label: '', subdistrict_label: '', // เก็บชื่อไว้โชว์ตอน Review
    postalCode: '', currentAddress: ''
  },
  employment: {
    role: '',
    tradeType: '',
    experienceYears: ''
  },
  credentials: {
    email: '',
    password: ''
  }
});

const AdminWorkerRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingWorker = location.state?.editWorker || null;
  const editingWorkerId = editingWorker?.id;
  const isEditing = Boolean(editingWorkerId);
  const viewOnlyFlag = Boolean(location.state?.viewOnly);
  const [form, setForm] = useState(buildInitialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
// [New] State สำหรับ React-Select
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);

  // State สำหรับ Selected Option Object (เพื่อให้ React-Select แสดงค่าที่เลือกค้างไว้ได้ถูกต้อง)
  const [selectedProvinceOpt, setSelectedProvinceOpt] = useState(null);
  const [selectedDistrictOpt, setSelectedDistrictOpt] = useState(null);
  const [selectedSubdistrictOpt, setSelectedSubdistrictOpt] = useState(null);

  // Date picker refs
  const birthDateRef = useRef(null);
  const issueDateRef = useRef(null);
  const expiryDateRef = useRef(null);

  const openDatePicker = (ref) => {
    if (ref.current) {
      if (typeof ref.current.showPicker === 'function') {
        ref.current.showPicker();
      } else {
        ref.current.focus();
      }
    }
  };

  const handleGeneratePassword = () => {
    const generated = buildRandomPassword();
    setForm(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        password: generated
      }
    }));
    setErrors(prev => {
      if (!prev.password) {
        return prev;
      }
      const next = { ...prev };
      delete next.password;
      return next;
    });
  };

// [New] Load Provinces on Mount (โหลดจังหวัดตอนเข้าหน้าเว็บ)
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await apiRequest('/api/location/provinces');
        
        setProvinces(response.map(p => ({ 
          value: p.id, 
          label: p.name_th, 
          code: p.code 
        })));
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
    };
    loadProvinces();
  }, []);

  useEffect(() => {
    if (editingWorker) {
      const { fullData } = editingWorker;
      if (fullData) {
        const fallbackEmail = editingWorker.email;
        const credentialData = fullData.credentials || {};
        const existingPassword = credentialData.passwordHash || credentialData.password || '';

        setForm(prev => ({
          personal: { ...prev.personal, ...(fullData.personal || {}) },
          identity: { ...prev.identity, ...(fullData.identity || {}) },
          address: { ...prev.address, ...(fullData.address || {}) },
          employment: { ...prev.employment, ...(fullData.employment || {}) },
          credentials: {
            ...prev.credentials,
            email:
              credentialData.email ||
              fallbackEmail ||
              prev.credentials.email,
            password: existingPassword
          }
        }));
      }
    }
    if (viewOnlyFlag) {
      setIsViewOnly(true);
    }
  }, [editingWorker, viewOnlyFlag]);

  const age = useMemo(() => {
    if (!form.personal.birthDate) {
      return '';
    }
    const birth = new Date(form.personal.birthDate);
    if (Number.isNaN(birth.getTime())) {
      return '';
    }
    const today = new Date();
    let calculated = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      calculated -= 1;
    }
    return calculated >= 0 ? calculated : '';
  }, [form.personal.birthDate]);

  const currentStepConfig = STEP_FLOW[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEP_FLOW.length - 1;

  const selectedRoleLabel = useMemo(() => {
    return roleOptions.find(option => option.value === form.employment.role)?.label || 'ไม่ระบุ';
  }, [form.employment.role]);

  const selectedTradeLabel = useMemo(() => {
    if (form.employment.role !== 'worker') {
      return 'ไม่จำเป็นสำหรับตำแหน่งนี้';
    }
    return tradeOptions.find(option => option.value === form.employment.tradeType)?.label || 'ไม่ระบุ';
  }, [form.employment.role, form.employment.tradeType]);

  const reviewSections = useMemo(() => {
    const formatExperience = () => {
      if (!form.employment.experienceYears && form.employment.experienceYears !== 0) {
        return 'ไม่ระบุ';
      }
      const years = Number(form.employment.experienceYears);
      if (Number.isNaN(years)) {
        return `${form.employment.experienceYears}`;
      }
      return `${years} ปี`;
    };

    return [
      {
        key: 'personal',
        title: 'ข้อมูลส่วนตัว',
        stepIndex: STEP_INDEX_BY_KEY.personal,
        items: [
          { label: 'ชื่อ-นามสกุล', value: form.personal.fullName?.trim() || 'ไม่ระบุ' },
          { label: 'เลขบัตรประชาชน', value: form.personal.nationalId?.trim() || 'ไม่ระบุ' },
          { label: 'วันเกิด', value: formatDate(form.personal.birthDate) },
          { label: 'อายุ', value: age ? `${age} ปี` : 'ไม่ระบุ' }
        ]
      },
      {
        key: 'employment',
        title: 'ข้อมูลตำแหน่งงาน',
        stepIndex: STEP_INDEX_BY_KEY.personal,
        items: [
          { label: 'ตำแหน่ง', value: selectedRoleLabel },
          { label: 'ประเภทช่าง', value: selectedTradeLabel },
          { label: 'ประสบการณ์', value: formatExperience() }
        ]
      },
      {
        key: 'address',
        title: 'ข้อมูลที่อยู่',
        stepIndex: STEP_INDEX_BY_KEY.personal,
        items: [
          { label: 'เบอร์โทรศัพท์', value: form.address.phone?.trim() || 'ไม่ระบุ' },
          { label: 'ที่อยู่ตามบัตรประชาชน', value: form.address.addressOnId?.trim() || 'ไม่ระบุ' },
          { label: 'จังหวัด', value: form.address.province?.trim() || 'ไม่ระบุ' },
          { label: 'อำเภอ', value: form.address.district?.trim() || 'ไม่ระบุ' },
          { label: 'ตำบล', value: form.address.subdistrict?.trim() || 'ไม่ระบุ' },
          { label: 'รหัสไปรษณีย์', value: String(form.address.postalCode || '').trim() || 'ไม่ระบุ' },
          { label: 'ที่อยู่ปัจจุบัน', value: form.address.currentAddress?.trim() || 'ไม่ระบุ' }
        ]
      },
      {
        key: 'identity',
        title: 'ข้อมูลบัตรประชาชน',
        stepIndex: STEP_INDEX_BY_KEY.personal,
        items: [
          { label: 'วันออกบัตร', value: formatDate(form.identity.issueDate) },
          { label: 'วันหมดอายุบัตร', value: formatDate(form.identity.expiryDate) }
        ]
      },
      {
        key: 'account',
        title: 'บัญชีเข้าสู่ระบบ',
        stepIndex: STEP_INDEX_BY_KEY.credentials,
        items: [
          { label: 'อีเมลเข้าสู่ระบบ', value: form.credentials.email.trim() || 'ไม่ระบุ' },
          {
            label: 'รหัสผ่าน',
            value: form.credentials.password
              ? 'ตั้งรหัสผ่านเรียบร้อย'
              : 'ยังไม่กำหนด'
          }
        ]
      }
    ];
  }, [form.personal.fullName, form.personal.nationalId, form.personal.birthDate, age, selectedRoleLabel, selectedTradeLabel, form.employment.experienceYears, form.address.addressOnId, form.address.province, form.address.district, form.address.subdistrict, form.address.postalCode, form.address.currentAddress, form.identity.issueDate, form.identity.expiryDate, form.credentials.email, form.credentials.password]);

  const isFieldRequired = (path) => {
    if (path[0] === 'employment' && path[1] === 'tradeType') {
      return form.employment.role === 'worker';
    }
    return true;
  };

  const progressInfo = useMemo(() => {
    let totalImportantFields = 0;
    let filledImportantFields = 0;

    const sections = STEP_FLOW.map((step, index) => {
      const candidatePaths = IMPORTANT_FIELD_PATHS[step.key] || STEP_FIELD_PATHS[step.key] || [];
      const relevantPaths = candidatePaths.filter(isFieldRequired);
      const totalFields = relevantPaths.length;
      const filledCount = relevantPaths.reduce((count, path) => {
        const value = getValueByPath(form, path);
        return isFilledValue(value) ? count + 1 : count;
      }, 0);

      let progress = totalFields > 0 ? filledCount / totalFields : 0;
      const includeInTotals = step.key !== 'review' && totalFields > 0;

      if (step.key === 'review') {
        progress = index <= currentStep ? 1 : 0;
      }

      if (includeInTotals) {
        totalImportantFields += totalFields;
        filledImportantFields += filledCount;
      }

      return {
        key: step.key,
        label: step.label,
        completed: progress === 1,
        progress,
        percent: Math.round(progress * 100),
        isActive: index === currentStep,
        filledCount,
        totalFields
      };
    });

    const totalPercent = totalImportantFields > 0
      ? Math.round((filledImportantFields / totalImportantFields) * 100)
      : 0;

    return {
      sections,
      totalPercent
    };
  }, [form, currentStep]);

  const { sections: progressSections, totalPercent: progressPercent } = progressInfo;

  const updateField = (section, key, value) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const getErrorKey = (section, key) => `${section}.${key}`;

  const getMissingRequiredFieldPaths = (stepKey) => {
    const paths = (STEP_FIELD_PATHS[stepKey] || []).filter(isFieldRequired);
    return paths.filter(path => {
      const value = getValueByPath(form, path);
      return !isFilledValue(value);
    });
  };

  // [New] Handlers for React-Select
  const handleProvinceChange = async (option) => {
    // 1. เก็บค่าที่เลือกลง State
    setSelectedProvinceOpt(option);
    
    // 2. เคลียร์ค่าอำเภอ/ตำบลเดิมทิ้ง (เพราะเปลี่ยนจังหวัดแล้ว)
    setSelectedDistrictOpt(null);
    setSelectedSubdistrictOpt(null);
    setDistricts([]);    // ล้าง list อำเภอเก่า
    setSubdistricts([]); // ล้าง list ตำบลเก่า

    // 3. อัปเดต Form Data
    setForm(prev => ({
      ...prev,
      address: {
        ...prev.address,
        province_id: option ? option.value : '', // เก็บ ID ลง DB
        province: option ? option.label : '',    // เก็บชื่อไว้โชว์
        district_id: '', district: '',
        subdistrict_id: '', subdistrict: '',
        postalCode: ''
      }
    }));

    if (option) {
      try {
        // ✅ ใช้ apiRequest แบบถูกต้อง (ไม่ต้องใส่ 'GET')
        // ตรวจสอบว่า Backend ใช้ 'code' หรือ 'id' ในการค้นหา (ในที่นี้สมมติว่าใช้ code)
        const response = await apiRequest(`/api/location/districts/${option.value}`);
        
        setDistricts(response.map(d => ({ 
          value: d.id, 
          label: d.name_th, 
          code: d.code 
        })));
      } catch (error) { console.error(error); }
    }
  };

  const handleDistrictChange = async (option) => {
    setSelectedDistrictOpt(option);
    setSelectedSubdistrictOpt(null);
    setSubdistricts([]);

    setForm(prev => ({
      ...prev,
      address: {
        ...prev.address,
        district_id: option ? option.value : '',
        district: option ? option.label : '',
        subdistrict_id: '', subdistrict: '',
        postalCode: ''
      }
    }));

    if (option) {
      try {
        const response = await apiRequest(`/api/location/subdistricts/${option.value}`);
        setSubdistricts(response.map(s => ({ 
          value: s.id, 
          label: s.name_th, 
          zipCode: s.zip_code 
        })));
      } catch (error) { console.error(error); }
    }
  };

  const handleSubdistrictChange = (option) => {
    setSelectedSubdistrictOpt(option);
    setForm(prev => ({
      ...prev,
      address: {
        ...prev.address,
        subdistrict_id: option ? option.value : '',
        subdistrict: option ? option.label : '',
        postalCode: option ? String(option.zipCode) : ''
      }
    }));
  };

  const validateCredentials = () => {
    const emailValue = form.credentials.email.trim();
    const passwordValue = form.credentials.password;
    const validationErrors = {};

    if (!emailValue) {
      validationErrors.email = 'กรุณากรอกอีเมลสำหรับเข้าสู่ระบบ';
    } else if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
      validationErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    const requirePassword = !isEditing || Boolean(passwordValue);

    if (requirePassword) {
      if (!passwordValue) {
        validationErrors.password = 'กรุณากำหนดรหัสผ่าน';
      } else if (passwordValue.length < 8) {
        validationErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
      }
    }

    return {
      errors: validationErrors,
      values: {
        email: emailValue,
        password: requirePassword ? passwordValue : undefined
      },
      requirePassword
    };
  };

  const handleInputChange = (section, key) => (event) => {
    let { value } = event.target;
    if (section === 'personal' && key === 'nationalId') {
      value = value.replace(/\D/g, '').slice(0, 13);
    }
    if (section === 'employment' && key === 'role') {
      const nextRole = value;
      setForm(prev => ({
        ...prev,
        employment: {
          ...prev.employment,
          role: nextRole,
          tradeType: nextRole === 'worker' ? prev.employment.tradeType : ''
        }
      }));
      setErrors(prev => {
        const next = { ...prev };
        const roleErrorKey = getErrorKey('employment', 'role');
        const tradeErrorKey = getErrorKey('employment', 'tradeType');
        if (next[roleErrorKey]) {
          delete next[roleErrorKey];
        }
        if (nextRole !== 'worker' && next[tradeErrorKey]) {
          delete next[tradeErrorKey];
        }
        return next;
      });
      return;
    }
    if (section === 'address') {
      if (key === 'postalCode') {
        value = value.replace(/\D/g, '').slice(0, 5);
      }

      if (key === 'phone') {
        value = value.replace(/\D/g, '').slice(0, MAX_PHONE_LENGTH);
        updateField(section, key, value);
        const phoneErrorKey = getErrorKey('address', 'phone');
        setErrors(prev => {
          const next = { ...prev };
          if (value.length === 0) {
            next[phoneErrorKey] = REQUIRED_FIELD_MESSAGES[phoneErrorKey];
          } else if (value.length < MIN_PHONE_LENGTH) {
            next[phoneErrorKey] = `เบอร์โทรศัพท์ต้องมี ${MIN_PHONE_LENGTH} หลัก`;
          } else if (next[phoneErrorKey]) {
            delete next[phoneErrorKey];
          }
          return next;
        });
        return;
      }

    }
    updateField(section, key, value);

    if (section === 'personal' && key === 'nationalId') {
      const nationalIdKey = getErrorKey('personal', 'nationalId');
      const hasValue = value.length > 0;
      const isComplete = value.length === 13;
      setErrors(prev => {
        const next = { ...prev };
        if (!hasValue) {
          next[nationalIdKey] = REQUIRED_FIELD_MESSAGES[nationalIdKey];
        } else if (!isComplete) {
          next[nationalIdKey] = 'เลขบัตรประชาชนต้องมี 13 หลัก';
        } else if (next[nationalIdKey]) {
          delete next[nationalIdKey];
        }
        return next;
      });
      return;
    }

    const errorKey = section === 'credentials' ? key : getErrorKey(section, key);
    if (errors[errorKey]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const resetForm = () => {
    setForm(buildInitialFormState());
    setFeedback('');
    setFeedbackType(null);
    setCurrentStep(0);
    setErrors({});
    
    // การเคลียร์ State ของ React Select 
    setSelectedProvinceOpt(null);
    setSelectedDistrictOpt(null);
    setSelectedSubdistrictOpt(null);
    setDistricts([]);    // เคลียร์ list อำเภอ
    setSubdistricts([]); // เคลียร์ list ตำบล
  };

  const handleBack = () => {
    navigate('/admin');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');
    setFeedbackType(null);
    const { errors: credentialErrors, values } = validateCredentials();

    if (Object.keys(credentialErrors).length > 0) {
      setErrors(credentialErrors);
      const credentialStepIndex = STEP_INDEX_BY_KEY.credentials;
      if (credentialStepIndex !== undefined) {
        setCurrentStep(credentialStepIndex);
      }
      return;
    }

    setErrors({});

    if (!/^\d{13}$/.test(form.personal.nationalId || '')) {
      setFeedback('เลขบัตรประชาชนต้องมี 13 หลัก');
      setFeedbackType('error');
      return;
    }

    if (values.email !== form.credentials.email) {
      setForm(prev => ({
        ...prev,
        credentials: {
          ...prev.credentials,
          email: values.email
        }
      }));
    }


    const tradeMap = {
      'structure': 'ช่างโครงสร้าง',
      'electric': 'ช่างไฟฟ้า',
      'plumbing': 'ช่างประปา',
      'masonry': 'ช่างก่ออิฐฉาบปูน',
      'aluminum': 'ช่างประตู-หน้าต่าง', // ระวัง! ต้องมีขีดกลางตาม Database
      'ceiling': 'ช่างฝ้าเพดาน',
      'roofing': 'ช่างหลังคา',
      'tiling': 'ช่างกระเบื้อง'
    };

    // แปลงค่าเป็นภาษาไทย (ถ้าไม่มีให้เป็น 'ไม่มี')
    let thaiTechnicianType = 'ไม่มี'; // ตั้งค่าเริ่มต้นเป็น 'ไม่มี' ไว้ก่อน

    if (form.employment.role === 'worker') {
      // ถ้าเป็น Worker ค่อยไปแปลงค่าจาก tradeType
      thaiTechnicianType = tradeMap[form.employment.tradeType] || 'ไม่มี';
    } else {
      // ถ้าเป็น Foreman (fm) หรือ PM (pm) ให้เป็น 'ไม่มี' เสมอ
      thaiTechnicianType = 'ไม่มี';
    }

    let backendRole = form.employment.role;
    if (backendRole === 'fm') backendRole = 'foreman';
    if (backendRole === 'pm') backendRole = 'projectmanager';

    const payload = {
      // กลุ่มข้อมูลส่วนตัว
      citizen_id: form.personal.nationalId,
      full_name: form.personal.fullName,
      birth_date: form.personal.birthDate,
      age: age, 
      // กลุ่มข้อมูลที่อยู่
      address_id_card: form.address.addressOnId,
      province_id: form.address.province_id,     // ส่ง ID
      district_id: form.address.district_id,     // ส่ง ID
      subdistrict_id: form.address.subdistrict_id, // ส่ง ID
      zip_code: form.address.postalCode,
      address_current: form.address.currentAddress,
      phone: form.address.phone,
      // กลุ่มงาน
      role: backendRole,      // ส่งค่าภาษาไทยไป Database
      technician_type: thaiTechnicianType,
      experience_years: form.employment.experienceYears || 0,

      card_issue_date: form.identity.issueDate,
      card_expiry_date: form.identity.expiryDate,

      email: values.email,
      password: values.password
    };
    
    // Log ดูว่าส่งอะไรไปบ้าง
    console.log("Sending Register Payload:", payload);

    const endpoint = isEditing 
  ? `/api/manageusers/workers/${editingWorkerId}` // กรณีแก้ไข: ยิงไปที่ manageusers (ต้องไปเช็ค route manageusers ว่ามี path นี้ไหม)
  : '/api/register'; // กรณีสร้างใหม่: ยิงไปที่ auth (ซึ่ง index.js กำหนดให้เข้าถึงผ่าน /api + auth.js มี /register)

    const method = isEditing ? 'PUT' : 'POST';

    try {
      setSubmitting(true);
      await apiRequest(endpoint, { method, body: payload });
      setFeedback(isEditing ? 'อัปเดตข้อมูลสำเร็จ!' : 'บันทึกข้อมูลสำเร็จ!');
      setFeedbackType('success');
      setSubmitting(false);
      setTimeout(() => {
        navigate('/admin', { state: { initialTab: 'users', refreshWorkers: true } });
      }, 900);
    } catch (error) {
      const messageKey = error?.data?.message;
      const friendlyMessage = messageKey && serverErrorMessages[messageKey];
      setFeedback(friendlyMessage || error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      setFeedbackType('error');
      setSubmitting(false);
    }
  };

  const ensureStepsComplete = (targetIndex) => {
    const result = { valid: true, focusIndex: undefined, credentialValues: undefined };
    const collectedErrors = {};

    for (let index = 0; index <= targetIndex; index += 1) {
      const step = STEP_FLOW[index];
      if (!step || step.key === 'review') {
        continue;
      }

      if (step.key === 'credentials') {
        const { errors: credentialErrors, values } = validateCredentials();
        if (Object.keys(credentialErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...credentialErrors }));
          setFeedback('กรุณากรอกข้อมูลบัญชีผู้ใช้ให้ครบถ้วน');
          setFeedbackType('error');
          result.valid = false;
          result.focusIndex = index;
          return result;
        }
        setErrors(prev => {
          const next = { ...prev };
          ['email', 'password'].forEach(key => {
            if (!credentialErrors[key] && next[key]) {
              delete next[key];
            }
          });
          return next;
        });
        result.credentialValues = values;
        continue;
      }

      const missingPaths = getMissingRequiredFieldPaths(step.key);
      if (missingPaths.length > 0) {
        missingPaths.forEach(path => {
          const key = getErrorKey(path[0], path[1]);
          const message = REQUIRED_FIELD_MESSAGES[key] || 'กรุณากรอกข้อมูลให้ครบถ้วน';
          collectedErrors[key] = message;
        });
        setFeedback(`กรุณากรอกข้อมูลให้ครบถ้วนในขั้น "${step.title}"`);
        setFeedbackType('error');
        result.valid = false;
        if (result.focusIndex === undefined) {
          result.focusIndex = index;
        }
      }

      if (step.key === 'personal') {
        const nationalIdValue = form.personal.nationalId || '';
        if (nationalIdValue.length > 0 && nationalIdValue.length !== 13) {
          const nationalIdKey = getErrorKey('personal', 'nationalId');
          collectedErrors[nationalIdKey] = 'เลขบัตรประชาชนต้องมี 13 หลัก';
          setFeedback('กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก');
          setFeedbackType('error');
          result.valid = false;
          if (result.focusIndex === undefined) {
            result.focusIndex = index;
          }
        }

        const phoneValue = (form.address.phone || '').trim();
        if (phoneValue.length > 0 && phoneValue.length < MIN_PHONE_LENGTH) {
          const phoneKey = getErrorKey('address', 'phone');
          collectedErrors[phoneKey] = `เบอร์โทรศัพท์ต้องมี ${MIN_PHONE_LENGTH} หลัก`;
          setFeedback('กรุณากรอกเบอร์โทรศัพท์ให้ครบถ้วน');
          setFeedbackType('error');
          result.valid = false;
          if (result.focusIndex === undefined) {
            result.focusIndex = index;
          }
        }
      }
    }

    if (!result.valid) {
      setErrors(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          if (key.includes('.')) {
            delete next[key];
          }
        });
        return { ...next, ...collectedErrors };
      });
      return result;
    }
    setErrors(prev => {
      const hasSectionErrors = Object.keys(prev).some(key => key.includes('.'));
      if (!hasSectionErrors) {
        return prev;
      }
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (key.includes('.')) {
          delete next[key];
        }
      });
      return next;
    });
    setFeedback('');
    setFeedbackType(null);
    return result;
  };

  const handleNextStep = () => {
    const nextStepIndex = Math.min(currentStep + 1, STEP_FLOW.length - 1);

    if (isViewOnly) {
      setCurrentStep(nextStepIndex);
      return;
    }

    const validationTargetIndex = Math.max(currentStep, 0);
    const validationResult = ensureStepsComplete(validationTargetIndex);
    if (!validationResult.valid) {
      if (typeof validationResult.focusIndex === 'number') {
        setCurrentStep(validationResult.focusIndex);
      }
      return;
    }

    if (
      validationResult.credentialValues &&
      validationResult.credentialValues.email !== form.credentials.email
    ) {
      setForm(prev => ({
        ...prev,
        credentials: {
          ...prev.credentials,
          email: validationResult.credentialValues.email
        }
      }));
    }

    setCurrentStep(nextStepIndex);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleStepSelect = (stepIndex) => {
    const clampedTarget = Math.min(Math.max(stepIndex, 0), STEP_FLOW.length - 1);

    if (clampedTarget === currentStep) {
      return;
    }

    if (isViewOnly) {
      setCurrentStep(clampedTarget);
      return;
    }

    const movingForward = clampedTarget > currentStep;
    if (movingForward) {
      const validationTargetIndex = clampedTarget - 1;
      const validationResult = ensureStepsComplete(validationTargetIndex);
      if (!validationResult.valid) {
        if (typeof validationResult.focusIndex === 'number') {
          setCurrentStep(validationResult.focusIndex);
        }
        return;
      }

      if (
        validationResult.credentialValues &&
        validationResult.credentialValues.email !== form.credentials.email
      ) {
        setForm(prev => ({
          ...prev,
          credentials: {
            ...prev.credentials,
            email: validationResult.credentialValues.email
          }
        }));
      }
    }

    setCurrentStep(clampedTarget);
  };

  const handleStepKeyDown = (event, stepIndex) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStepSelect(stepIndex);
    }
  };

  const showTradeTypeSelect = form.employment.role === 'worker';

  const renderStepFields = () => {
    switch (currentStepConfig.key) {
      case 'personal':
        return (
          <div className="field-stack">
            <section className="field-section">
              <h3 className="field-section-title">ข้อมูลส่วนตัว</h3>
              <div className="field-grid two-columns">
                <div className="field">
                  <label>เลขบัตรประชาชน*</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={13}
                    value={form.personal.nationalId}
                    onChange={handleInputChange('personal', 'nationalId')}
                    placeholder="x-xxxx-xxxxx-xx-x"
                    className={errors[getErrorKey('personal', 'nationalId')] ? 'error' : ''}
                  />
                  {errors[getErrorKey('personal', 'nationalId')] && (
                    <span className="error-message">{errors[getErrorKey('personal', 'nationalId')]}</span>
                  )}
                </div>
                <div className="field">
                  <label>ชื่อ-นามสกุล*</label>
                  <input
                    type="text"
                    value={form.personal.fullName}
                    onChange={handleInputChange('personal', 'fullName')}
                    placeholder="ชื่อและนามสกุล"
                    className={errors[getErrorKey('personal', 'fullName')] ? 'error' : ''}
                  />
                  {errors[getErrorKey('personal', 'fullName')] && (
                    <span className="error-message">{errors[getErrorKey('personal', 'fullName')]}</span>
                  )}
                </div>
                <div className="field">
                  <label>วันเกิด*</label>
                  <ThaiDatePicker
                    value={form.personal.birthDate}
                    onChange={(isoDate) => updateField('personal', 'birthDate', isoDate)}
                    className={errors[getErrorKey('personal', 'birthDate')] ? 'error' : ''}
                  />
                  {errors[getErrorKey('personal', 'birthDate')] && (
                    <span className="error-message">{errors[getErrorKey('personal', 'birthDate')]}</span>
                  )}
                </div>
                <div className="field">
                  <label>อายุ (คำนวณอัตโนมัติ)</label>
                  <input type="text" value={age === '' ? '' : String(age)} readOnly placeholder="--" />
                </div>
              </div>
            </section>

            <section className="field-section">
              <h3 className="field-section-title">ข้อมูลตำแหน่งงาน</h3>
              <div className="field-grid two-columns">
                <div className="field">
                  <label>Role*</label>
                  <select
                    value={form.employment.role}
                    onChange={handleInputChange('employment', 'role')}
                    className={errors[getErrorKey('employment', 'role')] ? 'error' : ''}
                  >
                    <option value="">เลือก Role</option>
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors[getErrorKey('employment', 'role')] && (
                    <span className="error-message">{errors[getErrorKey('employment', 'role')]}</span>
                  )}
                </div>
                {showTradeTypeSelect && (
                  <div className="field">
                    <label>ประเภทช่าง*</label>
                    <select
                      value={form.employment.tradeType}
                      onChange={handleInputChange('employment', 'tradeType')}
                      className={errors[getErrorKey('employment', 'tradeType')] ? 'error' : ''}
                    >
                      <option value="">เลือกประเภทช่าง</option>
                      {tradeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors[getErrorKey('employment', 'tradeType')] && (
                      <span className="error-message">{errors[getErrorKey('employment', 'tradeType')]}</span>
                    )}
                  </div>
                )}
                <div className="field">
                  <label>ประสบการณ์ (ปี)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.employment.experienceYears}
                    onChange={handleInputChange('employment', 'experienceYears')}
                    placeholder="เช่น 5"
                  />
                </div>
              </div>
            </section>

            <section className="field-section">
              <h3 className="field-section-title">ข้อมูลที่อยู่</h3>
              <div className="field-grid one-column">
                <div className="field">
                  <label>เบอร์โทรศัพท์*</label>
                  <input
                    type="text"
                    inputMode="tel"
                    maxLength={10}
                    value={form.address.phone}
                    onChange={handleInputChange('address', 'phone')}
                    placeholder="0xx-xxx-xxxx"
                    className={errors[getErrorKey('address', 'phone')] ? 'error' : ''}
                  />
                  {errors[getErrorKey('address', 'phone')] && (
                    <span className="error-message">{errors[getErrorKey('address', 'phone')]}</span>
                  )}
                </div>
                <div className="field">
                  <label>ที่อยู่ตามบัตรประชาชน*</label>
                  <textarea
                    data-field-id="addressOnId"
                    value={form.address.addressOnId}
                    onChange={handleInputChange('address', 'addressOnId')}
                    rows={3}
                    placeholder="บ้านเลขที่ หมู่ ซอย ถนน"
                    className={errors[getErrorKey('address', 'addressOnId')] ? 'error' : ''}
                  />
                  {errors[getErrorKey('address', 'addressOnId')] && (
                    <span className="error-message">{errors[getErrorKey('address', 'addressOnId')]}</span>
                  )}
                </div>
              </div>

              <div className="field-grid two-columns address-compact-grid">

                <div className="field">
                  <label>จังหวัด*</label>
                  <Select
                    options={provinces}
                    value={selectedProvinceOpt}
                    onChange={handleProvinceChange}
                    placeholder="ค้นหาจังหวัด..."
                    isClearable
                    classNamePrefix="react-select"
                    noOptionsMessage={() => "ไม่มีตัวเลือก"}
                  />
                </div>

                <div className="field">
                  <label>อำเภอ*</label>
                  <Select
                    options={districts}
                    value={selectedDistrictOpt}
                    onChange={handleDistrictChange}
                    placeholder="เลือกอำเภอ..."
                    isDisabled={!form.address.province_id} // ล็อกถ้ายังไม่เลือกจังหวัด
                    isClearable
                    noOptionsMessage={() => "ไม่มีตัวเลือก"}
                  />
                </div>

                <div className="field">
                  <label>ตำบล*</label>
                  <Select
                    options={subdistricts}
                    value={selectedSubdistrictOpt}
                    onChange={handleSubdistrictChange}
                    placeholder="เลือกตำบล..."
                    isDisabled={!form.address.district_id} // ล็อกถ้ายังไม่เลือกอำเภอ
                    isClearable
                    noOptionsMessage={() => "ไม่มีตัวเลือก"}
                  />
                </div>

                {/* รหัสไปรษณีย์ (อันเดิม แปะไว้ต่อท้ายเพื่อให้จัดหน้าสวย) */}
                <div className="field">
                  <label>รหัสไปรษณีย์</label>
                  <input
                    type="text"
                    value={form.address.postalCode}
                    readOnly // ห้ามแก้ เพราะดึงมาจากตำบลอัตโนมัติ
                    placeholder="xxxxx"
                  />
                </div>
              </div>

              <div className="field-grid one-column">
                <div className="field">
                  <label>ที่อยู่ปัจจุบัน*</label>
                  <textarea
                    data-field-id="currentAddress"
                    value={form.address.currentAddress}
                    onChange={handleInputChange('address', 'currentAddress')}
                    rows={3}
                    placeholder="รายละเอียดที่อยู่ปัจจุบัน"
                    className={errors[getErrorKey('address', 'currentAddress')] ? 'error' : ''}
                  />
                  {errors[getErrorKey('address', 'currentAddress')] && (
                    <span className="error-message">{errors[getErrorKey('address', 'currentAddress')]}</span>
                  )}
                </div>
              </div>
            </section>

            <section className="field-section">
              <h3 className="field-section-title">ข้อมูลบัตรประชาชน</h3>
              <div className="field-grid two-columns">
                <div className="field">
                  <label>วันออกบัตร*</label>
                  <ThaiDatePicker
                    value={form.identity.issueDate}
                    onChange={(isoDate) => updateField('identity', 'issueDate', isoDate)}
                    className={errors[getErrorKey('identity', 'issueDate')] ? 'error' : ''}
                  />
                  {errors[getErrorKey('identity', 'issueDate')] && (
                    <span className="error-message">{errors[getErrorKey('identity', 'issueDate')]}</span>
                  )}
                </div>
                <div className="field">
                  <label>วันหมดอายุบัตร*</label>
                  <ThaiDatePicker
                    value={form.identity.expiryDate}
                    onChange={(isoDate) => updateField('identity', 'expiryDate', isoDate)}
                    className={errors[getErrorKey('identity', 'expiryDate')] ? 'error' : ''}
                  />
                  {errors[getErrorKey('identity', 'expiryDate')] && (
                    <span className="error-message">{errors[getErrorKey('identity', 'expiryDate')]}</span>
                  )}
                </div>
              </div>
            </section>
          </div>
        );
      case 'credentials':
        return (
          <div className="account-step">
            <section className="account-note">
              <h3>ขั้นตอนนี้ทำอะไร?</h3>
              <p>
                เราจะสร้างบัญชีเข้าสู่ระบบโดยใช้อีเมลและรหัสผ่านสำหรับพนักงาน ผู้ใช้งานสามารถเปลี่ยนรหัสผ่านได้ภายหลัง
                เพื่อความปลอดภัย กรุณากำหนดรหัสผ่านอย่างน้อย 8 ตัวอักษร และผสมตัวเลขหรืออักขระพิเศษ
              </p>
            </section>

            <div className="account-form">
              <div className="field-grid one-column credentials-grid">
                <div className="field">
                  <label>อีเมลสำหรับเข้าสู่ระบบ</label>
                  <input
                    data-field-id="accountEmail"
                    type="email"
                    value={form.credentials.email}
                    onChange={handleInputChange('credentials', 'email')}
                    placeholder="example@mail.com"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                  <span className="help-text">หากไม่มีอีเมลบริษัท ให้สร้างอีเมลชั่วคราวสำหรับเข้าระบบ</span>
                </div>
                <div className="field">
                  <label>รหัสผ่าน</label>
                  <div className="password-input has-generator">
                    <input
                      type="text"
                      value={form.credentials.password}
                      onChange={handleInputChange('credentials', 'password')}
                      placeholder="********"
                      className={errors.password ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="generate-password-btn"
                      onClick={handleGeneratePassword}
                      aria-label="สุ่มรหัสผ่าน"
                    >
                      สุ่ม
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                  <span className="help-text">รหัสผ่านอย่างน้อย 8 ตัวอักษร แนะนำให้ผสมตัวเลขและอักขระพิเศษ</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="review-step">
            <section className="review-intro">
              <h3>ตรวจสอบข้อมูลก่อนยืนยัน</h3>
              <p>ตรวจสอบรายละเอียดทุกส่วนให้ถูกต้อง หากข้อมูลใดไม่ถูกต้องสามารถกดปุ่มแก้ไขเพื่อกลับไปแก้ในขั้นตอนก่อนหน้า</p>
            </section>

            <div className="review-grid">
              <div className="review-unified-card">
                <div className="review-unified-header">
                  <div className="review-unified-heading">
                    <h4>ข้อมูลการสมัครทั้งหมด</h4>
                    <p>ทบทวนรายละเอียดก่อนยืนยัน ระบบสามารถย้อนกลับไปแก้ไขได้ทุกขั้นตอน</p>
                  </div>
                  {!isViewOnly && (
                    <button
                      type="button"
                      className="review-unified-edit"
                      onClick={() => handleStepSelect(0)}
                    >
                      แก้ไข
                    </button>
                  )}
                </div>
                <div className="review-unified-sections">
                  {reviewSections.map(section => (
                    <div key={section.key} className="review-section">
                      <h5 className="review-section-title">{section.title}</h5>
                      <dl className="review-list">
                        {section.items.map(item => (
                          <div key={`${section.key}-${item.label}`} className="review-list-row">
                            <dt>{item.label}</dt>
                            <dd>{item.value || 'ไม่ระบุ'}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-wrapper">
        <div className="registration-nav">
          <button type="button" onClick={handleBack}>กลับหน้าแดชบอร์ด</button>
        </div>
        <header className="registration-header">
          <h1>แบบฟอร์มลงทะเบียนพนักงาน</h1>
          <p>เก็บข้อมูลสำคัญสำหรับ HR, การจัดทีม และความปลอดภัยในการทำงาน</p>
        </header>

        {feedback && (
          <div
            className={`registration-feedback${feedbackType ? ` ${feedbackType}` : ''}`}
            role="status"
          >
            {feedback}
          </div>
        )}

        <div className="registration-content">
          <form onSubmit={handleSubmit}>
            <section className="registration-section">
              <div className="section-header">
                <h2>{currentStepConfig.title}</h2>
                <p>{currentStepConfig.description}</p>
              </div>
              {renderStepFields()}
            </section>

            <div className="registration-actions">
              <div className="wizard-nav-buttons">
                {!isFirstStep && (
                  <button type="button" className="secondary" onClick={handlePreviousStep}>
                    ย้อนกลับ
                  </button>
                )}
                {!isLastStep && (
                  <button type="button" className="primary" onClick={handleNextStep}>
                    ไปหน้าถัดไป
                  </button>
                )}
                {isLastStep && !isViewOnly && (
                  <button type="submit" className="primary" disabled={submitting}>
                    {submitting
                      ? 'กำลังบันทึก...'
                      : (isEditing ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูลเบื้องต้น')}
                  </button>
                )}
              </div>
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  isViewOnly
                    ? navigate('/admin', { state: { initialTab: 'users' } })
                    : resetForm()
                }
                disabled={submitting}
              >
                {isViewOnly ? 'ย้อนกลับ' : 'ล้างฟอร์ม'}
              </button>
            </div>
          </form>

          <aside className="registration-progress-card">
            <div className="progress-card-header">
              <h3>ความคืบหน้าการสมัคร</h3>
              <span>{progressPercent}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <ul className="progress-step-list">
              {progressSections.map((section, index) => {
                const stepClassNames = [
                  'progress-step',
                  section.completed ? 'completed' : '',
                  !section.completed && section.progress > 0 ? 'in-progress' : '',
                  section.isActive ? 'active' : ''
                ]
                  .filter(Boolean)
                  .join(' ');
                let statusLabel;
                if (section.key === 'review') {
                  if (section.completed) {
                    statusLabel = 'พร้อมยืนยัน';
                  } else if (section.isActive) {
                    statusLabel = 'กำลังตรวจสอบ';
                  } else {
                    statusLabel = 'รอตรวจสอบ';
                  }
                } else {
                  statusLabel = section.completed
                    ? 'ครบถ้วน'
                    : section.isActive
                      ? 'กำลังกรอก'
                      : `${section.percent}%`;
                }
                return (
                  <li
                    key={`${section.label}-${index}`}
                    className={stepClassNames}
                    role="button"
                    tabIndex={0}
                    aria-current={section.isActive ? 'step' : undefined}
                    onClick={() => handleStepSelect(index)}
                    onKeyDown={(event) => handleStepKeyDown(event, index)}
                  >
                    <span className="step-dot" aria-hidden="true" />
                    <div className="step-content">
                      <span className="step-label">{section.label}</span>
                      <span className="step-status">{statusLabel}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkerRegistration;