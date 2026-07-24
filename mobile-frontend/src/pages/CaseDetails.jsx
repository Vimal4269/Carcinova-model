import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Activity, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { getCaseDetails } from '../services/api';

const getClassificationStyle = (classification) => {
  if (classification === 'Normal') return { badgeClass: 'badge badge-green', color: '#4ade80', note: 'Normal tissue — no DOI measurement applicable.' };
  if (classification === 'OSCC') return { badgeClass: 'badge badge-red', color: '#f87171', note: 'Depth of Invasion measurement applicable.' };
  if (classification === 'OSCC induced OSMF') return { badgeClass: 'badge badge-orange', color: '#fb923c', note: 'Depth of Invasion measurement applicable.' };
  return { badgeClass: 'badge badge-gray', color: '#94a3b8', note: '' };
};

const CaseDetails = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getCaseDetails(id);
        if (data.success) {
          setCaseData(data.case);
        } else {
          setError('Failed to fetch case details.');
        }
      } catch (err) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '100vh' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="container">
        <Link to="/" className="flex items-center gap-2 mb-6" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        <div className="glass-panel card flex items-center justify-center" style={{ color: '#ef4444' }}>
          {error || 'Case not found'}
        </div>
      </div>
    );
  }

  const clsStyle = getClassificationStyle(caseData.classification);
  const isNormal = caseData.classification === 'Normal';
  const doiApplicable = !isNormal && caseData.classification;

  return (
    <div className="container">
      <header className="mb-6">
        <Link to="/" className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-secondary)', display: 'inline-flex' }}>
          <ArrowLeft size={20} /> Back
        </Link>
        <h1 className="title">Case Details</h1>
        <p className="subtitle">Case ID: {caseData.case_id}</p>
      </header>

      {/* Patient Info */}
      <div className="glass-panel card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="btn-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
            <User size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Patient Information</h3>
            <p className="text-secondary">{caseData.patient_name || 'Unknown Patient'}</p>
          </div>
        </div>
      </div>

      {/* Classification Result */}
      {caseData.classification && (
        <div className="glass-panel card mb-6" style={{
          borderLeft: `4px solid ${clsStyle.color}`,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.8))'
        }}>
          <h3 className="flex items-center gap-2 mb-4" style={{ fontSize: '1.1rem' }}>
            <Activity size={18} style={{ color: clsStyle.color }} />
            Classification Result
          </h3>

          <div className="flex justify-between items-center mb-3">
            <span className="text-secondary">AI Diagnosis</span>
            <span className={clsStyle.badgeClass} style={{ fontSize: '0.85rem' }}>
              {caseData.classification}
            </span>
          </div>

          {caseData.confidence && (
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-secondary">Confidence</span>
                <span className="font-bold" style={{ color: clsStyle.color }}>{caseData.confidence}%</span>
              </div>
              <div style={{
                height: '6px', borderRadius: '3px',
                background: 'rgba(255,255,255,0.1)', overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%', borderRadius: '3px',
                  width: `${caseData.confidence}%`,
                  background: clsStyle.color,
                  transition: 'width 0.7s ease'
                }} />
              </div>
            </div>
          )}

          {clsStyle.note && (
            <p className="text-sm" style={{ color: clsStyle.color, opacity: 0.85, marginTop: '0.5rem' }}>
              {clsStyle.note}
            </p>
          )}
        </div>
      )}

      {/* Clinical Results (DOI) — only for OSCC cases */}
      {doiApplicable && (
        <div className="glass-panel card mb-6" style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))' }}>
          <h3 className="flex items-center gap-2 mb-4" style={{ fontSize: '1.2rem' }}>
            <Activity className="text-accent" /> Clinical Results
          </h3>

          <div className="flex-col gap-4">
            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <span className="text-secondary">Max DOI (Depth of Invasion)</span>
              <span className="font-bold text-accent" style={{ fontSize: '1.1rem' }}>
                {caseData.max_doi_mm ? `${caseData.max_doi_mm} mm` : 'Pending'}
              </span>
            </div>

            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <span className="text-secondary">T-Stage (AJCC)</span>
              <span className="font-bold badge badge-blue">{caseData.t_stage || 'Pending'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-secondary">Risk Classification</span>
              <span className={`font-bold badge ${caseData.risk_classification === 'High' ? 'badge-red' : 'badge-blue'}`}>
                {caseData.risk_classification || 'Pending'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Slides */}
      {caseData.slides && caseData.slides.length > 0 && (
        <div className="mb-6">
          <h3 className="flex items-center gap-2 mb-4" style={{ fontSize: '1.2rem' }}>
            <ImageIcon className="text-accent" /> Slides Analyzed
          </h3>
          <div className="flex-col gap-4">
            {caseData.slides.map((slide, index) => (
              <div key={slide.id || index} className="glass-panel card flex justify-between items-center">
                <span className="font-medium">Slide {index + 1}</span>
                {slide.doi_mm
                  ? <span className="badge badge-purple">{slide.doi_mm} mm</span>
                  : <span className="badge badge-gray">{doiApplicable ? 'Pending' : 'N/A'}</span>
                }
              </div>
            ))}
          </div>
        </div>
      )}

      {(!caseData.slides || caseData.slides.length === 0) && (
        <div className="glass-panel card flex-col items-center justify-center text-center" style={{ color: 'var(--text-secondary)' }}>
          <AlertCircle size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
          <p className="text-sm">No slides associated with this case.</p>
        </div>
      )}
    </div>
  );
};

export default CaseDetails;
