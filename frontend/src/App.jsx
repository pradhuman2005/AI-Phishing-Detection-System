import React, { useState, useEffect } from 'react';
import './styles/dashboard.css';

export default function App() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total_scanned_emails: 0, phishing_count: 0, suspicious_count: 0, safe_count: 0, average_risk_score: 0 });
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    // Fetch stats and reports from backend API
    fetch('http://localhost:8000/api/v1/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {
        // Fallback demo data
        setStats({ total_scanned_emails: 2, phishing_count: 1, suspicious_count: 0, safe_count: 1, average_risk_score: 48.5 });
      });

    fetch('http://localhost:8000/api/v1/reports')
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(() => {
        setReports([
          {
            report_id: "rep_001",
            email_id: "1a123dae29b122f6",
            subject: "Urgent: Your Account Verification Is Required",
            sender: "security@secure-paypal-login-alert.com",
            classification: "Phishing",
            risk_score: 92,
            risk_level: "Critical",
            scanned_at: "2026-10-23T22:30:00Z",
            indicators: {
              gemini_reasons: ["Urgent account suspension threat", "Mismatched domain"],
              suspicious_urls: ["https://secure-paypal-login-alert.com/verify-account"],
              virustotal_malicious_urls: 7
            },
            recommended_action: "Quarantine email immediately and block sender domain."
          }
        ]);
      });
  }, []);

  const filteredReports = reports.filter(r => {
    if (filter === 'All') return true;
    return r.classification.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>AI-Powered Phishing Detection & Prevention System</h1>
        <p className="subtitle">Security Operations Center (SOC) Incident & Analysis Dashboard</p>
      </header>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Analyzed</h3>
          <p className="stat-value">{stats.total_scanned_emails}</p>
        </div>
        <div className="stat-card phishing">
          <h3>Phishing Detected</h3>
          <p className="stat-value">{stats.phishing_count}</p>
        </div>
        <div className="stat-card suspicious">
          <h3>Suspicious</h3>
          <p className="stat-value">{stats.suspicious_count}</p>
        </div>
        <div className="stat-card safe">
          <h3>Safe Emails</h3>
          <p className="stat-value">{stats.safe_count}</p>
        </div>
        <div className="stat-card score">
          <h3>Avg Threat Score</h3>
          <p className="stat-value">{stats.average_risk_score} / 100</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-bar">
        {['All', 'Phishing', 'Suspicious', 'Safe'].map(tab => (
          <button
            key={tab}
            className={`filter-btn ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Threat Incident Table */}
      <div className="table-card">
        <h2>Live Email Threat Feed</h2>
        <table className="threat-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Subject</th>
              <th>Sender</th>
              <th>Risk Score</th>
              <th>Timestamp</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(rep => (
              <tr key={rep.report_id}>
                <td>
                  <span className={`badge badge-${rep.classification.toLowerCase()}`}>
                    {rep.classification}
                  </span>
                </td>
                <td className="subject-cell">{rep.subject}</td>
                <td className="sender-cell">{rep.sender}</td>
                <td>
                  <div className="risk-bar-container">
                    <span className="risk-num">{rep.risk_score}</span>
                    <div className="risk-bar" style={{ width: `${rep.risk_score}%` }}></div>
                  </div>
                </td>
                <td>{new Date(rep.scanned_at).toLocaleTimeString()}</td>
                <td>
                  <button className="view-btn" onClick={() => setSelectedReport(rep)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Threat Analysis Report: {selectedReport.report_id}</h2>
            <p><strong>Subject:</strong> {selectedReport.subject}</p>
            <p><strong>Sender:</strong> {selectedReport.sender}</p>
            <p><strong>Verdict:</strong> <span className={`badge badge-${selectedReport.classification.toLowerCase()}`}>{selectedReport.classification} ({selectedReport.risk_score}/100)</span></p>
            
            <h3>AI Detection Rationale</h3>
            <ul>
              {selectedReport.indicators?.gemini_reasons?.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>

            {selectedReport.indicators?.suspicious_urls?.length > 0 && (
              <>
                <h3>Extracted Malicious URLs</h3>
                <ul>
                  {selectedReport.indicators.suspicious_urls.map((u, i) => (
                    <li key={i}><code>{u}</code></li>
                  ))}
                </ul>
              </>
            )}

            <h3>Recommended Response Action</h3>
            <p className="recommendation-box">{selectedReport.recommended_action}</p>

            <button className="close-btn" onClick={() => setSelectedReport(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
