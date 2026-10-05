import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const ReportPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  const physicianName = user?.username ? (user.username.toLowerCase().startsWith('dr') ? user.username : `Dr. ${user.username}`) : 'Dr. Pathologist';

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const response = await api.get(`/cases/${id}`);
        if (response.data.success) {
          setCaseData(response.data.case);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load report data.");
      } finally {
        setLoading(false);
      }
    };
    fetchCaseDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[200px] text-on-surface-variant">
      <span className="material-symbols-outlined animate-spin text-3xl mb-2">progress_activity</span>
      Generating Report...
    </div>
  );
  if (!caseData) return <div className="p-6 text-danger">Report data not found.</div>;

  return (
    <div className="w-full h-full relative">
      <div className="flex flex-col min-h-full">
        <main className="flex-1 overflow-y-auto p-3 md:p-8">
          <div className="bg-white max-w-[800px] mx-auto p-5 md:p-12 shadow-lg border border-outline-variant print:shadow-none print:border-none print:p-0 rounded-lg md:rounded-none">
            {/* Hospital Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 border-b-2 border-on-surface pb-4 md:pb-6 mb-6 md:mb-8">
              <div>
                <h2 className="text-lg md:font-headline-md md:text-headline-md font-extrabold uppercase">Metropolitan Pathology Institute</h2>
                <p className="text-xs md:font-body-sm md:text-body-sm text-on-surface-variant">Diagnostic Pathology Division</p>
              </div>
              <div className="sm:text-right">
                <div className="font-mono-data text-mono-data bg-surface-container-highest px-3 py-1 mb-2 inline-block text-xs">FINAL REPORT</div>
                <p className="text-xs">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Patient Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8 border border-outline-variant p-3 md:p-4 bg-surface-container-low rounded">
              <div>
                <label className="font-label-caps text-label-caps text-outline uppercase block mb-1 text-[10px]">Patient Name</label>
                <span className="text-sm font-bold">{caseData.patient_name}</span>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-outline uppercase block mb-1 text-[10px]">Case ID</label>
                <span className="font-mono-data text-sm">{caseData.case_id}</span>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-outline uppercase block mb-1 text-[10px]">Slides Evaluated</label>
                <span className="text-sm">{caseData.slides.length}</span>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-outline uppercase block mb-1 text-[10px]">Ordering Physician</label>
                <span className="text-sm font-bold text-primary">{physicianName}</span>
              </div>
            </div>

            {/* Classification Result */}
            <div className="mb-6 md:mb-8">
              <h3 className="text-base md:font-headline-md md:text-headline-md font-bold mb-3 md:mb-4 border-b border-outline-variant pb-2">Classification Result</h3>
              <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-outline-variant bg-surface-container-low rounded">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  caseData.classification === 'Normal' ? 'bg-green-500' :
                  caseData.classification === 'OSCC' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="font-bold text-on-surface text-sm">{caseData.classification || 'Not classified'}</span>
                  {caseData.confidence && (
                    <span className="text-xs text-on-surface-variant">Confidence: {caseData.confidence}%</span>
                  )}
                </div>
                {caseData.classification === 'Normal' && (
                  <span className="hidden sm:inline ml-auto text-green-700 text-xs font-semibold">Normal tissue — No DOI applicable</span>
                )}
              </div>
            </div>

            {/* DOI Analysis — only for OSCC / OSCC induced OSMF */}
            {caseData.classification !== 'Normal' && (
            <div className="mb-6 md:mb-8">
              <h3 className="text-base md:font-headline-md md:text-headline-md font-bold mb-3 md:mb-4 border-b border-outline-variant pb-2">Depth of Invasion (DOI)</h3>
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="w-full md:w-2/3">
                  <div className="bg-surface-container min-h-[120px] md:min-h-[200px] flex flex-col gap-2 p-2 rounded">
                    {caseData.slides.map((slide, idx) => (
                      <div key={slide.id} className="border border-outline-variant p-2 md:p-3 flex justify-between items-center bg-surface rounded">
                        <span className="font-label-md text-sm">Slide #{idx + 1}</span>
                        <span className="font-mono-data font-bold text-sm">{slide.doi_mm ? `${slide.doi_mm.toFixed(2)} mm` : 'Unannotated'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full md:w-1/3 flex flex-row md:flex-col gap-3 md:gap-4">
                  <div className="flex-1 bg-primary-container p-3 md:p-4 rounded text-on-primary-container">
                    <label className="font-label-caps text-label-caps block mb-1 opacity-80 text-[10px]">Maximum DOI</label>
                    <div className="text-xl md:text-3xl font-extrabold">{caseData.max_doi_mm ? `${caseData.max_doi_mm.toFixed(2)}mm` : 'N/A'}</div>
                  </div>
                  <div className="flex-1 bg-surface-container-high p-3 md:p-4 border border-outline-variant rounded">
                    <label className="font-label-caps text-label-caps block mb-1 text-on-surface-variant uppercase text-[10px]">Methodology</label>
                    <div className="text-xs md:text-sm font-bold text-on-surface">Manual Histomorphometry</div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* AJCC Staging Table — only for OSCC */}
            {caseData.classification !== 'Normal' && (
            <div className="mb-6 md:mb-8">
              <h3 className="text-base md:font-headline-md md:text-headline-md font-bold mb-3 md:mb-4 border-b border-outline-variant pb-2">AJCC TNM Staging & Risk</h3>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-surface-container-highest text-left">
                    <th className="p-3 font-label-caps text-label-caps uppercase text-on-surface text-xs">Category</th>
                    <th className="p-3 font-label-caps text-label-caps uppercase text-on-surface text-xs">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-outline-variant">
                    <td className="p-3 font-bold">Pathological T-Stage</td>
                    <td className="p-3"><span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-xs font-bold uppercase">{caseData.t_stage || 'Pending'}</span></td>
                  </tr>
                  <tr className="border-b border-outline-variant">
                    <td className="p-3 font-bold">Clinical Risk Level</td>
                    <td className="p-3"><span className="bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded text-xs font-bold uppercase">{caseData.risk_classification || 'Pending'}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            )}

            {/* Pathologist Signature */}
            <div className="mt-10 md:mt-16 pt-6 md:pt-8 border-t border-outline-variant flex flex-col sm:flex-row sm:justify-between gap-4">
              <div>
                <p className="text-xs text-on-surface-variant">Generated by Carcinova Measurement Tool</p>
              </div>
              <div className="w-full sm:w-64">
                <div className="h-12 md:h-16 border-b border-on-surface relative mb-2"></div>
                <p className="font-bold text-on-surface text-sm">{physicianName} (Pathologist)</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Floating Action Buttons */}
          <div className="print:hidden fixed bottom-4 md:bottom-8 right-4 md:right-8 flex flex-col sm:flex-row items-end sm:items-center gap-3 md:gap-4 z-50">
            <button onClick={() => navigate('/reports')} className="bg-surface-container-high border border-outline-variant text-on-surface rounded-full px-5 py-3 shadow-xl flex items-center gap-2 hover:bg-surface-container-highest transition-colors h-12 active:scale-[0.97]">
              <span className="material-symbols-outlined text-[20px]" style={{"fontVariationSettings":"'FILL' 1"}}>arrow_back</span>
              <span className="text-xs font-semibold uppercase tracking-wider">Reports</span>
            </button>
            <button onClick={handlePrint} className="bg-primary text-on-primary rounded-full px-5 py-3 shadow-xl flex items-center gap-2 hover:opacity-90 transition-opacity h-12 active:scale-[0.97]">
              <span className="material-symbols-outlined text-[20px]" style={{"fontVariationSettings":"'FILL' 1"}}>print</span>
              <span className="text-xs font-semibold uppercase tracking-wider">Print</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportPreview;
