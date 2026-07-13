import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { theme } from '../../shared/core/theme';
import StatsCard from '../../shared/components/StatsCard';
import DatasetList from '../../shared/components/DatasetList';
import ExportPanel from '../../shared/components/ExportPanel';
import { generateJSON, generateXML, generatePrintableHTML } from '../../shared/core/exporter';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';

// ── Component: Full Public Dashboard (Root /) ──────────────────────
// This is your EXACT existing dashboard logic, now inside React.
function PublicDashboard() {
  const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3080/api' 
    : '/api'; // Use relative path in production

  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/datasets`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setDatasets(json.data);
          if (json.data.length > 0) setSelectedDataset(json.data[0]);
        }
      })
      .catch(err => console.error('Failed to fetch datasets:', err))
      .finally(() => setLoading(false));
  }, []);

  const triggerDownload = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = (format) => {
    if (!selectedDataset) return;
    const exportData = [selectedDataset];
    let content, filename, mime;

    if (format === 'json') {
      content = generateJSON(exportData);
      filename = 'ins-stats.json';
      mime = 'application/json';
    } else if (format === 'xml') {
      content = generateXML(exportData);
      filename = 'ins-stats.xml';
      mime = 'application/xml';
    } else if (format === 'pdf') {
      const html = generatePrintableHTML(exportData);
      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
      win.print();
      return;
    }
    triggerDownload(content, filename, mime);
  };

  return (
    <div style={{
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamily,
      minHeight: '100vh',
      padding: theme.spacing.xl,
    }}>
      <header style={{ marginBottom: theme.spacing.xl, textAlign: 'center' }}>
        <h1 style={{ fontSize: theme.typography.size.xl, color: theme.colors.primary, margin: 0 }}>
          INS Tunisia Statistics Portal
        </h1>
        <p style={{ color: theme.colors.textMuted }}>Unified Cross-Platform Analytics Dashboard</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
        <StatsCard label="Inflation Rate" value="7.5%" subtext="Updated Feb 2024" trend={-0.2} />
        <StatsCard label="GDP Growth" value="1.2%" subtext="Q4 2023" trend={0.5} />
        <StatsCard label="Unemployment" value="16.4%" subtext="National" trend={1.1} />
        <StatsCard label="Population" value="12.5M" subtext="Estimated" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: theme.spacing.xl }}>
        <section>
          {loading ? (
            <p>Loading statistics...</p>
          ) : (
            <DatasetList 
              datasets={datasets} 
              onSelect={setSelectedDataset} 
              selectedId={selectedDataset?.id} 
            />
          )}
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <div style={{ backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}` }}>
            <h3 style={{ marginTop: 0, fontSize: theme.typography.size.md }}>Selected Data</h3>
            <p style={{ fontSize: theme.typography.size.sm, color: theme.colors.textMuted }}>
              {selectedDataset?.description}
            </p>
          </div>
          
          <ExportPanel 
            onExportJSON={() => handleExport('json')}
            onExportXML={() => handleExport('xml')}
            onExportPDF={() => handleExport('pdf')}
          />
        </aside>
      </div>
    </div>
  );
}

// ── Component: Protected Admin Route ─────────────────────────
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('authUser') || '{}');

  if (!token || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ── Main App Router ──────────────────────────────────────────
function App() {
  return (
    <Routes>
      {/* Public Root Dashboard */}
      <Route path="/" element={<PublicDashboard />} />
      
      {/* Legal Pages (Iframes for static HTML) */}
      <Route path="/privacy" element={
        <iframe src="/privacy.html" style={{width:'100%', height:'100vh', border:'none'}} title="Privacy" />
      } />
      <Route path="/terms" element={
        <iframe src="/terms.html" style={{width:'100%', height:'100vh', border:'none'}} title="Terms" />
      } />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Admin */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } 
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
