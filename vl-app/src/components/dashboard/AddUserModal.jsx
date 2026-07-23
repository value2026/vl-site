import { useState, useEffect } from 'react';
import { X, UserPlus, Loader2, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CloudinaryUploader from './CloudinaryUploader';

const CREATABLE_ROLES = {
  admin:        ['admin', 'nodal_centre', 'teacher', 'student', 'content_admin', 'sim_admin', 'vl_manager'],
  vl_manager:   ['nodal_centre', 'teacher', 'student'],
  nodal_centre: ['teacher', 'student'],
  teacher:      ['student'],
};

const ROLE_LABELS = {
  admin:         'Administrator',
  nodal_centre:  'Nodal Centre Admin',
  teacher:       'Faculty / Instructor',
  student:       'Student',
  content_admin: 'Content Admin',
  sim_admin:     'Simulation Admin',
  vl_manager:    'VL Manager',
};

// Default permissions that are pre-ticked for each role.
// Admin can untick any of these before saving.
const ROLE_DEFAULT_PERMISSIONS = {
  nodal_centre:  ['manage_users'],
  content_admin: ['manage_content'],
  sim_admin:     ['manage_simulations'],
  vl_manager:    ['manage_simulations', 'manage_institutions', 'manage_workshops'],
  teacher:       [],
  student:       [],
  admin:         [],
};

const DEFAULT_FORM = {
  name:              '',
  username:          '',
  email:             '',
  mobile:            '',
  profilePic:        '',
  role:              'student',
  nodalCentreId:     '',
  // teacher-specific
  employeeId:        '',
  designation:       '',
  dept:              '',
  // student-specific
  course:            '',
  yearSemester:      '',
  studentId:         '',
  batch:             '',
  section:           '',
  customPermissions: ROLE_DEFAULT_PERMISSIONS['student'] || [],
};

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
        {label}{required && ' *'}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all';

function SectionDivider({ title }) {
  return (
    <div className="flex items-center gap-3 pt-3 pb-1.5 col-span-full">
      <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">{title}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

export default function AddUserModal({ isOpen, onClose, onSuccess, defaultRole }) {
  const { user, token, API_URL } = useAuth();
  const allowedRoles = CREATABLE_ROLES[user?.role] || [];

  const [activeMode,    setActiveMode]    = useState('single');
  const [form,          setForm]          = useState({ ...DEFAULT_FORM, role: defaultRole || allowedRoles[0] || 'student' });
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [institutions,  setInstitutions]  = useState([]);

  // Bulk CSV
  const [csvText,       setCsvText]       = useState('');
  const [csvFileName,   setCsvFileName]   = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);
  const [bulkResult,    setBulkResult]    = useState(null);

  const [instSearch,   setInstSearch]   = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_URL}/institutions`)
        .then(r => r.json())
        .then(data => setInstitutions(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [isOpen, API_URL]);

  if (!isOpen) return null;

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // When role changes, reset relevant fields and apply default permissions
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setForm({
      ...form,
      role:              newRole,
      // reset role-specific fields
      dept:              '',
      designation:       '',
      employeeId:        '',
      course:            '',
      yearSemester:      '',
      studentId:         '',
      batch:             '',
      section:           '',
      // pre-tick default permissions for the new role
      customPermissions: ROLE_DEFAULT_PERMISSIONS[newRole] || [],
    });
  };

  // ─── what the current role needs ───────────────────────────────────────────
  const isStudent       = form.role === 'student';
  const isTeacher       = form.role === 'teacher';
  const isNodalCentre   = form.role === 'nodal_centre';
  const isPlatformRole  = ['admin', 'content_admin', 'sim_admin', 'vl_manager'].includes(form.role);
  const needsInstitution =
    (isStudent || isTeacher || isNodalCentre) &&
    (!user?.nodalCentreId || user?.role === 'admin' || user?.role === 'vl_manager');

  // ─── validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.name.trim())     return 'Full Name is required.';
    if (!form.username.trim()) return 'Username is required.';
    if (!form.email.trim())    return 'Email is required.';
    if (isTeacher && !form.dept.trim()) return 'Department is required for teachers.';
    return null;
  };

  // ─── single submit ──────────────────────────────────────────────────────────
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

  // ─── bulk CSV helpers ───────────────────────────────────────────────────────
  const parseCSV = (text) => {
    try {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return [];
      const firstLine = lines[0].toLowerCase();
      const startIdx = (firstLine.includes('name') || firstLine.includes('email')) ? 1 : 0;
      return lines.slice(startIdx).reduce((acc, line) => {
        const cols = line.split(',').map(c => c.replace(/^[\"']|[\"']$/g, '').trim());
        if (cols.length >= 2)
          acc.push({ name: cols[0], email: cols[1], username: cols[1].split('@')[0], country: 'India' });
        return acc;
      }, []);
    } catch { return []; }
  };

  const handleFileChange = (e) => {
    setError(''); setBulkResult(null);
    const file = e.target.files[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload  = (evt) => { const t = evt.target.result; setCsvText(t); setParsedPreview(parseCSV(t)); };
    reader.onerror = ()    => setError('Failed to read CSV file.');
    reader.readAsText(file);
  };

  const handlePasteChange = (e) => {
    setError(''); setBulkResult(null);
    const t = e.target.value;
    setCsvText(t); setParsedPreview(parseCSV(t));
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault(); setError(''); setBulkResult(null);
    if (parsedPreview.length === 0) { setError('Please upload a valid CSV or paste data.'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/users/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ students: parsedPreview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to bulk import users');
      setBulkResult(data); onSuccess?.();
      setParsedPreview([]); setCsvText(''); setCsvFileName('');
    } catch (err) { setError(err.message); }
    finally      { setLoading(false); }
  };

  const resetState = () => {
    setForm({ ...DEFAULT_FORM, role: defaultRole || allowedRoles[0] || 'student' });
    setCsvText(''); setCsvFileName(''); setParsedPreview([]); setBulkResult(null); setError('');
  };

  const downloadSampleCSV = () => {
    const content = ['Name,Email', 'Alice Smith,alice.smith@school.edu', 'Bob Jones,bob.jones@school.edu'].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([content], { type: 'text/csv' })),
      download: 'student_bulk_import_template.csv',
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleClose = () => { resetState(); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">Register User</h2>
              <p className="text-slate-400 text-xs mt-0.5">Add a single account or bulk-import students</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl w-fit mb-5 text-xs font-semibold">
          {['single', 'bulk'].map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => { setActiveMode(mode); setError(''); setBulkResult(null); }}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeMode === mode ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode === 'single' ? 'Single User' : 'Bulk Add Students (CSV)'}
            </button>
          ))}
        </div>

        {/* Alert banner */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-400 flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}
        {bulkResult && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-xs text-emerald-400 space-y-1">
            <div className="flex gap-2 items-center font-bold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Registered {bulkResult.createdCount} students successfully!
            </div>
            {bulkResult.skippedCount > 0 && (
              <p className="text-slate-400">Skipped {bulkResult.skippedCount} duplicates.</p>
            )}
          </div>
        )}

        {/* ── SINGLE USER FORM ───────────────────────────────────────────────── */}
        {activeMode === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* ── Account Details ── */}
              <SectionDivider title="Account Details" />

              {/* Role */}
              <div className="col-span-full">
                <Field label="User Type" required>
                  <select name="role" value={form.role} onChange={handleRoleChange}
                    className={`${inputCls} appearance-none cursor-pointer`}>
                    {allowedRoles.map(r => (
                      <option key={r} value={r} className="bg-slate-900">{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Institution (for admin/vl_manager assigning nodal/teacher/student) */}
              {needsInstitution && (
                <div className="col-span-full">
                  <Field label="Institution (Nodal Centre)">
                    {institutions.length > 5 && (
                      <input
                        type="text"
                        placeholder="🔍 Filter institution by name or code..."
                        value={instSearch}
                        onChange={(e) => setInstSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                      />
                    )}
                    <select name="nodalCentreId" value={form.nodalCentreId} onChange={set}
                      className={`${inputCls} appearance-none cursor-pointer`}>
                      <option value="">— Select Institution —</option>
                      {institutions
                        .filter(i => 
                          !instSearch ||
                          i.name.toLowerCase().includes(instSearch.toLowerCase()) ||
                          (i.code && i.code.toLowerCase().includes(instSearch.toLowerCase()))
                        )
                        .map(i => (
                          <option key={i.id} value={i.id} className="bg-slate-900">
                            {i.name}{i.code ? ` (${i.code.toUpperCase()})` : ''}
                          </option>
                        ))}
                    </select>
                  </Field>
                </div>
              )}

              {/* Full Name */}
              <Field label="Full Name" required>
                <input name="name" type="text" value={form.name} onChange={set}
                  placeholder="e.g. Anandi Sharma" className={inputCls} />
              </Field>

              {/* Username */}
              <Field label="Username" required>
                <input name="username" type="text" value={form.username} onChange={set}
                  placeholder="e.g. anandi_sharma" className={inputCls} />
              </Field>

              {/* Email */}
              <Field label="Email" required>
                <input name="email" type="email" value={form.email} onChange={set}
                  placeholder="user@institution.edu" className={inputCls} />
              </Field>

              {/* Phone */}
              <Field label="Phone Number">
                <input name="mobile" type="tel" value={form.mobile} onChange={set}
                  placeholder="+91 9876543210" className={inputCls} />
              </Field>

              {/* Profile picture */}
              <div className="col-span-full">
                <CloudinaryUploader
                  label="Profile Picture (Optional)"
                  value={form.profilePic}
                  onChange={(url) => setForm({ ...form, profilePic: url })}
                />
              </div>

              {/* Password notice */}
              <div className="col-span-full p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                <span className="text-base">🔒</span>
                <p className="text-xs text-blue-300 leading-relaxed">
                  A secure random password will be generated and emailed to{' '}
                  <strong>{form.email || 'the provided email'}</strong> along with their username.
                </p>
              </div>

              {/* ── TEACHER DETAILS ── */}
              {isTeacher && (
                <>
                  <SectionDivider title="Faculty Details" />

                  <Field label="Department" required>
                    <input name="dept" type="text" value={form.dept} onChange={set}
                      placeholder="e.g. Computer Science & Engineering" className={inputCls} />
                  </Field>

                  <Field label="Designation">
                    <input name="designation" type="text" value={form.designation} onChange={set}
                      placeholder="e.g. Assistant Professor" className={inputCls} />
                  </Field>

                  <Field label="Employee ID">
                    <input name="employeeId" type="text" value={form.employeeId} onChange={set}
                      placeholder="e.g. EMP45902" className={inputCls} />
                  </Field>
                </>
              )}

              {/* ── STUDENT DETAILS ── */}
              {isStudent && (
                <>
                  <SectionDivider title="Academic Details" />

                  <Field label="Course / Programme">
                    <input name="course" type="text" value={form.course} onChange={set}
                      placeholder="e.g. B.Tech" className={inputCls} />
                  </Field>

                  <Field label="Department / Branch">
                    <input name="dept" type="text" value={form.dept} onChange={set}
                      placeholder="e.g. Computer Science" className={inputCls} />
                  </Field>

                  <Field label="Year / Semester">
                    <input name="yearSemester" type="text" value={form.yearSemester} onChange={set}
                      placeholder="e.g. Year 3 / Sem 6" className={inputCls} />
                  </Field>

                  <Field label="Batch">
                    <input name="batch" type="text" value={form.batch} onChange={set}
                      placeholder="e.g. 2023–2027" className={inputCls} />
                  </Field>

                  <Field label="Roll Number / Student ID">
                    <input name="studentId" type="text" value={form.studentId} onChange={set}
                      placeholder="e.g. AM.EN.U4CSE23001" className={inputCls} />
                  </Field>

                  <Field label="Section">
                    <input name="section" type="text" value={form.section} onChange={set}
                      placeholder="e.g. CSE-A" className={inputCls} />
                  </Field>
                </>
              )}

              {/* ── NODAL CENTRE extra note ── */}
              {isNodalCentre && (
                <div className="col-span-full p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-xs text-orange-300 leading-relaxed">
                  <strong>Nodal Centre Admin</strong> will have view & edit access to their institution's teachers and students, plus usage analytics.
                </div>
              )}

              {/* ── PLATFORM ROLES note ── */}
              {isPlatformRole && (
                <div className="col-span-full p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-xs text-purple-300 leading-relaxed">
                  <strong>{ROLE_LABELS[form.role]}</strong> is a platform-level role. No institution or academic details required.
                </div>
              )}

              {/* ── Custom Permissions (admin only) ── */}
              {user?.role === 'admin' && (
                <div className="col-span-full mt-2">
                  <SectionDivider title="Custom Permissions" />
                  <p className="text-[10px] text-slate-500 mt-1 mb-3">
                    Pre-ticked permissions are the defaults for <strong className="text-slate-400">{ROLE_LABELS[form.role]}</strong>. Untick to remove, or add extras as needed.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: 'manage_users',        label: 'Manage Users' },
                      { key: 'manage_content',      label: 'Manage Content' },
                      { key: 'manage_simulations',  label: 'Manage Simulations' },
                      { key: 'manage_institutions', label: 'Manage Institutions' },
                      { key: 'manage_workshops',    label: 'Manage Workshops' },
                    ].map(({ key, label }) => {
                      const isDefault = (ROLE_DEFAULT_PERMISSIONS[form.role] || []).includes(key);
                      const isChecked = form.customPermissions.includes(key);
                      return (
                        <label key={key}
                          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
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
                          {isDefault && (
                            <span className="text-[9px] font-bold text-blue-400/70 uppercase tracking-wide ml-0.5">(default)</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-white/5 mt-4">
              <button type="button" onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>

        ) : (
          /* ── BULK CSV FORM ────────────────────────────────────────────────── */
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upload CSV File</label>
                <button type="button" onClick={downloadSampleCSV}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-semibold">
                  📥 Download Template
                </button>
              </div>
              <div className="border border-dashed border-white/10 bg-white/5 rounded-2xl p-5 text-center flex flex-col items-center hover:border-blue-500/30 transition-colors relative">
                <input type="file" accept=".csv" onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-white text-xs font-bold">
                  {csvFileName ? `Selected: ${csvFileName}` : 'Choose a .csv file'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Columns: Name, Email</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Or Paste Data</label>
                {parsedPreview.length > 0 && <span className="text-[10px] text-emerald-400 font-bold">✓ {parsedPreview.length} rows parsed</span>}
              </div>
              <textarea value={csvText} onChange={handlePasteChange} rows={4}
                placeholder={`Name, Email\nAlice Johnson, alice@virtuallabs.in\nBob Roberts, bob@virtuallabs.in`}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono resize-none leading-relaxed" />
            </div>

            {parsedPreview.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Preview (first 3)</label>
                <div className="bg-slate-950/40 border border-white/5 rounded-xl overflow-hidden text-[10px]">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5 text-slate-500 font-bold">
                        <th className="px-3 py-1.5">Name</th>
                        <th className="px-3 py-1.5">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {parsedPreview.slice(0, 3).map((s, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 text-white truncate max-w-[130px]">{s.name}</td>
                          <td className="px-3 py-1.5 text-slate-400 truncate max-w-[160px]">{s.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedPreview.length > 3 && (
                    <div className="text-[9px] text-slate-500 text-center py-1 italic border-t border-white/5">
                      …and {parsedPreview.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t border-white/5 mt-4">
              <button type="button" onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading || parsedPreview.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {loading ? 'Importing…' : `Bulk Import (${parsedPreview.length})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
