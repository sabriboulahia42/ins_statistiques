import React, { useState, useEffect } from 'react';
import '../../styles/AdminPanels.css';

export default function AnalyticsPanel() {
  const [stats, setStats] = useState({
    dailyUsers: [
      { date: 'Mon', count: 45 },
      { date: 'Tue', count: 62 },
      { date: 'Wed', count: 58 },
      { date: 'Thu', count: 73 },
      { date: 'Fri', count: 89 },
      { date: 'Sat', count: 42 },
      { date: 'Sun', count: 51 }
    ],
    exportStats: {
      pdf: 234,
      docx: 189,
      pptx: 145,
      json: 156,
      xml: 98
    },
    topDatasets: [
      { name: 'Agriculture Production', views: 1234, exports: 456 },
      { name: 'Tourism Statistics', views: 987, exports: 345 },
      { name: 'Industry Data', views: 756, exports: 234 },
      { name: 'Trade Information', views: 654, exports: 189 },
      { name: 'Demographics', views: 543, exports: 156 }
    ]
  });

  return (
    <div className="admin-panel analytics-panel">
      <div className="panel-header">
        <h2>📈 Analytics Dashboard</h2>
      </div>

      <div className="analytics-grid">
        <section className="analytics-card">
          <h3>Daily Active Users (Last 7 Days)</h3>
          <div className="chart-placeholder">
            <div className="bar-chart">
              {stats.dailyUsers.map((day, i) => (
                <div key={i} className="bar-item">
                  <div 
                    className="bar" 
                    style={{ height: `${(day.count / 100) * 100}%` }}
                  />
                  <span className="bar-label">{day.date}</span>
                  <span className="bar-value">{day.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="analytics-card">
          <h3>Exports by Format (Last 30 Days)</h3>
          <ul className="export-list">
            {Object.entries(stats.exportStats).map(([format, count]) => (
              <li key={format}>
                <span className="format-label">{format.toUpperCase()}</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${(count / 300) * 100}%` }}
                  />
                </div>
                <span className="format-count">{count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="analytics-card full-width">
          <h3>Top Datasets</h3>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Dataset Name</th>
                <th>Views</th>
                <th>Exports</th>
                <th>Engagement</th>
              </tr>
            </thead>
            <tbody>
              {stats.topDatasets.map((dataset, i) => (
                <tr key={i}>
                  <td>{dataset.name}</td>
                  <td>{dataset.views}</td>
                  <td>{dataset.exports}</td>
                  <td>
                    <div className="engagement-bar">
                      <div 
                        className="engagement-fill"
                        style={{ width: `${(dataset.exports / dataset.views) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
