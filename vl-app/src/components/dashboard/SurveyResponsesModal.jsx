import { useState, useEffect } from 'react';
import { X, Loader2, DownloadCloud } from 'lucide-react';

export default function SurveyResponsesModal({ isOpen, onClose, pageSlug, token, API_URL }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, pageSlug, token, API_URL]);

  if (!isOpen) return null;

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

  // Extract all unique keys for table headers
  const allKeys = new Set();
  responses.forEach(r => {
    if (r.data) Object.keys(r.data).forEach(k => allKeys.add(k));
  });
  const headers = Array.from(allKeys);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-800/50 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              {pageSlug === 'student-survey' ? 'Student Survey Responses' : 'Faculty Survey Responses'}
            </h3>
            <p className="text-slate-400 text-sm">Review all submitted feedback and evaluations.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={downloadCsv}
              disabled={responses.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DownloadCloud className="w-4 h-4" />
              Download CSV
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-slate-400 text-sm">Loading responses...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-slate-400">
              {error}
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              No responses have been submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap border-r border-white/5 font-semibold">Timestamp</th>
                    {headers.map(h => (
                      <th key={h} className="px-4 py-3 whitespace-nowrap border-r border-white/5 font-semibold">
                        {h.replace('q_', '')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {responses.map((r, i) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-400 border-r border-white/5">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      {headers.map(h => (
                        <td key={h} className="px-4 py-3 border-r border-white/5 max-w-[200px] truncate" title={r.data[h]}>
                          {r.data[h] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
