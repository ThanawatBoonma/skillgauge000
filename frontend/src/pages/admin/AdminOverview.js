import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminOverview.css';
import { apiRequest } from '../../utils/api';
import StatCard from './components/StatCard';

const BRANCH_OPTIONS = [
  { value: 'structure', label: 'ช่างโครงสร้าง' },
  { value: 'plumbing', label: 'ช่างประปา' },
  { value: 'roofing', label: 'ช่างหลังคา' },
  { value: 'masonry', label: 'ช่างก่ออิฐฉาบปูน' },
  { value: 'aluminum', label: 'ช่างประตูหน้าต่างอลูมิเนียม' },
  { value: 'ceiling', label: 'ช่างฝ้าเพดาล' },
  { value: 'electric', label: 'ช่างไฟฟ้า' },
  { value: 'tiling', label: 'ช่างกระเบื้อง' }
];

const AdminOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    totalForemen: 0,
    totalPMs: 0,
    branchCounts: {}
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const users = await apiRequest('/api/manageusers/pulluser');
        
        if (Array.isArray(users)) {
          // --- แก้ไขจุดนี้: นับจำนวนตามค่า ENUM ของ Database เป๊ะๆ ---
          
          // 1. Worker (ตาม DB: 'worker')
          const workers = users.filter(u => u.role === 'worker').length;

          // 2. Foreman (ตาม DB: 'foreman')
          const foremen = users.filter(u => u.role === 'foreman').length;

          // 3. Project Manager (ตาม DB: 'projectmanager' *ไม่มีขีดล่าง*)
          const pms = users.filter(u => u.role === 'projectmanager').length;

          // 4. นับจำนวนตามทักษะ
          const counts = {};
          BRANCH_OPTIONS.forEach(branch => counts[branch.value] = 0);

          users.forEach(u => {
            const type = u.technician_type;
            // เช็คเทียบกับ value หรือ label ใน BRANCH_OPTIONS
            const match = BRANCH_OPTIONS.find(b => b.value === type || b.label === type);
            if (match) {
              counts[match.value] = (counts[match.value] || 0) + 1;
            }
          });

          setStats({
            totalUsers: users.length,
            totalWorkers: workers,
            totalForemen: foremen,
            totalPMs: pms,
            branchCounts: counts
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // คำนวณ %
  const calculatePercentage = (count) => {
    if (stats.totalUsers === 0) return 0;
    return Math.round((count / stats.totalUsers) * 100);
  };

  const workerPercent = calculatePercentage(stats.totalWorkers);
  const foremanPercent = calculatePercentage(stats.totalForemen);
  const pmPercent = calculatePercentage(stats.totalPMs);

  const donutStyle = {
    background: `conic-gradient(
      #f7c65f 0% ${workerPercent}%, 
      #7cc576 ${workerPercent}% ${workerPercent + foremanPercent}%, 
      #6b8eea ${workerPercent + foremanPercent}% 100%
    )`
  };

  if (loading) return <div className="loading-state">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="admin-overview">
      <header className="overview-header">
        <h1>ภาพรวมระบบ</h1>
        <p className="overview-subtitle">ติดตามจำนวนบุคลากรและสัดส่วนตำแหน่งงาน</p>
      </header>

      <section className="stats-grid">
        <StatCard title="User ทั้งหมด" count={stats.totalUsers} unit="คน" icon="👥" color="blue" trend="บุคลากรในระบบ" />
        <StatCard title="Worker ทั้งหมด" count={stats.totalWorkers} unit="คน" icon="👷" color="yellow" trend="ช่างปฏิบัติงาน" />
        <StatCard title="Foreman ทั้งหมด" count={stats.totalForemen} unit="คน" icon="👷‍♂️" color="green" trend="หัวหน้างาน" />
        <StatCard title="Project Manager" count={stats.totalPMs} unit="คน" icon="👔" color="purple" trend="ผู้จัดการโครงการ" />
      </section>

      <div className="dashboard-widgets">
        <section className="widget-card">
          <div className="widget-header">
            <h3>สัดส่วนพนักงานตามตำแหน่ง</h3>
          </div>
          <div className="widget-content chart-container">
            <div className="donut-wrapper">
              <div className="donut" style={donutStyle}>
                <div className="donut-hole">
                  <span className="donut-total">{stats.totalUsers}</span>
                  <span className="donut-label">คนทั้งหมด</span>
                </div>
              </div>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="dot dot-yellow"></span>
                <span className="label">Worker (ช่าง)</span>
                <span className="value">{stats.totalWorkers} ({workerPercent}%)</span>
              </div>
              <div className="legend-item">
                <span className="dot dot-green"></span>
                <span className="label">Foreman (หัวหน้า)</span>
                <span className="value">{stats.totalForemen} ({foremanPercent}%)</span>
              </div>
              <div className="legend-item">
                <span className="dot dot-blue"></span>
                <span className="label">Project Manager</span>
                <span className="value">{stats.totalPMs} ({pmPercent}%)</span>
              </div>
            </div>
          </div>
        </section>

        <section className="widget-card">
          <div className="widget-header">
            <h3>จำนวนพนักงานแยกตามทักษะ</h3>
            <span className="subtitle">แบ่งตามสาขาและระดับ</span>
          </div>
          <div className="widget-content branch-list-container">
            {BRANCH_OPTIONS.map((branch) => {
              const count = stats.branchCounts[branch.value] || 0;
              const barWidth = stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0;
              
              return (
                <div key={branch.value} className="branch-item">
                  <div className="branch-info">
                    <span className="branch-name">{branch.label}</span>
                    <span className="branch-count">{count} คน</span>
                  </div>
                  <div className="branch-bar-bg">
                    <div 
                      className="branch-bar-fill" 
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminOverview;