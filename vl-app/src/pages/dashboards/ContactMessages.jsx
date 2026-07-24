import { useState, useEffect } from 'react';
import { Loader2, DownloadCloud, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ContactMessages() {
  const { token, API_URL } = useAuth();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResponses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/pages/contact/survey/responses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          if (res.status === 404) throw new Error('No messages found yet.');
          throw new Error('Failed to load messages');
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
  }, [token, API_URL]);

  const downloadCsv = async () => {
    try {
      const res = await fetch(`${API_URL}/pages/contact/survey/responses?format=csv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to download CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contact-messages.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  // Extract all unique keys for table headers (name, email, subject, message)
  const allKeys = new Set();
  responses.forEach(r => {
    if (r.data) Object.keys(r.data).forEach(k => allKeys.add(k));
  });
  const headers = Array.from(allKeys);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-slate-900 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Contact Messages</h2>
            <p className="text-slate-400 text-sm">Review messages submitted through the contact us form.</p>
          </div>
        </div>
        <button
          onClick={downloadCsv}
          disabled={responses.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DownloadCloud className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-slate-400">
            {error}
          </div>
        ) : responses.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No messages have been submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap border-r border-white/5 font-semibold">Timestamp</th>
                  {headers.map(h => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap border-r border-white/5 font-semibold">
                      {h.charAt(0).toUpperCase() + h.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {responses.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400 border-r border-white/5">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    {headers.map(h => (
                      <td key={h} className="px-4 py-3 border-r border-white/5 max-w-[400px] truncate" title={r.data[h]}>
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
  );
}
