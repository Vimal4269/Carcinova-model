import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const CLASSIFICATION_STYLES = {
  'Normal':             { bg: 'bg-success/10',  text: 'text-success',  border: 'border-success/30',  icon: 'check_circle' },
  'OSCC':               { bg: 'bg-danger/10',   text: 'text-danger',   border: 'border-danger/30',   icon: 'warning' },
  'OSCC induced OSMF':  { bg: 'bg-warning/10',  text: 'text-warning',  border: 'border-warning/30',  icon: 'emergency' },
};

const AnalysisResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadSlides = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('image', file);
    });

    try {
      const response = await api.post(`/cases/${id}/add_slides`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        fetchCaseDetails();
      } else {
        alert(response.data.message || 'Failed to upload slides.');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading slides: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  const fetchCaseDetails = async () => {
    try {
      const response = await api.get(`/cases/${id}`);
      if (response.data.success) {
        setCaseData(response.data.case);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load case details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-on-surface-variant">Loading Case Data...</div>;
  }

  if (!caseData) {
    return <div className="p-8 text-danger">Case not found.</div>;
  }

  const cls = caseData.classification;
  const clsStyle = CLASSIFICATION_STYLES[cls] || { bg: 'bg-surface-container', text: 'text-outline-variant', border: 'border-outline-variant', icon: 'help' };
  const isNormal = cls === 'Normal';
  const doiApplicable = cls === 'OSCC' || cls === 'OSCC induced OSMF';

  const units = localStorage.getItem('setting_units') || 'mm';
  const threshold = parseInt(localStorage.getItem('setting_threshold') || '80', 10);

  const formatDoi = (mmValue) => {
    if (!mmValue) return 'Pending';
    return units === 'um' ? `${(mmValue * 1000).toFixed(0)} µm` : `${mmValue.toFixed(2)} mm`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-4">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-label-md w-fit"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Dashboard
          </button>
          <div>
            <h1 className="font-headline-lg text-primary font-bold">Case {caseData.case_id}</h1>
            <p className="font-body-base text-on-surface-variant mt-1">
              Patient: <span className="font-medium text-on-surface">{caseData.patient_name}</span>
            </p>
          </div>
        </div>
        <button
          className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-large shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          onClick={() => navigate(`/report-preview/${caseData.id}`)}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          Generate Report
        </button>
      </div>

      {/* ── Classification Result Banner ── */}
      {cls && (
        <div className={`rounded-2xl p-6 border-2 ${clsStyle.bg} ${clsStyle.border} flex flex-col gap-4`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`material-symbols-outlined text-4xl ${clsStyle.text}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {clsStyle.icon}
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-on-surface-variant font-label-caps">AI Classification</p>
                <h2 className={`text-2xl font-extrabold ${clsStyle.text}`}>{cls}</h2>
              </div>
            </div>
            {caseData.confidence && (
              <div className="flex flex-col gap-1.5 min-w-[200px]">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Confidence</span>
                  <span className="font-bold text-on-surface">{caseData.confidence}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isNormal ? 'bg-success' : cls === 'OSCC' ? 'bg-danger' : 'bg-warning'
                    }`}
                    style={{ width: `${caseData.confidence}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {isNormal && (
            <div className="flex items-center gap-2 text-success text-sm font-medium">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Normal tissue identified — no Depth of Invasion measurement is required for this case.
            </div>
          )}
          {caseData.confidence && caseData.confidence < threshold && (
            <div className="flex items-center gap-2 text-danger text-sm font-bold bg-danger/10 p-3 rounded">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              Low AI Confidence ({caseData.confidence}%) - Manual pathologist review strongly advised.
            </div>
          )}
          {doiApplicable && !caseData.max_doi_mm && (
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-warning text-[16px]">info</span>
              <span className="text-sm text-on-surface-variant">DOI measurement is recommended. Annotate a slide below.</span>
            </div>
          )}
        </div>
      )}

      {/* ── DOI Metrics (only for OSCC) ── */}
      {doiApplicable && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant flex flex-col items-center justify-center text-center">
            <span className="font-label-md text-on-surface-variant mb-2">Maximum DOI</span>
            <span className="font-display-md text-primary font-bold">
              {formatDoi(caseData.max_doi_mm)}
            </span>
          </div>
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant flex flex-col items-center justify-center text-center">
            <span className="font-label-md text-on-surface-variant mb-2">AJCC T-Stage</span>
            <span className={`font-display-md font-bold ${caseData.t_stage ? 'text-on-surface' : 'text-outline-variant'}`}>
              {caseData.t_stage || 'Pending'}
            </span>
          </div>
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant flex flex-col items-center justify-center text-center">
            <span className="font-label-md text-on-surface-variant mb-2">Clinical Risk</span>
            <span className={`font-display-md font-bold ${
              caseData.risk_classification === 'High' ? 'text-danger' :
              caseData.risk_classification === 'Moderate' ? 'text-warning' :
              caseData.risk_classification === 'Low' ? 'text-success' : 'text-outline-variant'
            }`}>
              {caseData.risk_classification || 'Pending'}
            </span>
          </div>
        </div>
      )}

      {/* ── Slides Grid ── */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-title-lg text-on-surface">
            Uploaded Slides ({caseData.slides.length})
          </h2>
          <div className="flex items-center gap-2">
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handleUploadSlides}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-surface-container-high border border-outline-variant hover:bg-surface-container-highest transition-colors rounded-lg font-label-md text-on-surface flex items-center gap-1.5 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Uploading...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                  Upload Slide(s)
                </>
              )}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseData.slides.map((slide, index) => {
            const baseHost = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://127.0.0.1:5000';
            const slideDoiApplicable = slide.classification === 'OSCC' || slide.classification === 'OSCC induced OSMF';
            
            return (
              <div key={slide.id} className="bg-surface rounded-xl border border-outline-variant overflow-hidden flex flex-col">
                <div className="h-48 bg-surface-container flex items-center justify-center overflow-hidden">
                  <img
                    src={`${baseHost}/api/doi/slide_image/${slide.id}`}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="material-symbols-outlined text-4xl text-outline-variant">image_not_supported</span>';
                    }}
                  />
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="font-label-lg text-on-surface">Slide #{index + 1}</span>
                    {slide.doi_mm ? (
                      <span className="px-2 py-1 bg-success/10 text-success text-xs font-bold rounded">
                        DOI: {formatDoi(slide.doi_mm)}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded">
                        {slideDoiApplicable ? 'Unannotated' : 'N/A'}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-on-surface-variant border-t border-outline-variant/30 pt-2">
                    AI Diagnosis: <span className={`font-semibold ${
                      slide.classification === 'Normal' ? 'text-success' :
                      slide.classification?.startsWith('OSCC') ? 'text-danger' : 'text-on-surface'
                    }`}>{slide.classification || 'Unknown'}</span> ({slide.confidence ? `${slide.confidence}%` : '—'})
                  </div>
                  
                  {slideDoiApplicable ? (
                    <button
                      onClick={() => navigate(`/annotate/${slide.id}`)}
                      className={`w-full py-2 rounded font-label-md mt-1 transition-colors ${
                        slide.doi_mm
                          ? 'border border-primary text-primary hover:bg-primary/5'
                          : 'bg-primary text-on-primary hover:opacity-90'
                      }`}
                    >
                      {slide.doi_mm ? 'Re-Measure DOI' : 'Measure DOI'}
                    </button>
                  ) : (
                    <div className="text-xs text-success bg-success/5 p-2 rounded text-center border border-success/10 font-medium">
                      Normal Tissue — DOI measurement not required.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
