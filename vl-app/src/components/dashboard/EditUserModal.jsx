import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, safeJson } from '../../utils/api';

const ROLE_LABELS = {
  admin:         'Administrator',
  nodal_centre:  'Nodal Centre Admin',
  teacher:       'Faculty / Instructor',
  student:       'Student',
  vl_manager:    'VL Manager',
  vl_coordinator:'VL Co-ordinator',
};

const AVAILABLE_PERMISSIONS = [
  { key: 'manage_users',        label: 'Manage Users' },
  { key: 'manage_content',      label: 'Manage Content' },
  { key: 'manage_simulations',  label: 'Manage Simulations' },
  { key: 'manage_institutions', label: 'Manage Institutions' },
  { key: 'manage_workshops',    label: 'Manage Workshops' },
];

export default function EditUserModal({ isOpen, onClose, onSuccess, userToEdit }) {
  const { user: self, API_URL } = useAuth();
  
  const [form, setForm] = useState({
    name: '',
    customPermissions: [],
    managedSubjectIds: [],
  });
  
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_URL}/subjects`)
        .then(r => r.json())
        .then(data => setSubjects(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [isOpen, API_URL]);

  useEffect(() => {
    if (isOpen && userToEdit) {
      setForm({
        name: userToEdit.name || '',
        customPermissions: userToEdit.customPermissions || [],
        managedSubjectIds: userToEdit.managedSubjectIds || [],
      });
      setError('');
    }
  }, [isOpen, userToEdit]);

  if (!isOpen || !userToEdit) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/users/${userToEdit.id}/update`, form);
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data.message || 'Failed to update user');
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isCoordinator = userToEdit.role === 'vl_coordinator';
  const canEditPermissions = self?.role === 'admin' || self?.role === 'vl_manager';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Edit User: {userToEdit.name}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input 
                type="text" 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <input 
                type="text" 
                value={ROLE_LABELS[userToEdit.role] || userToEdit.role} 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                disabled
              />
            </div>

            {isCoordinator && (
              <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Manage Broad Areas (Subjects)
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjects.length > 0 ? subjects.map(sub => {
                    const isChecked = form.managedSubjectIds.includes(sub.id);
                    return (
                      <label key={sub.id} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                        isChecked ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}>
                        <input
                          type="checkbox"
                          className="accent-emerald-500"
                          checked={isChecked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...form.managedSubjectIds, sub.id]
                              : form.managedSubjectIds.filter(id => id !== sub.id);
                            setForm({ ...form, managedSubjectIds: next });
                          }}
                        />
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm">{sub.icon}</span> {sub.title}
                        </span>
                      </label>
                    );
                  }) : (
                    <span className="text-xs text-slate-500 italic">No broad areas available</span>
                  )}
                </div>
              </div>
            )}

            {canEditPermissions && (
              <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Custom Permissions
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_PERMISSIONS.map(({ key, label }) => {
                    const isChecked = form.customPermissions.includes(key);
                    return (
                      <label key={key} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-500/15 border-blue-500/40 text-blue-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}>
                        <input
                          type="checkbox"
                          className="accent-blue-500"
                          checked={isChecked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...form.customPermissions, key]
                              : form.customPermissions.filter(p => p !== key);
                            setForm({ ...form, customPermissions: next });
                          }}
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-white/[0.02] shrink-0 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Cancel
          </button>
          <button type="submit" form="edit-user-form" disabled={loading} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
