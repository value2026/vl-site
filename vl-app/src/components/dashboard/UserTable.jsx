import { useState, useEffect } from 'react';
import { Search, Trash2, ToggleLeft, ToggleRight, ChevronUp, ChevronDown, Eye, Loader2, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, safeJson } from '../../utils/api';
import { exportToCSV } from '../../utils/exportToCSV';
import StudentAnalyticsModal from './StudentAnalyticsModal';

const ROLE_BADGE = {
  admin:          'bg-red-500/20 text-red-300 border-red-500/30',
  nodal_centre:   'bg-orange-500/20 text-orange-300 border-orange-500/30',
  teacher:        'bg-blue-500/20 text-blue-300 border-blue-500/30',
  student:        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  content_admin:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  sim_admin:      'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  vl_manager:     'bg-pink-500/20 text-pink-300 border-pink-500/30',
  vl_coordinator: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
};

const ROLE_LABELS = {
  admin: 'Admin', nodal_centre: 'Nodal Centre', teacher: 'Teacher', student: 'Student',
  content_admin: 'Content Admin', sim_admin: 'Sim Admin', vl_manager: 'VL Manager',
  vl_coordinator: 'VL Co-ordinator',
};

export default function UserTable({ users, loading, onRefresh, hideActions = false, viewOnly = false }) {
  const { user: self } = useAuth();
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  const canDelete = self?.role === 'admin' || self?.role === 'vl_manager';

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = users
    .filter((u) => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase()) ||
                          ROLE_LABELS[u.role]?.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.isActive : !u.isActive);
      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      const va = a[sortKey] || '';
      const vb = b[sortKey] || '';
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedUsers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const exportData = filtered.map(u => ({
      Name: u.name,
      Email: u.email,
      Role: ROLE_LABELS[u.role] || u.role,
      Status: u.isActive ? 'Active' : 'Inactive',
      Joined: new Date(u.createdAt).toLocaleDateString(),
      'Labs Visited': u.uniqueLabsVisited ?? 'N/A',
      'Time Spent (min)': u.totalTimeSpentMinutes ?? 'N/A',
      'Quiz Attempts': u.quizAttemptsCount ?? 'N/A',
      'Quiz Pass Rate (%)': u.quizPassRate ?? 'N/A',
      'Avg Quiz Score (%)': u.averageQuizScore ?? 'N/A'
    }));
    exportToCSV(exportData, `academic_report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 text-slate-600" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-blue-400" />
      : <ChevronDown className="w-3 h-3 text-blue-400" />;
  };

  const toggleActive = async (userId, current) => {
    setActionLoading(userId + '_toggle');
    try {
      const res = await api.post(`/users/${userId}/update`, { isActive: !current });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data.message || 'Unable to update user status');
      }
      onRefresh?.();
      setSuccess(`User ${current ? 'deactivated' : 'activated'} successfully.`);
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const requestDeleteUser = (userId, name) => {
    setDeleteConfirm({ type: 'single', userId, name });
  };

  const confirmDeleteUser = async () => {
    const { userId, name } = deleteConfirm;
    setDeleteConfirm(null);
    setActionLoading(userId + '_delete');
    try {
      const res = await api.post(`/users/${userId}/delete`);
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data.message || `Unable to delete ${name}`);
      }
      setSelectedIds(prev => { const n = new Set(prev); n.delete(userId); return n; });
      onRefresh?.();
      setSuccess('User deleted successfully.');
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const requestBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setDeleteConfirm({ type: 'bulk', count: selectedIds.size });
  };

  const confirmBulkDelete = async () => {
    setDeleteConfirm(null);
    setBulkDeleting(true);
    let successCount = 0;
    let errors = [];
    try {
      const arr = Array.from(selectedIds);
      // Delete sequentially to avoid overwhelming the server
      for (const id of arr) {
        try {
          const res = await api.post(`/users/${id}/delete`);
          if (!res.ok) {
            const data = await safeJson(res);
            throw new Error(data.message || `Unable to delete user`);
          }
          successCount++;
        } catch (err) {
          errors.push(err.message);
        }
      }
      
      setSelectedIds(new Set());
      setBulkDeleteMode(false);
      onRefresh?.();
      
      if (errors.length > 0) {
        const uniqueErrors = [...new Set(errors)];
        setError(`Failed to delete ${errors.length} user(s): ${uniqueErrors[0]}${uniqueErrors.length > 1 ? ' (and more)' : ''}`);
        setSuccess(successCount > 0 ? `Successfully deleted ${successCount} user(s).` : '');
        setTimeout(() => setError(''), 5000);
        if (successCount > 0) setTimeout(() => setSuccess(''), 5000);
      } else {
        setSuccess(`Successfully deleted ${successCount} user(s).`);
        setError('');
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      console.error("Bulk delete failed:", err);
      setError(err.message || "An error occurred during bulk deletion. Please try again.");
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filtered.map(u => u.id).filter(id => id !== self?.id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
      {error && (
        <div className="m-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {success && (
        <div className="m-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {success}
        </div>
      )}
      
      {/* Toolbar */}
      <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or role…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        
        {viewOnly && (
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-semibold transition-all shadow-sm whitespace-nowrap"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}

        {!hideActions && !viewOnly && (
          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none min-w-[140px] cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Roles</option>
              {Object.entries(ROLE_LABELS).map(([val, label]) => (
                <option key={val} value={val} className="bg-slate-900">{label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none min-w-[130px] cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Status</option>
              <option value="active" className="bg-slate-900">Active</option>
              <option value="inactive" className="bg-slate-900">Inactive</option>
            </select>
            {canDelete && !bulkDeleteMode && (
              <button
                onClick={() => setBulkDeleteMode(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" /> Bulk Delete
              </button>
            )}
            {canDelete && bulkDeleteMode && (
              <div className="flex gap-2 items-center animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => { setBulkDeleteMode(false); setSelectedIds(new Set()); }}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                {selectedIds.size > 0 && (
                  <button
                    onClick={requestBulkDelete}
                    disabled={bulkDeleting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/20"
                  >
                    {bulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {bulkDeleting ? 'Deleting...' : `Confirm (${selectedIds.size})`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {!hideActions && canDelete && bulkDeleteMode && (
                <th className="px-4 py-3 text-left w-12 transition-all duration-300">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50 cursor-pointer"
                    checked={filtered.length > 0 && selectedIds.size === filtered.filter(u => u.id !== self?.id).length}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              {[
                { key: 'name',        label: 'Name' },
                { key: 'email',       label: 'Email' },
                { key: 'role',        label: 'Role' },
                { key: 'nodalCentre', label: 'Institution' },
                { key: 'isActive',    label: 'Status' },
                { key: 'createdAt',   label: 'Joined' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                >
                  <span className="flex items-center gap-1">
                    {label} <SortIcon col={key} />
                  </span>
                </th>
              ))}
              {!hideActions && !viewOnly && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
              {viewOnly && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Details
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={hideActions ? 5 : 7} className="px-4 py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
                    Loading users…
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={hideActions ? 5 : 7} className="px-4 py-12 text-center text-slate-500 text-sm">
                  No users found{search ? ` matching "${search}"` : ''}.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
                <tr key={u.id} className={`hover:bg-white/5 transition-colors group ${selectedIds.has(u.id) ? 'bg-blue-500/5' : ''}`}>
                  {!hideActions && canDelete && bulkDeleteMode && (
                    <td className="px-4 py-3 transition-all duration-300">
                      <input 
                        type="checkbox"
                        disabled={u.id === self?.id}
                        checked={selectedIds.has(u.id)}
                        onChange={() => toggleSelectOne(u.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${
                        { admin: 'from-red-500 to-rose-600', nodal_centre: 'from-orange-500 to-amber-500',
                          teacher: 'from-blue-500 to-indigo-600', student: 'from-emerald-500 to-green-600',
                          content_admin: 'from-purple-500 to-fuchsia-600', sim_admin: 'from-indigo-500 to-violet-600',
                          vl_manager: 'from-pink-500 to-rose-500' }[u.role]
                      }`}>
                        {u.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        {u.role === 'student' ? (
                          <span
                            onClick={() => setSelectedStudentId(u.id)}
                            className="text-white text-sm font-medium hover:underline cursor-pointer text-blue-400"
                            title="Click to view analytics"
                          >
                            {u.name}
                          </span>
                        ) : (
                          <span className="text-white text-sm font-medium">{u.name}</span>
                        )}
                        {(u.dept || u.facultyDept || u.org) && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {[
                              u.role === 'teacher' && u.designation,
                              u.facultyDept || u.dept,
                              u.org
                            ].filter(Boolean).join(' • ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_BADGE[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs font-medium max-w-[200px] truncate" title={u.nodalCentre?.name || ''}>
                    {u.nodalCentre?.name || (['admin', 'vl_manager', 'content_admin', 'sim_admin'].includes(u.role) ? 'Global Platform' : '—')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  {!hideActions && !viewOnly && (
                    <td className="px-4 py-3">
                      {u.id !== self?.id && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleActive(u.id, u.isActive)}
                            disabled={actionLoading === u.id + '_toggle'}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                            className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                          >
                            {u.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          {u.role === 'student' && (
                            <button
                              onClick={() => setSelectedStudentId(u.id)}
                              title="View student analytics"
                              className="text-slate-400 hover:text-blue-400 transition-colors p-1"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => requestDeleteUser(u.id, u.name)}
                              disabled={actionLoading === u.id + '_delete'}
                              title="Delete user"
                              className="text-slate-400 hover:text-red-400 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                  {viewOnly && u.role === 'student' && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setSelectedStudentId(u.id)}
                          title="View student analytics"
                          className="text-slate-400 hover:text-blue-400 transition-colors p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                  {viewOnly && u.role !== 'student' && <td />}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && filtered.length > 0 && (
        <div className="px-4 py-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50">
          <div className="text-xs text-slate-400">
            Showing <span className="font-medium text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-white">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-medium text-white">{filtered.length}</span> results
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-slate-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex items-center px-2">
              <span className="text-sm font-medium text-white bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-lg">
                {currentPage}
              </span>
              <span className="text-sm text-slate-500 px-2">of {totalPages}</span>
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium text-slate-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedStudentId && (
        <StudentAnalyticsModal
          userId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
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
                  {deleteConfirm.type === 'bulk' 
                    ? `Are you sure you want to PERMANENTLY delete ${deleteConfirm.count} users?` 
                    : `Are you sure you want to PERMANENTLY delete user "${deleteConfirm.name}"?`}
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
                    onClick={deleteConfirm.type === 'bulk' ? confirmBulkDelete : confirmDeleteUser}
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
    </div>
  );
}
