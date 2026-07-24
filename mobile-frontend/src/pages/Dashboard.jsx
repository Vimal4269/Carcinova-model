import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Search, ChevronRight, FileText, Upload, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { getCasesList, classifyCase } from '../services/api';

const getClassificationBadgeClass = (classification) => {
  if (classification === 'Normal') return 'badge badge-green';
  if (classification === 'OSCC') return 'badge badge-red';
  if (classification === 'OSCC induced OSMF') return 'badge badge-orange';
  return 'badge badge-gray';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('classify');
  
  // Cases List states
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Classify Form states
  const [patientName, setPatientName] = useState('');
  const [caseId, setCaseId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [classifying, setClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCasesList();
      if (data.success) {
        setCases(data.cases || []);
      } else {
        setError('Failed to fetch cases from API');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleClassify = async (e) => {
    e.preventDefault();
    setClassifyError('');

    if (selectedFiles.length === 0) {
      setClassifyError('Please select at least one histopathology slide.');
      return;
    }

    setClassifying(true);
    const formData = new FormData();
    formData.append('patient_name', patientName);
    formData.append('case_id', caseId);
    
    Array.from(selectedFiles).forEach(file => {
      formData.append('image', file);
    });

    try {
      const data = await classifyCase(formData);
      if (data.success) {
        // Reset form
        setPatientName('');
        setCaseId('');
        setSelectedFiles([]);
        fetchCases(); // Refresh list

        // Redirect to case details
        navigate(`/case/${data.case_id}`);
      } else {
        setClassifyError(data.message || 'Classification failed.');
      }
    } catch (err) {
      setClassifyError(err.response?.data?.message || err.message || 'Failed to classify. Check connection.');
    } finally {
      setClassifying(false);
    }
  };

  return (
    <div className="container">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="title flex items-center gap-2">
            <Activity className="text-accent" />
            PDD Mobile
          </h1>
          <p className="subtitle">Oral Cancer Detection &amp; DOI Analysis</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'classify' ? 'active' : ''}`}
          onClick={() => setActiveTab('classify')}
        >
          Classify Tissue
        </button>
        <button 
          className={`tab-btn ${activeTab === 'cases' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('cases');
            fetchCases(); // Fetch latest cases
          }}
        >
          Case Archive
        </button>
      </div>

      {/* TAB CONTENT: CLASSIFY */}
      {activeTab === 'classify' && (
        <div className="flex-col gap-4">
          <div className="glass-panel card flex-col">
            <h2 className="flex items-center gap-2 mb-4" style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }}>
              <Sparkles size={18} />
              New Patient Case
            </h2>
            
            <form onSubmit={handleClassify} className="flex-col">
              <div className="form-group">
                <label className="form-label">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Jane Doe"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Case ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., PT-9982"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Histopathology Slide(s)</label>
                <label className="file-upload-box">
                  <Upload size={32} style={{ opacity: 0.6 }} />
                  <span className="font-medium text-sm">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} Slide(s) Selected` : 'Select Slide Images'}
                  </span>
                  {selectedFiles.length > 0 && (
                    <span className="text-xs" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {Array.from(selectedFiles).map(f => f.name).join(', ')}
                    </span>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(e.target.files || [])}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {classifyError && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <AlertCircle size={18} />
                  <span className="text-xs font-semibold">{classifyError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={classifying}
                className="btn mt-2"
                style={{ width: '100%', padding: '0.85rem' }}
              >
                {classifying ? 'Analyzing Slides...' : 'Classify & Analyze'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CASE ARCHIVE */}
      {activeTab === 'cases' && (
        <div className="flex-col gap-4">
          <div className="glass-panel flex items-center p-2 mb-4" style={{ padding: '0.5rem 1rem', gap: '0.75rem' }}>
            <Search size={20} className="text-secondary" />
            <input
              type="text"
              placeholder="Search patient or case ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '100%'
              }}
            />
          </div>

          <div className="flex-col gap-4">
            {loading ? (
              <div className="flex justify-center mt-4">
                <div className="loader"></div>
              </div>
            ) : error ? (
              <div className="glass-panel card flex-col items-center justify-center text-center" style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                <AlertCircle size={18} style={{ marginBottom: '0.5rem' }} />
                <span>{error}. Is local backend server running?</span>
              </div>
            ) : cases.filter(c => (c.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.case_id || '').toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
              <div className="glass-panel card flex-col items-center justify-center text-center" style={{ color: 'var(--text-secondary)' }}>
                <FileText size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <p>No cases found.</p>
              </div>
            ) : (
              cases.filter(c => (c.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.case_id || '').toLowerCase().includes(searchQuery.toLowerCase())).map((c) => (
                <Link to={`/case/${c.id}`} key={c.id} style={{ display: 'block', marginBottom: '1rem' }}>
                  <div className="glass-panel card flex justify-between items-center">
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{c.patient_name || 'Unknown Patient'}</h3>
                      <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                        <span className="badge badge-blue">{c.case_id}</span>
                        {c.classification && (
                          <span className={getClassificationBadgeClass(c.classification)}>
                            {c.classification
                              ? (c.classification.length > 15 ? c.classification.substring(0, 15) + '...' : c.classification)
                              : ''}
                          </span>
                        )}
                        {c.max_doi_mm && (
                          <span className="badge badge-purple">DOI: {c.max_doi_mm} mm</span>
                        )}
                      </div>
                    </div>
                    <div className="btn-icon">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
