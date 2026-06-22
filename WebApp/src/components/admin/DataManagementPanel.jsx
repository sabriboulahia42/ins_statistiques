import React, { useState } from 'react';
import '../../styles/AdminPanels.css';

export default function DataManagementPanel() {
  const [datasets, setDatasets] = useState([
    { id: 1, name: 'Agriculture Production 2023', size: '12.4 MB', records: 5234, lastUpdated: '2024-03-15' },
    { id: 2, name: 'Tourism Statistics 2023', size: '8.9 MB', records: 3456, lastUpdated: '2024-03-14' },
    { id: 3, name: 'Industry Data 2023', size: '15.2 MB', records: 7890, lastUpdated: '2024-03-13' },
    { id: 4, name: 'Trade Information 2023', size: '6.7 MB', records: 2345, lastUpdated: '2024-03-12' }
  ]);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      const newDatasets = selectedFiles.map((file, i) => ({
        id: datasets.length + i + 1,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        records: Math.floor(Math.random() * 10000),
        lastUpdated: new Date().toISOString().split('T')[0]
      }));
      
      setDatasets([...datasets, ...newDatasets]);
      setSelectedFiles([]);
      setUploading(false);
    }, 1500);
  };

  const handleDeleteDataset = (id) => {
    if (window.confirm('Are you sure you want to delete this dataset?')) {
      setDatasets(datasets.filter(d => d.id !== id));
    }
  };

  return (
    <div className="admin-panel data-management-panel">
      <div className="panel-header">
        <h2>📁 Data Management</h2>
      </div>

      <section className="data-upload-section">
        <h3>Upload New Dataset</h3>
        <div className="upload-area">
          <div className="upload-input-wrapper">
            <input 
              type="file"
              id="file-input"
              multiple
              onChange={handleFileSelect}
              accept=".json,.xml,.csv"
            />
            <label htmlFor="file-input" className="upload-label">
              <span className="upload-icon">📤</span>
              <p>Drag files here or click to select</p>
              <small>Supported: JSON, XML, CSV</small>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h4>Selected Files ({selectedFiles.length}):</h4>
              <ul>
                {selectedFiles.map((file, i) => (
                  <li key={i}>
                    📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
              <button 
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Files'}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="datasets-section">
        <h3>Active Datasets ({datasets.length})</h3>
        <div className="datasets-table-container">
          <table className="datasets-table">
            <thead>
              <tr>
                <th>Dataset Name</th>
                <th>Size</th>
                <th>Records</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map(dataset => (
                <tr key={dataset.id}>
                  <td>
                    <span className="dataset-icon">📊</span>
                    {dataset.name}
                  </td>
                  <td>{dataset.size}</td>
                  <td>{dataset.records.toLocaleString()}</td>
                  <td>{dataset.lastUpdated}</td>
                  <td className="actions">
                    <button className="btn-small btn-view">👁️</button>
                    <button className="btn-small btn-download">⬇️</button>
                    <button 
                      className="btn-small btn-delete"
                      onClick={() => handleDeleteDataset(dataset.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="backup-section">
        <h3>🔒 Backup & Export</h3>
        <div className="backup-actions">
          <button className="btn btn-secondary">
            📥 Create Full Backup
          </button>
          <button className="btn btn-secondary">
            ⬇️ Export All Datasets
          </button>
          <button className="btn btn-secondary">
            📋 Generate Report
          </button>
        </div>
      </section>
    </div>
  );
}
