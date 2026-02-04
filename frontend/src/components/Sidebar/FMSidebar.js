import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FMSidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const btnStyle = {
    display: 'block', width: '100%', textAlign: 'left',
    padding: '12px 20px', background: 'none', border: 'none',
    color: '#64748b', fontSize: '15px', fontWeight: '500',
    cursor: 'pointer', marginBottom: '8px', borderRadius: '8px',
    transition: 'all 0.2s'
  };
  const activeBtnStyle = { ...btnStyle, background: '#0f172a', color: 'white' };
  const getStyle = (path) => currentPath === path ? activeBtnStyle : btnStyle;

  return (
    <aside className="dash-sidebar">
      <nav className="menu">
        <div style={{ marginBottom: '20px', paddingLeft: '20px', color: '#94a3b8', fontSize: '12px' }}>FOREMAN</div>

        <button style={getStyle('/foreman')} onClick={() => navigate('/foreman', { state: { user } })}>
          Dashboard
        </button>

        <button style={getStyle('/foreman/assessment')} onClick={() => navigate('/foreman/assessment', { state: { user } })}>
          Assessment
        </button>

        <button style={getStyle('/foreman-reports')} onClick={() => navigate('/foreman-reports', { state: { user } })}>
          Reports
        </button>
      </nav>
    </aside>
  );
};

export default FMSidebar;