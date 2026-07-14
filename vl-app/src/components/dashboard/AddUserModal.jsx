import { useState } from 'react';
import { X, Eye, EyeOff, UserPlus, Loader2, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Roles each caller can create
const CREATABLE_ROLES = {
  admin:        ['admin', 'nodal_centre', 'teacher', 'student'],
  nodal_centre: ['teacher', 'student'],
  teacher:      ['student'],
};

const ROLE_LABELS = {
  admin:        'Administrator',
  nodal_centre: 'Nodal Centre',
  teacher:      'Teacher',
  student:      'Student',
};

const DEFAULT_FORM = { name: '', email: '', password: '', role: 'student' };

export default function AddUserModal({ isOpen, onClose, onSuccess, defaultRole }) {
  const { user, token, API_URL } = useAuth();
  const allowedRoles = CREATABLE_ROLES[user?.role] || [];

  const [activeMode, setActiveMode] = useState('single'); // 'single' or 'bulk'
  const [form,    setForm]    = useState({ ...DEFAULT_FORM, role: defaultRole || allowedRoles[0] || 'student' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Bulk CSV state
  const [csvText, setCsvText] = useState('');
  const [csvFileName, setCsvFileName] = useState('');
  const [parsedPreview, setParsedPreview] = useState([]); // Array of { name, email, password }
  const [bulkResult, setBulkResult] = useState(null); // { createdCount, skippedCount, skipped }

  if (!isOpen) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Single User Creation ─────────────────────────────────────
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/users`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create user');
      onSuccess?.(data);
      resetState();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Bulk CSV Parser ──────────────────────────────────────────
  const parseCSV = (text) => {
    try {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return [];

      const parsed = [];
      let startIdx = 0;

      // Detect header row and skip if it matches field names
      const firstLine = lines[0].toLowerCase();
      if (firstLine.includes('name') || firstLine.includes('email') || firstLine.includes('pass')) {
        startIdx = 1;
      }

      for (let i = startIdx; i < lines.length; i++) {
        // Split by comma, handling potential quotes
        const cols = lines[i].split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
        if (cols.length >= 3) {
          parsed.push({
            name: cols[0],
            email: cols[1],
            password: cols[2],
          });
        }
      }
      return parsed;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const handleFileChange = (e) => {
    setError('');
    setBulkResult(null);
    const file = e.target.files[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      setCsvText(text);
      const preview = parseCSV(text);
      setParsedPreview(preview);
    };
    reader.onerror = () => {
      setError('Failed to read CSV file.');
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (e) => {
    setError('');
    setBulkResult(null);
    const text = e.target.value;
    setCsvText(text);
    const preview = parseCSV(text);
    setParsedPreview(preview);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBulkResult(null);

    if (parsedPreview.length === 0) {
      setError('Please upload a valid CSV file or paste comma-separated student rows.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ students: parsedPreview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to bulk import users');

      setBulkResult(data);
      onSuccess?.();
      // Clear preview
      setParsedPreview([]);
      setCsvText('');
      setCsvFileName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setForm({ ...DEFAULT_FORM, role: defaultRole || allowedRoles[0] || 'student' });
    setCsvText('');
    setCsvFileName('');
    setParsedPreview([]);
    setBulkResult(null);
    setError('');
  };

  const downloadSampleCSV = () => {
    const headers = ['Name', 'Email', 'Password'];
    const rows = [
      ['Alice Smith', 'alice.smith@school.edu', 'AlicePassword123'],
      ['Bob Jones', 'bob.jones@school.edu', 'BobPassword456'],
    ];
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "student_bulk_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseModal = () => {
    resetState();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCloseModal} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">Register Users</h2>
              <p className="text-slate-400 text-xs mt-0.5">Register single accounts or import student lists</p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl w-fit mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveMode('single'); setError(''); setBulkResult(null); }}
            className={`px-4 py-2 rounded-lg transition-all ${activeMode === 'single' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Single User
          </button>
          <button
            type="button"
            onClick={() => { setActiveMode('bulk'); setError(''); setBulkResult(null); }}
            className={`px-4 py-2 rounded-lg transition-all ${activeMode === 'bulk' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Bulk Add Students (CSV)
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-400 flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {bulkResult && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-xs text-emerald-400 space-y-1">
            <div className="flex gap-2 items-center font-bold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Import Summary: Registered {bulkResult.createdCount} students successfully!</span>
            </div>
            {bulkResult.skippedCount > 0 && (
              <p className="text-slate-400 mt-1">
                Skipped {bulkResult.skippedCount} duplicates. (e.g. {bulkResult.skipped.slice(0, 3).map(s => s.email).join(', ')})
              </p>
            )}
          </div>
        )}

        {activeMode === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            {/* Role select */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
              >
                {allowedRoles.map((r) => (
                  <option key={r} value={r} className="bg-slate-850 text-white">
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Anandi Sharma"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="user@institution.edu"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <UserPlus className="w-4.5 h-4.5" />}
                {loading ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            {/* CSV File Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Upload CSV File</label>
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-semibold"
                >
                  📥 Download CSV Template
                </button>
              </div>
              <div className="border border-dashed border-white/10 bg-white/5 rounded-2xl p-5 text-center flex flex-col items-center justify-center hover:border-blue-500/30 transition-colors relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-white text-xs font-bold">{csvFileName ? `Selected: ${csvFileName}` : 'Choose .csv file'}</span>
                <span className="text-[10px] text-slate-500 mt-1">Must contain columns: Name, Email, Password</span>
              </div>
            </div>

            {/* Paste Box */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Or Paste Comma-Separated Data</label>
                {parsedPreview.length > 0 && <span className="text-[10px] text-emerald-400 font-bold">✓ {parsedPreview.length} rows parsed</span>}
              </div>
              <textarea
                value={csvText}
                onChange={handlePasteChange}
                placeholder="Name, Email, Password&#10;Alice Johnson, alice@virtuallabs.in, Alice@2026&#10;Bob Roberts, bob@virtuallabs.in, Bob@2026"
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono resize-none leading-relaxed"
              />
            </div>

            {/* Parsed Preview Table */}
            {parsedPreview.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Import Preview (Showing up to 3)</label>
                <div className="bg-slate-950/40 border border-white/5 rounded-xl overflow-hidden text-[10px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5 text-slate-500 font-bold">
                        <th className="px-3 py-1.5">Name</th>
                        <th className="px-3 py-1.5">Email</th>
                        <th className="px-3 py-1.5">Password</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-350">
                      {parsedPreview.slice(0, 3).map((student, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 text-white truncate max-w-[120px]">{student.name}</td>
                          <td className="px-3 py-1.5 truncate max-w-[140px]">{student.email}</td>
                          <td className="px-3 py-1.5 font-mono">{student.password}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedPreview.length > 3 && (
                    <div className="bg-white/3 text-[9px] text-slate-500 text-center py-1 font-semibold italic border-t border-white/5">
                      ...and {parsedPreview.length - 3} more student accounts
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || parsedPreview.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <FileText className="w-4.5 h-4.5" />}
                {loading ? 'Importing…' : 'Bulk Import'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
