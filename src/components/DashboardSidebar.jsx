import React from 'react';
import '../styles/Dashboard.css';

export default function DashboardSidebar({ activeTab, onTabChange, onLogout }) {
  const menuItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'users', icon: '👥', label: 'Users & Roles' },
    { id: 'data', icon: '📁', label: 'Data Management' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🇹🇳</span>
          <div>
            <div className="logo-text">INS</div>
            <div className="logo-subtext">Admin</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout-sidebar" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
