import { useState, useEffect } from 'react';
import { Eye, ChevronLeft, Calendar, User, Mail, Database, DownloadCloud, Loader2, Trash2, ClipboardList } from 'lucide-react';

export default function SurveyResponsesView({ pageSlug, token, API_URL }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingSub, setViewingSub] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const fetchResponses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/pages/${pageSlug}/survey/responses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          if (res.status === 404) throw new Error('No responses found yet.');
          throw new Error('Failed to load responses');
        }
        const data = await res.json();
        setResponses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResponses();
  }, [pageSlug, token, API_URL]);

  const extractField = (data, keywords) => {
    for (const key in data) {
      for (const keyword of keywords) {
        if (key.toLowerCase().includes(keyword.toLowerCase()) || key.replace('q_', '').toLowerCase().includes(keyword.toLowerCase())) {
          return Array.isArray(data[key]) ? data[key].join(', ') : data[key];
        }
      }
    }
    return '-';
  };

  const downloadCsv = async () => {
    try {
      const res = await fetch(`${API_URL}/pages/${pageSlug}/survey/responses?format=csv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to download CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pageSlug}-responses.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_URL}/pages/${pageSlug}/survey/responses/${deleteTarget}/delete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete response');
      setResponses(responses.filter(r => r.id !== deleteTarget));
      if (viewingSub?.id === deleteTarget) setViewingSub(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Extract all unique keys for table headers
  const allKeys = new Set();
  responses.forEach(r => {
    if (r.data) Object.keys(r.data).forEach(k => allKeys.add(k));
  });
  const headers = Array.from(allKeys);

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl w-full flex flex-col shadow-2xl overflow-hidden mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-white/10 bg-slate-800/50">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            pageSlug === 'contact' ? 'bg-blue-500/20' : 'bg-emerald-500/20'
          }`}>
            {pageSlug === 'contact' ? (
              <Mail className="w-6 h-6 text-blue-400" />
            ) : (
              <ClipboardList className="w-6 h-6 text-emerald-400" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              {pageSlug === 'student-survey' ? 'Student Survey Responses' :
               pageSlug === 'contact' ? 'Contact Messages' :
               'Faculty Survey Responses'}
            </h3>
            <p className="text-slate-400 text-sm">
              {pageSlug === 'contact' ? 'Review messages submitted through the contact us form.' : 'Review all submitted feedback and evaluations.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <button
            onClick={downloadCsv}
            disabled={responses.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DownloadCloud className="w-5 h-5" />
            Download CSV
          </button>
        </div>
      </div>

        <div className="flex-1 overflow-auto p-6 bg-slate-950/50 rounded-b-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-slate-400 text-sm">Loading responses...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-slate-400">
              {error}
            </div>
          ) : viewingSub ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 max-w-4xl mx-auto">
              <button onClick={() => setViewingSub(null)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
                <ChevronLeft className="w-4 h-4" /> Back to Submissions
              </button>
              <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                <div className="mb-6 pb-4 border-b border-slate-800 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Response Details</h3>
                    <div className="flex items-center gap-2 text-sm text-blue-400 font-semibold bg-blue-500/10 px-3 py-1 rounded-lg w-max border border-blue-500/20 mt-2">
                      {pageSlug === 'student-survey' ? 'Student Survey' : 'Faculty Survey'}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(viewingSub.createdAt).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleDelete(viewingSub.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors ml-auto sm:ml-0"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
                <div className="space-y-5">
                  {Object.entries(viewingSub.data).map(([q, a], i) => {
                    const cleanQ = q.replace('q_', '').replace(/_/g, ' ');
                    return (
                      <div key={i} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 shadow-inner hover:border-slate-700/50 transition-colors">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{cleanQ}</p>
                        <p className="text-base text-slate-200 font-medium">
                          {Array.isArray(a) ? a.join(', ') : (a || <span className="italic text-slate-600">No answer</span>)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-inner">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/50 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">Date Submitted</th>
                      <th className="px-6 py-4 whitespace-nowrap">Respondent Name</th>
                      <th className="px-6 py-4 whitespace-nowrap">Contact Info</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {responses.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No responses have been submitted yet.</td></tr>
                    ) : (
                      responses.map(r => {
                        const name = extractField(r.data, ['name', 'full name', 'first name']);
                        const email = extractField(r.data, ['email', 'mail', 'contact']);
                        
                        return (
                          <tr key={r.id} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-4 text-slate-400 text-sm font-medium whitespace-nowrap">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-500" />
                                <span className="font-bold text-white truncate max-w-[200px]">{name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Mail className="w-4 h-4 text-slate-500" />
                                <span className="truncate max-w-[200px]">{email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => setViewingSub(r)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-colors"
                              >
                                <Eye className="w-4 h-4" /> View Details
                              </button>
                              <button
                                onClick={() => handleDelete(r.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Response?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to delete this survey response? This action is permanent and cannot be undone.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all border border-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
