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
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-5 md:gap-8 pb-12 no-drag">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-label-md w-fit h-10 active:scale-[0.97]"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Dashboard
      </button>

      {/* Main Grid - stacks on mobile */}
      <div className="flex flex-col lg:grid lg:grid-cols-[2fr_1fr] gap-5 md:gap-6">
        {/* Image Viewer */}
        <div className="bg-[#1E1E1E] rounded-2xl border border-outline-variant min-h-[250px] md:min-h-[500px] flex flex-col items-center justify-center">
          <div className="text-white text-center opacity-60 flex flex-col items-center gap-2">
            <span className="text-5xl">🔬</span>
            <p className="font-medium">Diagnostic Image Viewer</p>
            <p className="text-xs opacity-70">High-resolution scan preview</p>
          </div>
        </div>

        {/* Info Panel */}
        <div className="flex flex-col gap-4">
          {/* DOI Result */}
          <div className="bg-surface-container rounded-2xl p-4 md:p-5 border border-outline-variant">
            <h3 className="font-title-md text-on-surface font-semibold mb-4">DOI Result Display</h3>
            <div className="flex flex-col divide-y divide-outline-variant">
              <div className="flex justify-between items-center py-3">
                <span className="text-on-surface-variant text-sm font-medium">Diagnosis</span>
                <span className="font-semibold text-success">Normal Tissue</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-on-surface-variant text-sm font-medium">Confidence Score</span>
                <span className="font-semibold text-on-surface">98.4%</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-on-surface-variant text-sm font-medium">Analyzed Region</span>
                <span className="font-semibold text-on-surface">Upper Left Quadrant</span>
              </div>
            </div>
          </div>

          {/* Patient Metadata */}
          <div className="bg-surface-container rounded-2xl p-4 md:p-5 border border-outline-variant">
            <h3 className="font-title-md text-on-surface font-semibold mb-4">Patient Metadata</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-on-surface-variant">Patient ID</span>
                <span className="font-medium text-on-surface">P-1042</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-on-surface-variant">Age / Gender</span>
                <span className="font-medium text-on-surface">45 / M</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-on-surface-variant">Physician</span>
                <span className="font-medium text-on-surface">{physicianName}</span>
              </div>
            </div>
          </div>
          
          {/* Generate Report Button */}
          <button
            className="w-full h-12 bg-primary text-on-primary font-label-large rounded-xl hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2 active:scale-[0.97]"
            onClick={() => handleMockAction('/api/misc/batch/start')}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;
