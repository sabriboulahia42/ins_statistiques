import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import '../../styles/AdminPanels.css';

export default function SettingsPanel() {
  const { token } = useAuth();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, [token]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      
      if (!res.ok) throw new Error('Failed to load settings');
      
      const data = await res.json();
      setSettings(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!res.ok) throw new Error('Failed to save settings');
      
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="panel-loading">Loading settings...</div>;

  return (
    <div className="admin-panel settings-panel">
      <div className="panel-header">
        <h2>⚙️ Portal Settings</h2>
      </div>

      {error && <div className="error-alert">{error}</div>}
      {success && <div className="success-alert">{success}</div>}

      <form onSubmit={handleSaveSettings} className="settings-form">
        <div className="settings-section">
          <h3>General Settings</h3>
          
          <div className="form-group">
            <label>Portal Title</label>
            <input 
              type="text"
              placeholder="INS Statistics Portal"
              value={settings.portalTitle || ''}
              onChange={e => setSettings({
                ...settings,
                portalTitle: e.target.value
              })}
            />
          </div>

          <div className="form-group">
            <label>Portal Description</label>
            <textarea 
              placeholder="Description of the portal"
              value={settings.portalDescription || ''}
              onChange={e => setSettings({
                ...settings,
                portalDescription: e.target.value
              })}
              rows="4"
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Features</h3>
          
          <div className="form-group checkbox">
            <label>
              <input 
                type="checkbox"
                checked={settings.enableExport !== false}
                onChange={e => setSettings({
                  ...settings,
                  enableExport: e.target.checked
                })}
              />
              Enable Data Export
            </label>
          </div>

          <div className="form-group checkbox">
            <label>
              <input 
                type="checkbox"
                checked={settings.enableAnalytics !== false}
                onChange={e => setSettings({
                  ...settings,
                  enableAnalytics: e.target.checked
                })}
              />
              Enable Analytics
            </label>
          </div>

          <div className="form-group checkbox">
            <label>
              <input 
                type="checkbox"
                checked={settings.enableSSO !== false}
                onChange={e => setSettings({
                  ...settings,
                  enableSSO: e.target.checked
                })}
              />
              Enable SSO Login
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>API Configuration</h3>
          
          <div className="form-group">
            <label>API Rate Limit (requests/minute)</label>
            <input 
              type="number"
              min="10"
              max="1000"
              value={settings.apiRateLimit || 60}
              onChange={e => setSettings({
                ...settings,
                apiRateLimit: parseInt(e.target.value)
              })}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
