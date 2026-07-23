import { useState, useEffect, useCallback } from 'react';
import { Presentation, Plus, RefreshCw, AlertCircle, Loader2, X, Check, XCircle, Trash2, Edit, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import WorkshopRegistrationsModal from '../../components/dashboard/WorkshopRegistrationsModal';
import { useNavigate, useLocation } from 'react-router-dom';

export default function WorkshopsManagement() {
  const { token, API_URL, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const rolePath = location.pathname.split('/')[2]; // e.g. admin or vl-manager
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Unified Editor State
  const [editorState, setEditorState] = useState({ open: false, workshop: null });
  const [viewingRegistrations, setViewingRegistrations] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

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

  const openCreateModal = () => {
    navigate(`/dashboard/${rolePath}/workshops/new`);
  };

  const openEditModal = (workshop) => {
    navigate(`/dashboard/${rolePath}/workshops/${workshop.id}`);
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

  const requestDeleteWorkshop = (w) => {
    setDeleteConfirm(w);
  };

  const confirmDeleteWorkshop = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    setActionLoading(id);
    
    try {
      const res = await fetch(`${API_URL}/workshops/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete workshop');
      
      fetchWorkshops();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
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
            onClick={openCreateModal}
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
                {(user?.role === 'admin' || user?.role === 'vl_manager') && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {workshops.length === 0 ? (
                <tr>
                  <td colSpan={(user?.role === 'admin' || user?.role === 'vl_manager') ? 5 : 4} className="px-4 py-8 text-center text-slate-500 text-sm">
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
                    {(user?.role === 'admin' || user?.role === 'vl_manager') && (
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-end gap-2">
                          
                          {(user?.role === 'admin' || w.createdBy?.id === user?.id) && (
                            <button
                              onClick={() => setViewingRegistrations(w)}
                              className="text-purple-400 hover:text-purple-300 bg-purple-400/10 hover:bg-purple-400/20 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap w-full sm:w-auto"
                              title="View Registrations"
                            >
                              <Users className="w-3.5 h-3.5" /> View Registered Students Data
                            </button>
                          )}

                          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                            {w.status === 'pending' && user?.role === 'admin' && (
                              <>
                                <button
                                  onClick={() => updateStatus(w.id, 'approved')}
                                  className="text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 px-2 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-semibold transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => updateStatus(w.id, 'rejected')}
                                  className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-semibold transition-colors"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            )}

                            {(user?.role === 'admin' || w.createdBy?.id === user?.id) && (
                              <>
                                <button
                                  onClick={() => openEditModal(w)}
                                  className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-[11px] font-semibold"
                                  title="Edit workshop settings and registration form"
                                >
                                  <Edit className="w-3.5 h-3.5" /> Edit / Setup Form
                                </button>
                                <button
                                  onClick={() => requestDeleteWorkshop(w)}
                                  disabled={actionLoading === w.id}
                                  className="text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold disabled:opacity-50"
                                  title="Delete workshop"
                                >
                                  {actionLoading === w.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-slate-900 border border-red-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Confirm Deletion</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Are you sure you want to permanently delete workshop <strong className="text-white">{deleteConfirm.title}</strong>?
                  <br /><br />
                  <span className="text-red-400 font-semibold">This action cannot be undone.</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteWorkshop}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-colors"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingRegistrations && (
        <WorkshopRegistrationsModal
          workshop={viewingRegistrations}
          onClose={() => setViewingRegistrations(null)}
        />
      )}
    </div>
  );
}
