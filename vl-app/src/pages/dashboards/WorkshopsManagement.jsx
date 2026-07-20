import { useState, useEffect, useCallback } from 'react';
import { Presentation, Plus, RefreshCw, AlertCircle, Loader2, Save, X, Check, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function WorkshopsManagement() {
  const { token, API_URL, user } = useAuth();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '', mode: 'Online', seats: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkshops = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/workshops`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setWorkshops(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch workshops');
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/workshops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to create workshop');
      }
      setShowModal(false);
      setForm({ title: '', description: '', date: '', location: '', mode: 'Online', seats: '' });
      fetchWorkshops();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this workshop?`)) return;
    try {
      const res = await fetch(`${API_URL}/workshops/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to update workshop');
      }
      fetchWorkshops();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-2xl font-bold flex items-center gap-2">
            <Presentation className="w-6 h-6 text-purple-400" />
            Workshops
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage platform workshops and approval flows.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchWorkshops}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> New Workshop
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/5 rounded-xl">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Created By</th>
                <th className="px-4 py-3">Status</th>
                {user?.role === 'admin' && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {workshops.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 5 : 4} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No workshops created yet.
                  </td>
                </tr>
              ) : (
                workshops.map(w => (
                  <tr key={w.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{w.title}</div>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="text-[10px] bg-white/10 text-white/70 px-1.5 rounded">{w.mode || 'Online'}</span>
                        {w.location && <span className="text-xs text-slate-400 truncate max-w-[150px]">{w.location}</span>}
                      </div>
                      {w.description && <div className="text-xs text-slate-500 mt-1 truncate max-w-xs">{w.description}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {new Date(w.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {w.createdBy?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        w.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        w.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-4 py-3 text-right">
                        {w.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => updateStatus(w.id, 'approved')}
                              className="text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 px-2 py-1.5 rounded-lg flex items-center gap-1 text-xs font-semibold transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => updateStatus(w.id, 'rejected')}
                              className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1.5 rounded-lg flex items-center gap-1 text-xs font-semibold transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Propose New Workshop</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Workshop Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Introduction to Virtual Labs"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. IIT Bombay / Virtual Labs"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mode</label>
                  <select
                    value={form.mode}
                    onChange={e => setForm({ ...form, mode: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="In-person">In-person</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Available Seats</label>
                  <input
                    type="number"
                    value={form.seats}
                    onChange={e => setForm({ ...form, seats: e.target.value })}
                    placeholder="e.g. 100"
                    min="1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief agenda or description..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
              </div>
              
              {user?.role !== 'admin' && (
                <p className="text-xs text-amber-400/80 italic mt-2 text-center">
                  Workshops require admin approval before becoming active.
                </p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.title.trim() || !form.date}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
