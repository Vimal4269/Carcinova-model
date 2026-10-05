import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CLASSIFICATION_STYLES = {
  'Normal':             { bg: 'bg-success/10',  text: 'text-success',  dot: 'bg-success',   label: 'Normal' },
  'OSCC':               { bg: 'bg-danger/10',   text: 'text-danger',   dot: 'bg-danger',    label: 'OSCC' },
  'OSCC induced OSMF':  { bg: 'bg-warning/10',  text: 'text-warning',  dot: 'bg-warning',   label: 'OSCC induced OSMF' },
};

const ClassificationBadge = ({ classification }) => {
  const style = CLASSIFICATION_STYLES[classification] || { bg: 'bg-surface-container-high', text: 'text-outline-variant', dot: 'bg-outline-variant', label: classification || 'Unclassified' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
};

const ReportsList = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cases/list');
      if (response.data.success) {
        setCases(response.data.cases);
      } else {
        setError('Failed to load cases.');
      }
    } catch (err) {
      setError('Could not connect to backend.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = cases.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.case_id || '').toLowerCase().includes(q) ||
      (c.patient_name || '').toLowerCase().includes(q) ||
      (c.classification || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full h-full relative">
      <div className="flex-grow flex flex-col h-full">
        <main className="flex-grow p-4 md:p-margin-page overflow-hidden flex flex-col gap-4 md:gap-6">

          {/* Header */}
          <section className="flex flex-col gap-3 md:gap-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3">
              <div>
                <h2 className="text-xl md:font-display-lg md:text-display-lg text-on-surface font-bold">Patient Reports</h2>
                <p className="text-sm text-on-surface-variant">
                  Select a patient to view their diagnostic report.
                </p>
              </div>
              <button
                onClick={fetchCases}
                className="flex items-center justify-center gap-2 w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 bg-surface-container-high border border-outline-variant hover:bg-surface-container-highest transition-colors rounded-lg font-label-md text-on-surface self-end"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span className="hidden md:inline">Refresh</span>
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant focus:border-primary text-body-base outline-none transition-all rounded-lg"
                placeholder="Search patients..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </section>

          {/* Desktop Table (hidden on mobile) */}
          <section className="hidden md:flex flex-grow bg-surface-container-lowest border border-outline-variant overflow-hidden flex-col rounded-lg shadow-sm">
            <div className="flex-grow overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-surface-container-high z-10">
                  <tr className="border-b border-outline-variant">
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant">Date</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant">Case ID</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant">Patient Name</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant">Classification</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined animate-spin text-2xl block mx-auto mb-2">progress_activity</span>
                        Loading patients...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-danger">{error}</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                        {search ? 'No patients match your search.' : 'No cases available.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map(c => (
                      <tr key={c.id} className="hover:bg-surface-container transition-colors group">
                        <td className="px-6 py-4 text-on-surface-variant text-sm">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-primary font-mono-data">{c.case_id}</td>
                        <td className="px-6 py-4 text-on-surface">{c.patient_name || '—'}</td>
                        <td className="px-6 py-4">
                          {c.classification
                            ? <ClassificationBadge classification={c.classification} />
                            : <span className="text-outline-variant text-xs">—</span>
                          }
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/report-preview/${c.id}`)}
                            className="bg-primary text-on-primary px-4 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity font-label-md flex items-center gap-2 ml-auto h-10"
                          >
                            <span className="material-symbols-outlined text-[18px]">print</span>
                            View Report
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex justify-between items-center">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Showing {filtered.length} of {cases.length} patients
              </span>
            </div>
          </section>

          {/* Mobile Card List */}
          <section className="md:hidden flex flex-col gap-3 flex-grow overflow-auto pb-4">
            {loading ? (
              <div className="p-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin text-2xl block mx-auto mb-2">progress_activity</span>
                Loading patients...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-danger">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-sm">
                {search ? 'No patients match your search.' : 'No cases available.'}
              </div>
            ) : (
              filtered.map(c => (
                <div
                  key={c.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-primary text-sm font-mono-data">{c.case_id}</span>
                      <span className="text-on-surface font-medium text-sm">{c.patient_name || '—'}</span>
                    </div>
                    {c.classification ? (
                      <ClassificationBadge classification={c.classification} />
                    ) : (
                      <span className="text-outline-variant text-xs">—</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant">{new Date(c.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={() => navigate(`/report-preview/${c.id}`)}
                      className="bg-primary text-on-primary px-4 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity font-label-md flex items-center gap-2 h-10 active:scale-[0.97] text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">print</span>
                      Report
                    </button>
                  </div>
                </div>
              ))
            )}
            <div className="text-center text-xs text-on-surface-variant py-2">
              Showing {filtered.length} of {cases.length} patients
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ReportsList;
