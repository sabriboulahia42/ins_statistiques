import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import UsersPanel from '../components/admin/UsersPanel';
import SettingsPanel from '../components/admin/SettingsPanel';
import AnalyticsPanel from '../components/admin/AnalyticsPanel';
import DataManagementPanel from '../components/admin/DataManagementPanel';
import '../styles/Dashboard.css';

export default function AdminDashboard() {
  const { user, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalExports: 0,
    totalRequests: 0
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      window.location.href = '/login';
      return;
    }

    // Redirect to public site if not admin
    if (!isAdmin) {
      window.location.href = '/';
      return;
    }

    // Load dashboard stats
    loadStats();
  }, [user, isAdmin]);

  const loadStats = async () => {
    try {
      // Mock stats - replace with real API calls
      setStats({
        totalUsers: 12,
        activeUsers: 8,
        totalExports: 234,
        totalRequests: 5432
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <DashboardSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Admin Dashboard</h1>
            <div className="header-user">
              <span>{user.name || user.email}</span>
              <button className="btn-logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="tab-panel overview-panel">
              <div className="stats-grid">
                <StatCard 
                  icon="👥"
                  label="Total Users" 
                  value={stats.totalUsers}
                />
                <StatCard 
                  icon="🟢"
                  label="Active Users" 
                  value={stats.activeUsers}
                />
                <StatCard 
                  icon="📥"
                  label="Total Exports" 
                  value={stats.totalExports}
                />
                <StatCard 
                  icon="📊"
                  label="API Requests" 
                  value={stats.totalRequests}
                />
              </div>

              <div className="overview-sections">
                <section className="overview-card">
                  <h3>🔐 Security</h3>
                  <ul className="checklist">
                    <li>✅ JWT Authentication enabled</li>
                    <li>✅ OAuth2 / Google SSO configured</li>
                    <li>✅ Role-based access control active</li>
                    <li>✅ CORS protection enabled</li>
                  </ul>
                </section>

                <section className="overview-card">
                  <h3>📈 Latest Updates</h3>
                  <ul className="activity-list">
                    <li>Admin dashboard deployed</li>
                    <li>OAuth2 SSO system integrated</li>
                    <li>User management module added</li>
                    <li>Settings panel configured</li>
                  </ul>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'users' && <UsersPanel />}
          {activeTab === 'data' && <DataManagementPanel />}
          {activeTab === 'settings' && <SettingsPanel />}
          {activeTab === 'analytics' && <AnalyticsPanel />}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
