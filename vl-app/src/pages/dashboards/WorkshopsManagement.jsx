import React, { useState, useEffect, useCallback } from 'react';
import { 
  Presentation, Plus, RefreshCw, AlertCircle, Loader2, X, Check, XCircle, Trash2, Edit, Users,
  Calendar, MapPin, Clock, MoreVertical, LayoutGrid, List, ChevronRight, BarChart3, GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import WorkshopRegistrationsModal from '../../components/dashboard/WorkshopRegistrationsModal';
import HostWorkshopRequestsManager from '../../components/dashboard/HostWorkshopRequestsManager';
import { useNavigate, useLocation } from 'react-router-dom';

export default function WorkshopsManagement() {
  const { token, API_URL, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const rolePath = location.pathname.split('/')[2]; // admin or vl-manager

  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI State
  const [mainTab, setMainTab] = useState('workshops'); // 'workshops' or 'host-requests'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [viewingRegistrations, setViewingRegistrations] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchWorkshops = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/workshops`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch workshops');
      const data = await res.json();
      setWorkshops(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load workshops. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  const openCreateModal = () => navigate(`/dashboard/${rolePath}/workshops/new`);
  const openEditModal = (w) => navigate(`/dashboard/${rolePath}/workshops/${w.id}`);

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

  const requestDeleteWorkshop = (w) => setDeleteConfirm(w);

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

  // Derived Stats
  const now = new Date();
  const stats = {
    total: workshops.length,
    upcoming: workshops.filter(w => new Date(w.date) > now && w.status === 'approved').length,
    completed: workshops.filter(w => new Date(w.date) <= now && w.status === 'approved').length,
    pending: workshops.filter(w => w.status === 'pending').length
  };

  // Filtering
  const filteredWorkshops = workshops.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (w.location && w.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center gap-3">
            <Presentation className="w-8 h-8 text-purple-400" />
            Workshop Management
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl">
            Create, schedule, and manage platform workshops. Review participant registrations, handle approvals, and track attendance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchWorkshops}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" /> Create Workshop
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Workshops" value={stats.total} icon={Presentation} color="blue" />
        <StatCard title="Upcoming" value={stats.upcoming} icon={Calendar} color="emerald" />
        <StatCard title="Completed" value={stats.completed} icon={Check} color="purple" />
        <StatCard title="Pending Approval" value={stats.pending} icon={Clock} color="amber" />
      </div>

      {/* Top Level Tabs */}
      <div className="flex border-b border-slate-800/50 mb-2">
        <button
          onClick={() => setMainTab('workshops')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            mainTab === 'workshops' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Workshops
        </button>
        <button
          onClick={() => setMainTab('host-requests')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            mainTab === 'host-requests' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Host Workshop Requests
        </button>
      </div>

      {mainTab === 'host-requests' ? (
        <HostWorkshopRequestsManager />
      ) : (
      <>
        {/* Main Content Area */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search workshops..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-600"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workshop List/Grid */}
        <div className="p-6 min-h-[400px]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 py-20">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
              <p className="text-sm font-medium animate-pulse">Loading workshops...</p>
            </div>
          ) : filteredWorkshops.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700/50">
                <Presentation className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No workshops found</h3>
              <p className="text-slate-400 max-w-sm mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? "Try adjusting your search filters to find what you're looking for." 
                  : "You haven't created any workshops yet. Click the button above to get started."}
              </p>
              {!(searchQuery || statusFilter !== 'all') && (
                <button
                  onClick={openCreateModal}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors border border-slate-700"
                >
                  Create Your First Workshop
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkshops.map(w => (
                <WorkshopCard 
                  key={w.id} 
                  workshop={w} 
                  user={user} 
                  onEdit={() => openEditModal(w)}
                  onDelete={() => requestDeleteWorkshop(w)}
                  onViewRegistrations={() => setViewingRegistrations(w)}
                  onStatusUpdate={(status) => updateStatus(w.id, status)}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                    <th className="px-4 py-3">Workshop</th>
                    <th className="px-4 py-3">Schedule & Location</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredWorkshops.map(w => (
                    <WorkshopListItem
                      key={w.id}
                      workshop={w}
                      user={user}
                      onEdit={() => openEditModal(w)}
                      onDelete={() => requestDeleteWorkshop(w)}
                      onViewRegistrations={() => setViewingRegistrations(w)}
                      onStatusUpdate={(status) => updateStatus(w.id, status)}
                      actionLoading={actionLoading}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Workshop?</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  You are about to permanently delete <strong className="text-white">{deleteConfirm.title}</strong>. This action cannot be undone and all associated registrations will be lost.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
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

      {/* Registrations Modal */}
      {viewingRegistrations && (
        <WorkshopRegistrationsModal
          workshop={viewingRegistrations}
          onClose={() => setViewingRegistrations(null)}
        />
      )}
    </div>
  );
}

// --- Subcomponents ---

function StatCard({ title, value, icon: Icon, color }) {
  const colorStyles = {
    blue: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/20',
    emerald: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20',
    purple: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/20',
    amber: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-lg flex items-center gap-5 hover:border-slate-700 transition-colors">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorStyles[color]} border flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white">{value}</h3>
      </div>
    </div>
  );
}

function WorkshopCard({ workshop, user, onEdit, onDelete, onViewRegistrations, onStatusUpdate, actionLoading }) {
  const dateObj = new Date(workshop.date);
  const isPast = dateObj < new Date();
  
  const statusStyles = {
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-3xl p-1 flex flex-col hover:border-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${statusStyles[workshop.status] || statusStyles.pending}`}>
            {workshop.status}
          </span>
          <div className="flex gap-1">
            {workshop.mode === 'Online' && <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Online</span>}
            {workshop.mode === 'Offline' && <span className="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Offline</span>}
            {workshop.mode === 'Hybrid' && <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Hybrid</span>}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
          {workshop.title}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-6 h-10">
          {workshop.description || "No description provided."}
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
              <Calendar className={`w-4 h-4 ${isPast ? 'text-slate-500' : 'text-emerald-400'}`} />
            </div>
            <div>
              <p className="text-white font-medium">{dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-xs text-slate-500">{isPast ? 'Completed' : 'Upcoming'}</p>
            </div>
          </div>
          {workshop.location && (
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <p className="truncate" title={workshop.location}>{workshop.location}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 bg-slate-950/50 rounded-b-[22px] border-t border-slate-800 flex flex-wrap gap-2 justify-end">
        {(user?.role === 'admin' || user?.role === 'vl_manager') && (
          <>
            {workshop.status === 'pending' && user?.role === 'admin' && (
              <>
                <button onClick={() => onStatusUpdate('approved')} className="p-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Approve">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => onStatusUpdate('rejected')} className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors" title="Reject">
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
            {(user?.role === 'admin' || workshop.createdBy?.id === user?.id) && (
              <>
                <button onClick={onViewRegistrations} className="px-3 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-xs font-bold transition-colors flex items-center gap-1.5 flex-1 justify-center">
                  <Users className="w-4 h-4" /> Registrations
                </button>
                <button onClick={onEdit} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={onDelete} 
                  disabled={actionLoading === workshop.id}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50" 
                  title="Delete"
                >
                  {actionLoading === workshop.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function WorkshopListItem({ workshop, user, onEdit, onDelete, onViewRegistrations, onStatusUpdate, actionLoading }) {
  const dateObj = new Date(workshop.date);
  
  const statusStyles = {
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <tr className="hover:bg-slate-800/30 transition-colors group">
      <td className="px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Presentation className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base group-hover:text-purple-400 transition-colors">{workshop.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{workshop.mode || 'Online'}</span>
              <span className="text-xs text-slate-500 truncate max-w-[200px]">{workshop.description || 'No description'}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-400" />
            {dateObj.toLocaleDateString()}
          </div>
          {workshop.location && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5" />
              {workshop.location}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border inline-flex items-center ${statusStyles[workshop.status] || statusStyles.pending}`}>
          {workshop.status}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {(user?.role === 'admin' || user?.role === 'vl_manager') && (
            <>
              {workshop.status === 'pending' && user?.role === 'admin' && (
                <>
                  <button onClick={() => onStatusUpdate('approved')} className="p-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Approve">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => onStatusUpdate('rejected')} className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors" title="Reject">
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
              {(user?.role === 'admin' || workshop.createdBy?.id === user?.id) && (
                <>
                  <button onClick={onViewRegistrations} className="p-2 rounded-xl text-purple-400 hover:bg-purple-500/10 transition-colors flex items-center gap-1.5 text-xs font-bold" title="View Registrations">
                    <Users className="w-4 h-4" /> <span className="hidden xl:inline">Registrations</span>
                  </button>
                  <div className="w-px h-6 bg-slate-700 mx-1"></div>
                  <button onClick={onEdit} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={onDelete} 
                    disabled={actionLoading === workshop.id}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50" 
                    title="Delete"
                  >
                    {actionLoading === workshop.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
