import { useState } from 'react';
import { Search, Trash2, ToggleLeft, ToggleRight, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StudentAnalyticsModal from './StudentAnalyticsModal';

const ROLE_BADGE = {
  admin:        'bg-red-500/20 text-red-300 border-red-500/30',
  nodal_centre: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  teacher:      'bg-blue-500/20 text-blue-300 border-blue-500/30',
  student:      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  content_admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  sim_admin:    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  vl_manager:   'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

const ROLE_LABELS = {
  admin: 'Admin', nodal_centre: 'Nodal Centre', teacher: 'Teacher', student: 'Student',
  content_admin: 'Content Admin', sim_admin: 'Sim Admin', vl_manager: 'VL Manager',
};

export default function UserTable({ users, loading, onRefresh, hideActions = false }) {
  const { token, API_URL, user: self } = useAuth();
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

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

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 text-slate-600" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-blue-400" />
      : <ChevronDown className="w-3 h-3 text-blue-400" />;
  };

  const toggleActive = async (userId, current) => {
    setActionLoading(userId + '_toggle');
    try {
      await fetch(`${API_URL}/users/${userId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ isActive: !current }),
      });
      onRefresh?.();
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setActionLoading(userId + '_delete');
    try {
      await fetch(`${API_URL}/users/${userId}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      onRefresh?.();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
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
        {!hideActions && (
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
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
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
              {!hideActions && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={hideActions ? 5 : 6} className="px-4 py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
                    Loading users…
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={hideActions ? 5 : 6} className="px-4 py-12 text-center text-slate-500 text-sm">
                  No users found{search ? ` matching "${search}"` : ''}.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-white/3 transition-colors group">
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
                  {!hideActions && (
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
                          <button
                            onClick={() => deleteUser(u.id, u.name)}
                            disabled={actionLoading === u.id + '_delete'}
                            title="Delete user"
                            className="text-slate-400 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Footer */}
      {!loading && filtered.length > 0 && (
        <div className="px-4 py-3 border-t border-white/10 text-xs text-slate-500">
          Showing {filtered.length} of {users.length} users
        </div>
      )}

      {selectedStudentId && (
        <StudentAnalyticsModal
          userId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}
    </div>
  );
}
