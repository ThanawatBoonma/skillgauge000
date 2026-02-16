import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../Dashboard.css';
import './AdminUsersTable.css';
import { apiRequest } from '../../utils/api';

const AdminUsersTable = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- 1. โหลดข้อมูลจาก API เก่า ---
  const loadWorkers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // เรียก API เก่า
      const data = await apiRequest('/api/manageusers/pulluser');
      setWorkers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load workers', err);
      setError('ไม่สามารถโหลดข้อมูลพนักงานได้');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  // --- 2. ฟังก์ชันลบ 
const handleDelete = async (id) => {
    if (!id) return;

    // 2. เปลี่ยน window.confirm เป็น Swal.fire
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลพนักงานนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', 
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก'
    });

    if (!result.isConfirmed) return;

    try {
      await apiRequest(`/api/manageusers/deleteuser/${id}`, { method: 'DELETE' });
      
      setWorkers(prev => prev.filter(w => w.id !== id));
      
      // แจ้งเตือนเมื่อลบสำเร็จ
      Swal.fire(
        'ลบเรียบร้อย!',
        'ข้อมูลพนักงานถูกลบออกจากระบบแล้ว',
        'success'
      );
    } catch (err) {
      console.error('Failed to delete worker', err);
      // แจ้งเตือนเมื่อลบผิดพลาด
      Swal.fire(
        'เกิดข้อผิดพลาด',
        err.message || 'ไม่สามารถลบข้อมูลพนักงานได้',
        'error'
      );
    }
  };

  // --- 3. ฟังก์ชันนำทาง ---
  const handleEdit = (worker) => {
    navigate('/admin/view-edit-user', { state: { editWorker: worker, viewOnly: false } });
  };

  const handleView = (worker) => {
    navigate('/admin/view-edit-user', { state: { editWorker: worker, viewOnly: true } });
  };

  // --- Filter Logic ---
  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      const searchLower = searchTerm.toLowerCase();
      const name = worker.full_name || ''; 
      const email = worker.email || '';
      const phone = worker.phone || '';

      const matchesSearch = name.toLowerCase().includes(searchLower) ||
                            email.toLowerCase().includes(searchLower) ||
                            phone.includes(searchLower);

      const matchesRole = filterRole === 'all' || worker.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [workers, searchTerm, filterRole]);

  return (
    <div className="admin-users-table">
      {/* --- ส่วนหัวที่เอากลับมา --- */}
      <header className="admin-users-table__header">
        <h2>จัดการข้อมูลและบัญชีพนักงาน</h2>
        <p>
          แยกขั้นตอนการเก็บข้อมูลพนักงานและการสร้างบัญชีเข้าสู่ระบบ เพื่อให้ HR เลือกทำงานได้ตามความจำเป็น
        </p>
      </header>

      {/* --- การ์ดปุ่มลงทะเบียนที่เอากลับมา --- */}
      <div className="admin-users-table__cards">
        <article className="admin-users-card admin-users-card--primary">
          <h3>แบบฟอร์มลงทะเบียนพนักงานละเอียด</h3>
          <p>
            เก็บข้อมูลสำคัญครบทุกหมวด ทั้งข้อมูลส่วนตัว เอกสาร ทักษะ ความปลอดภัย และบัญชีธนาคาร เพื่อเตรียมเอกสาร HR ได้ทันที
          </p>
          <button
            type="button"
            className="admin-users-card__button admin-users-card__button--primary"
            onClick={() => navigate('/admin/worker-registration')}
          >
            เปิดแบบฟอร์มลงทะเบียน
          </button>
        </article>
      </div>

      {/* --- ส่วนตารางแสดงผล --- */}
      <section className="admin-workers-section">
        <div className="admin-workers-section__header">
          <h3>รายชื่อพนักงานทั้งหมด</h3>
          <div className="admin-workers-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล, หรือเบอร์โทร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">ทุกตำแหน่ง</option>
              <option value="worker">Worker (ช่าง)</option>
              <option value="foreman">Foreman (หัวหน้างาน)</option>
              <option value="project_manager">Project Manager</option>
            </select>
          </div>
        </div>

        <div className="admin-workers-table">
          {/* Header ของตาราง */}
          <div className="admin-workers-table__header">
            <div className="col col-name">ชื่อ-นามสกุล</div>
            <div className="col col-email">อีเมล</div>
            <div className="col col-role-badge">ตำแหน่ง</div>
            <div className="col col-phone">เบอร์โทร</div>
            <div className="col col-tech">ประเภทช่าง</div>
            <div className="col col-actions">จัดการ</div>
          </div>

          {/* Body ของตาราง */}
          <div className="admin-workers-table__body">
            {loading ? (
              <div className="empty-state">กำลังโหลดข้อมูล...</div>
            ) : error ? (
              <div className="empty-state">{error}</div>
            ) : filteredWorkers.length === 0 ? (
              <div className="empty-state">ไม่พบข้อมูล</div>
            ) : (
              filteredWorkers.map(worker => (
                <div key={worker.id} className="admin-workers-table__row">
                  <div className="col col-name" data-label="ชื่อ-นามสกุล">
                    <span className="worker-name">{worker.full_name || 'ไม่ระบุชื่อ'}</span>
                  </div>
                  <div className="col col-email" data-label="อีเมล">
                    {worker.email || '-'}
                  </div>
                  <div className="col col-role-badge" data-label="ตำแหน่ง">
                    <span className={`role-tag role-${worker.role}`}>
                      {worker.role || '-'}
                    </span>
                  </div>
                  <div className="col col-phone" data-label="เบอร์โทร">
                    {worker.phone || '-'}
                  </div>
                  <div className="col col-tech" data-label="ประเภทช่าง">
                    {worker.technician_type || '-'}
                  </div>
                  <div className="col col-actions" data-label="จัดการ">
                    <button type="button" className="action-btn action-btn--view" title="ดูรายละเอียด" onClick={() => handleView(worker)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>
                    </button>
                    <button type="button" className="action-btn action-btn--edit" title="แก้ไข" onClick={() => handleEdit(worker)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>
                    </button>
                    <button type="button" className="action-btn action-btn--delete" title="ลบ" onClick={() => handleDelete(worker.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminUsersTable;