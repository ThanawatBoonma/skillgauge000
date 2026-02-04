import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const WKSidebar = ({ user }) => {
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
        <div style={{ marginBottom: '20px', paddingLeft: '20px', color: '#94a3b8', fontSize: '12px' }}>WORKER</div>

        <button style={getStyle('/worker')} onClick={() => navigate('/worker', { state: { user } })}>
          My Dashboard
        </button>

        <button style={getStyle('/skill-assessment')} onClick={() => navigate('/skill-assessment', { state: { user } })}>
          Skill Test
        </button>
      </nav>
    </aside>
  );
};

export default WKSidebar;