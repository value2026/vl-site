import { useState } from 'react';
import { X, Eye, EyeOff, UserPlus, Loader2, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CloudinaryUploader from './CloudinaryUploader';

// Roles each caller can create
const CREATABLE_ROLES = {
  admin:        ['admin', 'content_admin', 'nodal_centre', 'teacher', 'student'],
  content_admin:[],
  nodal_centre: ['teacher', 'student'],
  teacher:      [],
};

const ROLE_LABELS = {
  admin:        'Administrator',
  content_admin:'Content Admin / Lab Admin',
  nodal_centre: 'Nodal Centre',
  teacher:      'Faculty / Instructor',
  student:      'Student',
};

const DEFAULT_FORM = {
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  mobile: '',
  profilePic: '',
  org: '',
  dept: '',
  course: '',
  yearSemester: '',
  country: 'India',
  state: '',
  city: '',
  studentId: '',
  batch: '',
  section: '',
  employeeId: '',
  designation: '',
  facultyDept: '',
  facultyInst: '',
};

// Section Divider for fields
function FormSectionHeader({ title }) {
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

  const [activeMode, setActiveMode] = useState('single'); // 'single' or 'bulk'
  const [form,    setForm]    = useState({ ...DEFAULT_FORM, role: defaultRole || allowedRoles[0] || 'student' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Bulk CSV state
  const [csvText, setCsvText] = useState('');
  const [csvFileName, setCsvFileName] = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);
  const [bulkResult, setBulkResult] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Single User Creation ─────────────────────────────────────
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!form.name || !form.username || !form.email || !form.org || !form.dept || !form.country) {
      setError('Please fill in all required fields marked with an asterisk (*).');
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

      const firstLine = lines[0].toLowerCase();
      if (firstLine.includes('name') || firstLine.includes('email') || firstLine.includes('pass')) {
        startIdx = 1;
      }

      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
        if (cols.length >= 3) {
          parsed.push({
            name: cols[0],
            email: cols[1],
            password: cols[2],
            username: cols[1].split('@')[0], // autogenerate username from email prefix for bulk imports
            org: form.org || user?.org || 'Virtual Labs Partner',
            dept: form.dept || user?.dept || 'Science',
            country: 'India'
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
    const headers = ['Name', 'Email'];
    const rows = [
      ['Alice Smith', 'alice.smith@school.edu'],
      ['Bob Jones', 'bob.jones@school.edu'],
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
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <FormSectionHeader title="Account Details" />

              {/* User Type / Role */}
              <div className="col-span-full">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">User Type *</label>
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
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Anandi Sharma"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Username *</label>
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="e.g. anandi_sharma"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="user@institution.edu"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
                <input
                  name="mobile"
                  type="text"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* Password Notice */}
              <div className="col-span-full p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                <span className="text-base">🔒</span>
                <p className="text-xs text-blue-300 leading-normal">
                  A secure random password will be automatically generated by the server and sent to the user's email address (<strong>{form.email || 'provided email'}</strong>) along with their username credentials.
                </p>
              </div>

              {/* Profile Picture */}
              <div className="col-span-full">
                <CloudinaryUploader
                  label="Profile Picture (Optional)"
                  value={form.profilePic}
                  onChange={(url) => setForm({ ...form, profilePic: url })}
                />
              </div>

              <FormSectionHeader title="Academic Details" />

              {/* Organization / University */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Organization / University *</label>
                <input
                  name="org"
                  type="text"
                  value={form.org}
                  onChange={handleChange}
                  placeholder="e.g. Amrita Vishwa Vidyapeetham"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Department *</label>
                <input
                  name="dept"
                  type="text"
                  value={form.dept}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* Course / Program */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Course / Program</label>
                <input
                  name="course"
                  type="text"
                  value={form.course}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* Year / Semester */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Year / Semester</label>
                <input
                  name="yearSemester"
                  type="text"
                  value={form.yearSemester}
                  onChange={handleChange}
                  placeholder="e.g. Year 3 / Sem 6"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Country *</label>
                <input
                  name="country"
                  type="text"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="e.g. India"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">State</label>
                <input
                  name="state"
                  type="text"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="e.g. Kerala"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">City</label>
                <input
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Coimbatore"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* ── Student-specific Fields ── */}
              {form.role === 'student' && (
                <>
                  <FormSectionHeader title="Student-Specific Details" />
                  
                  {/* Student ID / Roll Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Student ID / Roll Number</label>
                    <input
                      name="studentId"
                      type="text"
                      value={form.studentId}
                      onChange={handleChange}
                      placeholder="e.g. AM.EN.U4CSE23001"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>

                  {/* Batch */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Batch</label>
                    <input
                      name="batch"
                      type="text"
                      value={form.batch}
                      onChange={handleChange}
                      placeholder="e.g. 2023-2027"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>

                  {/* Section */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Section</label>
                    <input
                      name="section"
                      type="text"
                      value={form.section}
                      onChange={handleChange}
                      placeholder="e.g. CSE-A"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                </>
              )}

              {/* ── Faculty-specific Fields ── */}
              {form.role === 'teacher' && (
                <>
                  <FormSectionHeader title="Faculty-Specific Details" />
                  
                  {/* Employee ID */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Employee ID</label>
                    <input
                      name="employeeId"
                      type="text"
                      value={form.employeeId}
                      onChange={handleChange}
                      placeholder="e.g. EMP45902"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Designation</label>
                    <input
                      name="designation"
                      type="text"
                      value={form.designation}
                      onChange={handleChange}
                      placeholder="e.g. Assistant Professor"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>

                  {/* Faculty Department */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Faculty Department</label>
                    <input
                      name="facultyDept"
                      type="text"
                      value={form.facultyDept}
                      onChange={handleChange}
                      placeholder="e.g. Dept of Computing"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>

                  {/* Faculty Institution */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Faculty Institution</label>
                    <input
                      name="facultyInst"
                      type="text"
                      value={form.facultyInst}
                      onChange={handleChange}
                      placeholder="e.g. Amrita School of Engineering"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                </>
              )}

            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-white/5 mt-4">
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
                <span className="text-[10px] text-slate-500 mt-1">Must contain columns: Name, Email</span>
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
                placeholder="Name, Email&#10;Alice Johnson, alice@virtuallabs.in&#10;Bob Roberts, bob@virtuallabs.in"
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-350">
                      {parsedPreview.slice(0, 3).map((student, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 text-white truncate max-w-[120px]">{student.name}</td>
                          <td className="px-3 py-1.5 truncate max-w-[140px]">{student.email}</td>
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
            <div className="flex gap-3 pt-6 border-t border-white/5 mt-4">
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
