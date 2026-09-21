import { useState, useEffect } from 'react';
import { X, UserPlus, Loader2, Upload, FileText, CheckCircle2, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CloudinaryUploader from './CloudinaryUploader';

const CREATABLE_ROLES = {
  admin:        ['nodal_centre', 'teacher', 'student', 'vl_manager', 'vl_coordinator'],
  vl_manager:   ['nodal_centre', 'teacher', 'student', 'vl_coordinator'],
  vl_coordinator: ['nodal_centre', 'teacher', 'student'],
  nodal_centre: [],
  teacher:      ['student'],
};

const ROLE_LABELS = {
  admin:         'Administrator',
  nodal_centre:  'Nodal Centre Admin',
  teacher:       'Faculty / Instructor',
  student:       'Student',
  vl_manager:    'VL Manager',
  vl_coordinator:'VL Co-ordinator',
};

// Default permissions that are pre-ticked for each role.
const ROLE_DEFAULT_PERMISSIONS = {
  nodal_centre:  ['manage_users'],
  vl_manager:    ['manage_users', 'manage_content', 'manage_simulations', 'manage_institutions', 'manage_workshops'],
  vl_coordinator:['manage_users', 'manage_content', 'manage_simulations', 'manage_institutions', 'manage_workshops'],
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
  managedSubjectIds: [],
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
  const [isMinimized,   setIsMinimized]   = useState(false);
  const [error,         setError]         = useState('');
  const [successMsg,    setSuccessMsg]    = useState('');
  const [institutions,  setInstitutions]  = useState([]);
  const [subjects,      setSubjects]      = useState([]);

  // Bulk CSV & Migration
  const [isMigration,   setIsMigration]   = useState(true); // Default true for migrating existing users without emails
  const [csvText,       setCsvText]       = useState('');
  const [csvFileName,   setCsvFileName]   = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);
  const [bulkResult,    setBulkResult]    = useState(null);
  const [progress,      setProgress]      = useState(null); // { current, total, inserted, skipped }
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showFullscreenPaste, setShowFullscreenPaste] = useState(false);

  const [instSearch,   setInstSearch]   = useState('');

  useEffect(() => {
    if (isOpen) {
      const initialRole = defaultRole || allowedRoles[0] || 'student';
      setForm({
        ...DEFAULT_FORM,
        role: initialRole,
        customPermissions: ROLE_DEFAULT_PERMISSIONS[initialRole] || [],
      });
      fetch(`${API_URL}/institutions`)
        .then(r => r.json())
        .then(data => setInstitutions(Array.isArray(data) ? data : []))
        .catch(console.error);
        
      fetch(`${API_URL}/subjects`)
        .then(r => r.json())
        .then(data => setSubjects(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [isOpen, defaultRole, API_URL]);

  if (!isOpen) return null;

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // When role changes, reset relevant fields and apply default permissions
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setForm({
      ...form,
      role:              newRole,
      dept:              '',
      designation:       '',
      employeeId:        '',
      course:            '',
      yearSemester:      '',
      studentId:         '',
      batch:             '',
      section:           '',
      customPermissions: ROLE_DEFAULT_PERMISSIONS[newRole] || [],
    });
  };

  const isStudent       = form.role === 'student';
  const isTeacher       = form.role === 'teacher';
  const isNodalCentre   = form.role === 'nodal_centre';
  const isPlatformRole  = ['admin', 'vl_manager'].includes(form.role);
  const isCoordinator   = form.role === 'vl_coordinator';
  const needsInstitution =
    (isStudent || isTeacher || isNodalCentre || isCoordinator) &&
    (!user?.nodalCentreId || user?.role === 'admin' || user?.role === 'vl_manager');

  const missingBulkInstitution = !isMigration && isPlatformRole && !form.nodalCentreId;

  const validate = () => {
    if (!form.name.trim())     return 'Full Name is required.';
    if (!form.username.trim()) return 'Username is required.';
    if (!form.email.trim())    return 'Email is required.';
    if (isTeacher && !form.dept.trim()) return 'Department is required for teachers.';
    if (needsInstitution && !form.nodalCentreId) return 'Institution (Nodal Centre) is required.';
    return null;
  };

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
      setSuccessMsg('User registered successfully!');
      setTimeout(() => {
        onSuccess?.(data);
        resetState();
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── bulk CSV / TSV helpers ───────────────────────────────────────────────────────
  const parseCSV = (text) => {
    try {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return [];
      
      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : ',';
      const splitLine = (l) => l.split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());

      const firstLineCols = splitLine(firstLine).map(c => c.toLowerCase());
      
      const isHeaderRow = !firstLine.includes('@') && (
        firstLineCols.some(c => ['email', 'email id', 'email address', 'username', 'user name', 'name', 'firstname', 'full name', 'password', 'school id', 'university id'].includes(c))
      );

      if (isHeaderRow) {
        const headers = firstLineCols;
        const colMap = {};
        headers.forEach((h, i) => colMap[h] = i);

        return lines.slice(1).reduce((acc, line) => {
          const cols = splitLine(line);
          if (cols.length < 2) return acc;
          
          const getCol = (names) => {
            for (let n of names) {
              if (colMap[n] !== undefined) return cols[colMap[n]] || '';
            }
            return '';
          };

          const firstName = getCol(['firstname', 'first name']);
          const lastName = getCol(['lastname', 'last name']);
          let name = getCol(['name', 'full name']);
          if (!name && (firstName || lastName)) {
            name = `${firstName} ${lastName}`.trim();
          }

          const email = getCol(['email', 'email address', 'email id']);
          const username = getCol(['username', 'user name']) || (email ? email.split('@')[0] : '');
          const password = getCol(['password', 'pwd', 'pass']);
          const schoolId = getCol(['school id', 'schoolid', 'college id', 'collegeid']);
          const collegeSchool = getCol(['college/school']);
          const dept = getCol(['dept', 'department', 'branch', 'specialization/class', 'specialization']);
          const studentId = getCol(['studentid', 'student id', 'university id', 'roll number', 'rollno', 'id']);
          const batch = getCol(['batch', 'group id']);
          const section = getCol(['section']);
          const mobile = getCol(['mobile', 'phone', 'phone number']);

          if (email && (name || username)) {
            acc.push({
              name: name || username,
              email: email.toLowerCase(),
              username,
              password: password || undefined,
              schoolId: schoolId || undefined,
              org: collegeSchool || undefined,
              dept: dept || undefined,
              studentId: studentId || undefined,
              batch: batch || undefined,
              section: section || undefined,
              mobile: mobile || undefined,
              country: 'India'
            });
          }
          return acc;
        }, []);
      }

      // NO HEADER ROW (Data starts directly on row 0)
      return lines.reduce((acc, line) => {
        const cols = splitLine(line);
        if (cols.length < 2) return acc;

        let emailIndex = cols.findIndex(c => c.includes('@'));
        
        let email = '';
        let name = '';
        let username = '';
        let password = '';
        let schoolId = '';
        let dept = '';
        let studentId = '';
        let batch = '';

        if (emailIndex !== -1) {
          email = cols[emailIndex].toLowerCase();
          
          if (cols.length >= 8 && emailIndex === 3) {
            username = cols[0];
            const firstName = cols[1] || '';
            const lastName = cols[2] || '';
            name = `${firstName} ${lastName}`.trim() || username;
            studentId = cols[5] || '';
            schoolId = cols[6] || '';
            batch = cols[7] || '';
            dept = cols[10] || '';
            password = cols[11] || cols[cols.length - 1] || '';
          } else if (emailIndex === 1) {
            name = cols[0];
            username = cols[0].split('@')[0];
            password = cols[2] || '';
          } else if (emailIndex === 0) {
            email = cols[0].toLowerCase();
            name = cols[1] || cols[0].split('@')[0];
            username = cols[0].split('@')[0];
            password = cols[2] || '';
          } else {
            username = cols[0] || email.split('@')[0];
            const firstName = cols[1] || '';
            const lastName = (emailIndex > 2 ? cols[2] : '') || '';
            name = `${firstName} ${lastName}`.trim() || username;
            password = cols[cols.length - 1] || '';
          }
        }

        if (email) {
          acc.push({
            name: name || username || email.split('@')[0],
            email: email.toLowerCase(),
            username: username || email.split('@')[0],
            password: password || undefined,
            schoolId: schoolId || undefined,
            dept: dept || undefined,
            studentId: studentId || undefined,
            batch: batch || undefined,
            country: 'India'
          });
        }
        return acc;
      }, []);

    } catch (err) {
      console.error('Parse CSV error:', err);
      return [];
    }
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
    
    if (!isMigration && (user?.role === 'admin' || user?.role === 'vl_manager') && !form.nodalCentreId) {
      setError('Please select an Institution (Nodal Centre) to assign these students to.');
      return;
    }

    setLoading(true);
    const CHUNK_SIZE = 500;
    const totalRows = parsedPreview.length;
    let totalInserted = 0;
    let totalSkipped = 0;
    const allSkipped = [];

    setProgress({ current: 0, total: totalRows, inserted: 0, skipped: 0 });

    try {
      for (let i = 0; i < totalRows; i += CHUNK_SIZE) {
        const chunk = parsedPreview.slice(i, i + CHUNK_SIZE);
        const res = await fetch(`${API_URL}/users/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            students: chunk,
            nodalCentreId: form.nodalCentreId || null,
            isMigration,
            sendEmails: !isMigration,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Failed importing chunk at row ${i + 1}`);

        totalInserted += (data.createdCount || 0);
        totalSkipped += (data.skippedCount || 0);
        if (Array.isArray(data.skipped)) {
          allSkipped.push(...data.skipped);
        }

        const processedCount = Math.min(i + CHUNK_SIZE, totalRows);
        setProgress({
          current: processedCount,
          total: totalRows,
          inserted: totalInserted,
          skipped: totalSkipped,
        });
      }

      setBulkResult({
        createdCount: totalInserted,
        skippedCount: totalSkipped,
        skipped: allSkipped,
        message: `Successfully processed ${totalRows} user records!`
      });
      onSuccess?.();
      setParsedPreview([]); setCsvText(''); setCsvFileName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsMinimized(false);
      setProgress(null);
    }
  };

  const resetState = () => {
    const initialRole = defaultRole || allowedRoles[0] || 'student';
    setForm({
      ...DEFAULT_FORM,
      role: initialRole,
      customPermissions: ROLE_DEFAULT_PERMISSIONS[initialRole] || [],
    });
    setCsvText(''); setCsvFileName(''); setParsedPreview([]); setBulkResult(null); setProgress(null); setIsMinimized(false); setError(''); setSuccessMsg('');
  };

  const downloadSampleCSV = () => {
    const content = [
      'Username\tFirstname\tLastName\temail id\tGender\tuniversity id\tSchool id\tgroup id\tinstructor id\tCollege/School\tSpecialization/Class\tPassword',
      'kravikanth_avc\tMr  K RAVI KANTH\t\tkujalaravikanth@gmail.com\tM\t1\t144\t\t\tADITYA INSTITUTE OF TECHNOLOGY AND MANAGEMENT-TEKKALI (AITAM)\tComputer Science\tqnnezl',
      'amanjuladevi_avc\tMs A MANJULA DEVI\t\tmanjula.aruva@gmail.com\tF\t1\t144\t\t\tADITYA INSTITUTE OF TECHNOLOGY AND MANAGEMENT-TEKKALI (AITAM)\tElectronics\tdhmxhf'
    ].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([content], { type: 'text/tab-separated-values' })),
      download: 'student_migration_template.tsv',
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleClose = () => { resetState(); onClose(); };

  return (
    <>
      {/* Floating Bottom-Right Progress Widget (Visible when Minimized) */}
      {isMinimized && progress && (
        <div className="fixed bottom-5 right-5 z-[100] bg-slate-900/95 border border-indigo-500/50 rounded-2xl shadow-2xl p-4 w-80 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              Migrating Users ({Math.round((progress.current / progress.total) * 100)}%)
            </span>
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all flex items-center gap-1 text-[11px] font-semibold"
              title="Expand Modal"
            >
              <Maximize2 className="w-3.5 h-3.5 text-blue-400" /> Expand
            </button>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden mb-2 border border-white/10">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Progress: <strong>{progress.current} / {progress.total}</strong></span>
            <span>Inserted: <strong className="text-emerald-400">{progress.inserted}</strong></span>
          </div>
        </div>
      )}

      {/* Main Modal Window (Hidden when Minimized) */}
      {!isMinimized && (
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
              <div className="flex items-center gap-2">
                {loading && (
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 transition-all"
                    title="Run in Background (Minimize)"
                  >
                    <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Run in Background</span>
                  </button>
                )}
                <button onClick={handleClose} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                  {mode === 'single' ? 'Single User' : 'Bulk Import (CSV/TSV)'}
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
            
            {successMsg && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-xs text-emerald-400 flex gap-2 items-start font-bold">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {successMsg}
              </div>
            )}

            {/* Progress visualizer during chunked processing */}
            {progress && (
              <div className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex justify-between items-center text-blue-300 font-bold">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    Importing Users Batch: {progress.current} of {progress.total}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsMinimized(true)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Minimize2 className="w-3.5 h-3.5" /> Run in Background
                    </button>
                    <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-950/80 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Inserted: <strong className="text-emerald-400">{progress.inserted}</strong></span>
                  <span>Skipped / Duplicates: <strong className="text-amber-400">{progress.skipped}</strong></span>
                </div>
              </div>
            )}
            
            {bulkResult && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-xs text-emerald-400 space-y-1">
                <div className="flex gap-2 items-center font-bold">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Registered {bulkResult.createdCount} students successfully!
                </div>
                {bulkResult.skippedCount > 0 && (
                  <p className="text-slate-400">Skipped {bulkResult.skippedCount} duplicates/existing users.</p>
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
                      <Field label="Institution (Nodal Centre)" required>
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
                      placeholder="" className={inputCls} />
                  </Field>

                  {/* Username */}
                  <Field label="Username" required>
                    <input name="username" type="text" value={form.username} onChange={set}
                      placeholder="" className={inputCls} />
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

                  {/* ── VL Coordinator Broad Areas ── */}
                  {isCoordinator && (
                    <div className="col-span-full mt-2">
                      <SectionDivider title="Manage Broad Areas" />
                      <p className="text-[10px] text-slate-500 mt-1 mb-3">
                        Select the broad areas (Subjects) this VL Co-ordinator is responsible for.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {subjects.length > 0 ? subjects.map((sub) => {
                          const isChecked = form.managedSubjectIds.includes(sub.id);
                          return (
                            <label key={sub.id}
                              className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
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
                          <div className="text-xs text-slate-500 italic">No broad areas found.</div>
                        )}
                      </div>
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
              /* ── BULK CSV / MIGRATION FORM ────────────────────────────────────────────────── */
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                
                {/* Import Mode Selector */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Import Mode</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isMigration ? 'bg-indigo-500/15 border-indigo-500/50 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}>
                      <input
                        type="radio"
                        name="importMode"
                        checked={isMigration}
                        onChange={() => setIsMigration(true)}
                        className="mt-0.5 accent-indigo-500"
                      />
                      <div>
                        <span className="text-xs font-bold block text-indigo-300">📦 Migrate Existing Users</span>
                        <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                          Uses passwords from CSV. <strong>Zero emails sent</strong> to users. Ideal for 50k+ dataset migration.
                        </span>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      !isMigration ? 'bg-blue-500/15 border-blue-500/50 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}>
                      <input
                        type="radio"
                        name="importMode"
                        checked={!isMigration}
                        onChange={() => setIsMigration(false)}
                        className="mt-0.5 accent-blue-500"
                      />
                      <div>
                        <span className="text-xs font-bold block text-blue-300">🆕 Create New Users</span>
                        <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                          Generates random passwords & emails welcome credentials to each user.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Zero Email Notice Banner */}
                {isMigration && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center gap-3">
                    <span className="text-lg">🛡️</span>
                    <p className="text-xs text-emerald-300 leading-relaxed font-medium">
                      <strong>Zero-Email Policy Active:</strong> Email notifications are strictly disabled for migrating users. Original passwords from the CSV file will be saved.
                    </p>
                  </div>
                )}

                {(user?.role === 'admin' || user?.role === 'vl_manager') && (
                  <div className="col-span-full">
                    <Field label="Default Institution (Nodal Centre)" required={!isMigration}>
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
                        <option value="">— {isMigration ? 'Auto-detect from CSV (or select default)' : 'Select Institution'} —</option>
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

                <div className={missingBulkInstitution ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upload CSV / TSV File</label>
                    <button type="button" onClick={downloadSampleCSV}
                      className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-semibold">
                      📥 Download Template
                    </button>
                  </div>
                  <div className="border border-dashed border-white/20 bg-white/5 hover:bg-white/10 rounded-2xl p-6 text-center flex flex-col items-center hover:border-blue-500/50 transition-all relative group">
                    <input type="file" accept=".csv,.tsv,.txt" onChange={handleFileChange} disabled={missingBulkInstitution}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed" />
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-400 mb-3 transition-colors" />
                    <span className="text-white text-xs font-bold">
                      {csvFileName ? `Selected: ${csvFileName}` : 'Choose a .csv or .tsv file'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">Headers: Username, Firstname, LastName, email id, Password, School id, Specialization...</span>
                  </div>
                </div>

                <div className={missingBulkInstitution ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      Or Paste TSV / CSV Data
                      <button type="button" onClick={() => setShowFullscreenPaste(true)} className="text-slate-500 hover:text-white hover:bg-white/10 p-1 rounded transition-colors" title="Expand to Full Screen">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </label>
                    {parsedPreview.length > 0 && <span className="text-[10px] text-emerald-400 font-bold">✓ {parsedPreview.length} rows parsed</span>}
                  </div>
                  <textarea value={csvText} onChange={handlePasteChange} rows={6} disabled={missingBulkInstitution}
                    placeholder={`Username\tFirstname\tLastName\temail id\tPassword\tSchool id\nravikanth\tRavi\tKanth\travi@gmail.com\tpass123\t144`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono resize-none leading-relaxed whitespace-pre overflow-auto custom-scrollbar disabled:cursor-not-allowed" />
                </div>

                {parsedPreview.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Preview (first 3)</label>
                      <button type="button" onClick={() => setShowFullPreview(true)} className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-semibold">
                        <FileText className="w-3 h-3" /> View All Data
                      </button>
                    </div>
                    <div className="bg-slate-950/60 border border-white/10 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-white/10 border-b border-white/10 text-slate-400 font-bold">
                            <th className="px-4 py-2 w-[25%]">Name</th>
                            <th className="px-4 py-2 w-[30%]">Email</th>
                            <th className="px-4 py-2 w-[25%]">Password</th>
                            <th className="px-4 py-2 w-[20%]">Dept</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {parsedPreview.slice(0, 3).map((s, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="px-4 py-2 text-white truncate max-w-[130px] font-medium">{s.name}</td>
                              <td className="px-4 py-2 text-slate-300 truncate max-w-[160px]">{s.email}</td>
                              <td className="px-4 py-2 text-indigo-300 font-mono truncate max-w-[100px]">{s.password ? '••••••••' : '(Auto)'}</td>
                              <td className="px-4 py-2 text-slate-400 truncate max-w-[100px]">{s.dept || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parsedPreview.length > 3 && (
                        <div className="text-xs text-slate-400 font-medium text-center py-2 bg-white/5 border-t border-white/10">
                          …and {parsedPreview.length - 3} more rows
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
                  <button type="submit" disabled={loading || parsedPreview.length === 0 || missingBulkInstitution}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    {loading ? 'Migrating…' : `Start Migration (${parsedPreview.length} users)`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
