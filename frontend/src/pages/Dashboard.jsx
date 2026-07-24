import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CLASSIFICATION_STYLES = {
  'Normal':             { bg: 'bg-success/10',  text: 'text-success',  icon: 'check_circle',  label: 'Normal' },
  'OSCC':               { bg: 'bg-danger/10',   text: 'text-danger',   icon: 'warning',       label: 'OSCC' },
  'OSCC induced OSMF':  { bg: 'bg-warning/10',  text: 'text-warning',  icon: 'emergency',     label: 'OSCC induced OSMF' },
};

const ClassificationBadge = ({ classification }) => {
  const style = CLASSIFICATION_STYLES[classification] || { bg: 'bg-surface-container', text: 'text-outline-variant', icon: 'help', label: classification || 'Unknown' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${style.bg} ${style.text}`}>
      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{style.icon}</span>
      {style.label}
    </span>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const threshold = parseInt(localStorage.getItem('setting_threshold') || '80', 10);

  // Form states
  const [patientName, setPatientName] = useState('');
  const [caseId, setCaseId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [classifying, setClassifying] = useState(false);

  // Classification result state
  const [result, setResult] = useState(null); // { classification, confidence, doi_applicable, case_id, slide_id }
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await api.get('/cases/list');
      if (response.data.success) {
        setCases(response.data.cases);
      }
    } catch (err) {
      console.error("Failed to fetch cases", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
      try {
        const response = await api.delete(`/cases/${id}`);
        if (response.data.success) {
          fetchCases();
          if (result && result.case_id === id) {
             setResult(null);
          }
        } else {
          alert(response.data.message || "Failed to delete case.");
        }
      } catch (err) {
        console.error(err);
        alert("Error deleting case.");
      }
    }
  };

  const handleClassify = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (selectedFiles.length === 0) {
      setError('Please select at least one histopathology image.');
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
      const response = await fetch('http://127.0.0.1:5000/api/cases/classify', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (localStorage.getItem('setting_redirect') !== 'false') {
          navigate(`/case-detail/${data.case_id}`);
          return;
        }
        setResult(data);
        // Reset form
        setPatientName('');
        setCaseId('');
        setSelectedFiles([]);
        // Refresh cases table
        fetchCases();
      } else {
        setError(data.message || 'Classification failed.');
      }
    } catch (err) {
      setError('Failed to classify image. Check backend connection.');
    } finally {
      setClassifying(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-outline-variant pb-4">
        <h1 className="font-headline-lg text-primary font-bold">Classification Dashboard</h1>
        <p className="font-body-base text-on-surface-variant">
          Upload a histopathology image to classify tissue. DOI measurement is available for OSCC cases.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Left Panel: Classify Form ── */}
        <div className="lg:w-1/3 flex flex-col gap-4 self-start">
          <div className="bg-surface-container rounded-2xl p-6 shadow-sm border border-outline-variant flex flex-col gap-4">
            <h2 className="font-title-lg text-on-surface border-b border-outline-variant pb-3 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
              Classify Image
            </h2>

            <form onSubmit={handleClassify} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-on-surface">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full h-11 px-4 bg-surface border border-outline rounded-lg text-body-base focus:border-primary focus:outline-none transition-colors"
                  placeholder="e.g., Jonathan Harker"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-md text-on-surface">Case ID</label>
                <input
                  type="text"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full h-11 px-4 bg-surface border border-outline rounded-lg text-body-base focus:border-primary focus:outline-none transition-colors"
                  placeholder="e.g., PT-8829"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-md text-on-surface">Histopathology Slide(s)</label>
                <label className="relative border-2 border-dashed border-outline-variant rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer block">
                  {selectedFiles.length > 0 ? (
                    <div className="flex flex-col items-center gap-1 text-primary">
                      <span className="material-symbols-outlined">collections</span>
                      <span className="text-sm font-semibold">{selectedFiles.length} Slide(s) Selected</span>
                      <div className="text-xs text-on-surface-variant max-w-[200px] truncate mt-1">
                        {Array.from(selectedFiles).map(f => f.name).join(', ')}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl">upload_file</span>
                      <span className="text-sm">Click to select slide(s)</span>
                    </div>
                  )}
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => setSelectedFiles(e.target.files || [])}
                  />
                </label>
              </div>

              {error && (
                <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={classifying}
                className="mt-2 w-full h-12 bg-primary text-on-primary font-label-large rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm flex items-center justify-center gap-2"
              >
                {classifying ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    Classifying...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                    Classify & Analyze
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── Classification Result Card ── */}
          {result && (
            <div className={`rounded-2xl p-6 border-2 flex flex-col gap-4 shadow-md animate-pulse-once ${
              result.classification === 'Normal'
                ? 'bg-success/5 border-success/40'
                : 'bg-danger/5 border-danger/40'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-label-md text-on-surface-variant uppercase tracking-wider text-xs">Classification Result</span>
                <ClassificationBadge classification={result.classification} />
              </div>

              {/* Confidence Bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-on-surface-variant text-sm">Confidence</span>
                  <span className="font-bold text-on-surface">{result.confidence}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      result.classification === 'Normal' ? 'bg-success' : 'bg-danger'
                    }`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-1">
                {result.doi_applicable ? (
                  <>
                    <p className="text-sm text-on-surface-variant">
                      DOI measurement is recommended for this classification.
                    </p>
                    <button
                      onClick={() => navigate(`/annotate/${result.slide_id}`)}
                      className="w-full h-11 bg-danger text-white font-label-large rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>straighten</span>
                      Measure DOI →
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-success font-medium flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Normal tissue — no DOI measurement required.
                  </p>
                )}
                <button
                  onClick={() => navigate(`/case-detail/${result.case_id}`)}
                  className="w-full h-10 border border-primary text-primary font-label-large rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                >
                  View Case Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Panel: Recent Cases Table ── */}
        <div className="lg:w-2/3 bg-surface-container rounded-2xl shadow-sm border border-outline-variant overflow-hidden flex flex-col self-start">
          <div className="p-5 border-b border-outline-variant bg-surface-container-high flex justify-between items-center">
            <h2 className="font-title-lg text-on-surface">Recent Cases</h2>
            <button
              onClick={fetchCases}
              className="flex items-center justify-center p-2 rounded-full hover:bg-surface transition-colors text-on-surface-variant"
              title="Refresh"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container">
                  <th className="p-4 font-label-md text-on-surface-variant uppercase tracking-wider">Case ID</th>
                  <th className="p-4 font-label-md text-on-surface-variant uppercase tracking-wider">Patient</th>
                  <th className="p-4 font-label-md text-on-surface-variant uppercase tracking-wider">Classification</th>
                  <th className="p-4 font-label-md text-on-surface-variant uppercase tracking-wider text-center">Max DOI</th>
                  <th className="p-4 font-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-outline-variant">Loading cases...</td></tr>
                ) : cases.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-outline-variant">No cases yet. Classify an image to begin.</td></tr>
                ) : (
                  cases.map(c => (
                    <tr key={c.id} onClick={() => navigate(`/case-detail/${c.id}`)} className="cursor-pointer border-b border-outline-variant hover:bg-surface-container-high transition-colors">
                      <td className="p-4 font-mono-data text-primary font-bold">{c.case_id}</td>
                      <td className="p-4 font-body-base text-on-surface font-medium">{c.patient_name}</td>
                      <td className="p-4">
                        {c.classification
                          ? <div className="flex items-center gap-2">
                              <ClassificationBadge classification={c.classification} />
                              {c.confidence && c.confidence < threshold && (
                                <span className="material-symbols-outlined text-danger text-[18px]" title="Low Confidence">warning</span>
                              )}
                            </div>
                          : <span className="text-outline-variant text-sm">—</span>
                        }
                      </td>
                      <td className="p-4 font-body-base text-on-surface text-center">
                        {c.max_doi_mm ? (
                          <span className="font-bold">{c.max_doi_mm.toFixed(2)} mm</span>
                        ) : (
                          <span className="text-outline-variant text-sm">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                          className="px-3 py-1.5 border border-danger text-danger rounded-lg hover:bg-danger/10 transition-colors flex items-center justify-center"
                          title="Delete Case"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
