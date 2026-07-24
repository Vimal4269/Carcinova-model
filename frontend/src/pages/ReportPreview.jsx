import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const ReportPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-8 text-on-surface-variant">Generating Report...</div>;
  if (!caseData) return <div className="p-8 text-danger">Report data not found.</div>;

  return (
    <div className="w-full h-full relative">
      <div className="flex flex-col min-h-full">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="bg-white max-w-[800px] mx-auto p-12 shadow-lg border border-outline-variant print:shadow-none print:border-none print:p-0">
            {/* Hospital Header */}
            <div className="flex justify-between items-start border-b-2 border-on-surface pb-6 mb-8">
              <div>
                <h2 className="font-headline-md text-headline-md font-extrabold uppercase">Metropolitan Pathology Institute</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Diagnostic Pathology Division</p>
              </div>
              <div className="text-right">
                <div className="font-mono-data text-mono-data bg-surface-container-highest px-3 py-1 mb-2">FINAL REPORT</div>
                <p className="font-body-sm text-body-sm">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Patient Metadata Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8 border border-outline-variant p-4 bg-surface-container-low">
              <div>
                <label className="font-label-caps text-label-caps text-outline uppercase block mb-1">Patient Name</label>
                <span className="font-body-base text-body-base font-bold">{caseData.patient_name}</span>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-outline uppercase block mb-1">Case ID</label>
                <span className="font-mono-data text-mono-data">{caseData.case_id}</span>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-outline uppercase block mb-1">Slides Evaluated</label>
                <span className="font-body-base text-body-base">{caseData.slides.length}</span>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-outline uppercase block mb-1">Ordering Physician</label>
                <span className="font-body-base text-body-base">Dr. Specialist</span>
              </div>
            </div>

            {/* Classification Result */}
            <div className="mb-8">
              <h3 className="font-headline-md text-headline-md mb-4 border-b border-outline-variant pb-2">Classification Result</h3>
              <div className="flex items-center gap-4 p-4 border border-outline-variant bg-surface-container-low rounded">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  caseData.classification === 'Normal' ? 'bg-green-500' :
                  caseData.classification === 'OSCC' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
                <div>
                  <span className="font-body-base font-bold text-on-surface">{caseData.classification || 'Not classified'}</span>
                  {caseData.confidence && (
                    <span className="ml-3 text-sm text-on-surface-variant">Confidence: {caseData.confidence}%</span>
                  )}
                </div>
                {caseData.classification === 'Normal' && (
                  <span className="ml-auto text-green-700 text-sm font-semibold">Normal tissue — No DOI measurement applicable</span>
                )}
              </div>
            </div>

            {/* DOI Analysis — only for OSCC / OSCC induced OSMF */}
            {caseData.classification !== 'Normal' && (
            <div className="mb-8">
              <h3 className="font-headline-md text-headline-md mb-4 border-b border-outline-variant pb-2">Depth of Invasion (DOI) Analysis</h3>
              <div className="flex gap-6">
                <div className="w-2/3">
                  <div className="relative group bg-surface-container h-full min-h-[200px] flex flex-col gap-2 p-2">
                    {caseData.slides.map((slide, idx) => (
                      <div key={slide.id} className="border border-outline-variant p-2 flex justify-between items-center bg-surface">
                        <span className="font-label-md">Slide #{idx + 1}</span>
                        <span className="font-mono-data font-bold">{slide.doi_mm ? `${slide.doi_mm.toFixed(2)} mm` : 'Unannotated'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-1/3 flex flex-col gap-4">
                  <div className="bg-primary-container p-4 rounded text-on-primary-container">
                    <label className="font-label-caps text-label-caps block mb-1 opacity-80">Maximum DOI</label>
                    <div className="text-3xl font-extrabold">{caseData.max_doi_mm ? `${caseData.max_doi_mm.toFixed(2)}mm` : 'N/A'}</div>
                  </div>
                  <div className="bg-surface-container-high p-4 border border-outline-variant">
                    <label className="font-label-caps text-label-caps block mb-1 text-on-surface-variant uppercase">Methodology</label>
                    <div className="text-sm font-bold text-on-surface">Manual Histomorphometry</div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* AJCC Staging Table — only for OSCC */}
            {caseData.classification !== 'Normal' && (
            <div className="mb-8">
              <h3 className="font-headline-md text-headline-md mb-4 border-b border-outline-variant pb-2">AJCC TNM Staging & Risk</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-container-highest text-left">
                    <th className="p-3 font-label-caps text-label-caps uppercase text-on-surface">Category</th>
                    <th className="p-3 font-label-caps text-label-caps uppercase text-on-surface">Value</th>
                  </tr>
                </thead>
                <tbody className="font-body-base">
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
            <div className="mt-16 pt-8 border-t border-outline-variant flex justify-between">
              <div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Generated by Carcinova Measurement Tool</p>
              </div>
              <div className="w-64">
                <div className="h-16 border-b border-on-surface relative mb-2"></div>
                <p className="font-body-base font-bold text-on-surface">Consulting Pathologist</p>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Floating Print Button */}
          <div className="print:hidden fixed bottom-8 right-8 flex items-center gap-4">
            <button onClick={() => navigate('/reports')} className="bg-surface-container-high border border-outline-variant text-on-surface rounded-full px-6 py-3 shadow-xl flex items-center gap-3 hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>arrow_back</span>
              <span className="font-label-caps text-label-caps">Back to Reports</span>
            </button>
            <button onClick={handlePrint} className="bg-primary text-on-primary rounded-full px-6 py-3 shadow-xl flex items-center gap-3 hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>print</span>
              <span className="font-label-caps text-label-caps">Print Report</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportPreview;
