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

const CaseHistory = () => {
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
      try {
        const response = await api.delete(`/cases/${id}`);
        if (response.data.success) {
          fetchCases();
        } else {
          alert(response.data.message || "Failed to delete case.");
        }
      } catch (err) {
        console.error(err);
        alert("Error deleting case.");
      }
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
        <main className="flex-grow p-margin-page overflow-hidden flex flex-col gap-6">

          {/* Header */}
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-display-lg text-display-lg text-on-surface">Case History Archive</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Comprehensive diagnostic log — {cases.length} case{cases.length !== 1 ? 's' : ''} total
                </p>
              </div>
              <button
                onClick={fetchCases}
                className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border border-outline-variant hover:bg-surface-container-highest transition-colors rounded-lg font-label-md text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Refresh
              </button>
            </div>
            <div className="flex gap-4 items-center">
              <div className="relative flex-grow">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
                <input
                  className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant focus:border-primary text-body-base font-body-base outline-none transition-all rounded-lg"
                  placeholder="Search by Case ID, Patient, or Classification..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Table */}
          <section className="flex-grow bg-surface-container-lowest border border-outline-variant overflow-hidden flex flex-col rounded-lg shadow-sm">
            <div className="flex-grow overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-surface-container-high z-10">
                  <tr className="border-b border-outline-variant">
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant">Date</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant">Case ID</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant">Patient</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant">Classification</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant">Max DOI</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant">T-Stage</th>
                    <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined animate-spin text-2xl block mx-auto mb-2">progress_activity</span>
                        Loading cases...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-danger">{error}</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-on-surface-variant">
                        {search ? 'No cases match your search.' : 'No cases yet. Classify an image on the Dashboard.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map(c => (
                      <tr key={c.id} onClick={() => navigate(`/case-detail/${c.id}`)} className="cursor-pointer hover:bg-surface-container transition-colors group font-mono-data text-mono-data">
                        <td className="px-6 py-4 text-on-surface-variant text-sm">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-primary">{c.case_id}</td>
                        <td className="px-6 py-4 text-on-surface">{c.patient_name || '—'}</td>
                        <td className="px-6 py-4">
                          {c.classification
                            ? <ClassificationBadge classification={c.classification} />
                            : <span className="text-outline-variant text-xs">—</span>
                          }
                        </td>
                        <td className="px-6 py-4">
                          {c.max_doi_mm
                            ? <span className="font-bold text-on-surface">{c.max_doi_mm.toFixed(2)} mm</span>
                            : <span className="text-outline-variant text-xs">—</span>
                          }
                        </td>
                        <td className="px-6 py-4">
                          {c.t_stage
                            ? <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded text-[10px] font-bold">{c.t_stage}</span>
                            : <span className="text-outline-variant text-xs">—</span>
                          }
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                            <button
                              title="Delete Case"
                              onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                            >
                              <span className="material-symbols-outlined hover:text-danger" data-icon="delete">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex justify-between items-center">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Showing {filtered.length} of {cases.length} cases
              </span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default CaseHistory;
