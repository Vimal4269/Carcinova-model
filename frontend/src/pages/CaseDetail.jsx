import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const physicianName = user?.username ? (user.username.toLowerCase().startsWith('dr') ? user.username : `Dr. ${user.username}`) : 'Dr. Pathologist';
  const handleMockAction = async (url) => {
    try {
      const res = await fetch('http://localhost:5000' + url, { method: 'POST' });
      const data = await res.json();
      alert(data.message);
    } catch (e) {
      alert('Error connecting to backend: ' + e.message);
    }
  };

  return (
    <div className="no-drag" style={{ paddingTop: '30px' }}>
      

      <div style={styles.grid}>
        <div className="card flex-col items-center justify-center" style={styles.imageViewer}>
          <div style={styles.imagePlaceholder}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</span>
            <p>Diagnostic Image Viewer</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>High-resolution scan preview</p>
          </div>
        </div>

        <div className="flex-col gap-2">
          <div className="card">
            <h3 className="mb-3">DOI Result Display</h3>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Diagnosis</span>
              <span style={{...styles.resultValue, color: 'var(--success)'}}>Normal Tissue</span>
            </div>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Confidence Score</span>
              <span style={styles.resultValue}>98.4%</span>
            </div>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Analyzed Region</span>
              <span style={styles.resultValue}>Upper Left Quadrant</span>
            </div>
          </div>

          <div className="card">
            <h3 className="mb-3">Patient Metadata</h3>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Patient ID</span>
              <span style={styles.metaValue}>P-1042</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Age / Gender</span>
              <span style={styles.metaValue}>45 / M</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Physician</span>
              <span style={styles.metaValue}>{physicianName}</span>
            </div>
          </div>
          
          <button className="primary w-full" style={{ padding: '1rem' }} onClick={() => handleMockAction('/api/misc/batch/start')}>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  backBtn: {
    backgroundColor: 'var(--primary-bg)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-color)',
    padding: '0.5rem 1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
  },
  imageViewer: {
    minHeight: '500px',
    backgroundColor: '#1E1E1E',
    border: '1px solid var(--border-color)',
  },
  imagePlaceholder: {
    color: '#fff',
    textAlign: 'center',
    opacity: 0.6,
  },
  resultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid var(--border-color)',
  },
  resultLabel: {
    fontWeight: '500',
    color: 'var(--text-muted)',
  },
  resultValue: {
    fontWeight: '600',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '1rem',
  },
  metaLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '0.25rem',
  },
  metaValue: {
    fontWeight: '500',
  }
};

export default CaseDetail;
