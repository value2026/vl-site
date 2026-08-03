import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Upload, CheckCircle2, AlertCircle, Loader2, X,
  Folder, Layers, Beaker, FileText, Check, ChevronRight
} from 'lucide-react';
import { api, safeJson } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import CloudinaryUploader from '../../components/dashboard/CloudinaryUploader';

// ── Color Theme Gradients ─────────────────────────────────────
const GRADIENTS = [
  { label: 'Blue Indigo',   value: 'from-blue-600 to-indigo-700' },
  { label: 'Purple Violet', value: 'from-purple-600 to-violet-700' },
  { label: 'Cyan Blue',     value: 'from-cyan-600 to-blue-700' },
  { label: 'Emerald Green', value: 'from-emerald-600 to-green-700' },
  { label: 'Amber Orange',  value: 'from-amber-500 to-orange-600' },
  { label: 'Rose Red',      value: 'from-rose-500 to-red-600' },
  { label: 'Pink Purple',   value: 'from-pink-500 to-purple-600' },
  { label: 'Teal Cyan',     value: 'from-teal-500 to-cyan-600' },
];

const ICONS = ['💻','🧪','⚛️','🔬','📐','⚡','🌐','📚','🗂️','🔍','🖥️','⚗️','🧫','🎯','🔭','🔋','🦠','🧬','📊','💡','🔌','🌱','🏗️'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

// ── Dark glassmorphism modal via React Portal ──────────────────
function Modal({ title, onClose, children }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-slate-900 z-10">
          <h3 className="font-bold text-white text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ── Reusable Field ────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  );
}

// ── Glass Form Controls ───────────────────────────────────────
const Input = (props) => (
  <input {...props} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
);

const Textarea = (props) => (
  <textarea {...props} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" rows={3} />
);

const Select = ({ children, ...props }) => (
  <select {...props} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
    {children}
  </select>
);

// ── Confirmation dialog via React Portal ───────────────────────
function ConfirmDelete({ label, onConfirm, onCancel }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>
        <h4 className="text-white font-bold text-lg mb-2">Delete {label}?</h4>
        <p className="text-slate-400 text-sm mb-6">This action is permanent and cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/25">Delete</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Status toggle badge ───────────────────────────────────────
const ActiveBadge = ({ active, onClick, labels = ['Active', 'Inactive'] }) => (
  <button onClick={onClick} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-800 border-white/5 text-slate-400 hover:bg-slate-700'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
    {active ? labels[0] : labels[1]}
  </button>
);

// ════════════════════════════════════════════════════════════════
//  SUBJECTS TAB
// ════════════════════════════════════════════════════════════════
function SubjectsTab({ role }) {
  const [subjects, setSubjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form,     setForm]     = useState({ title: '', icon: '📚', description: '', gradient: GRADIENTS[0].value });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  
  const canEdit = ['admin', 'vl_manager', 'content_admin'].includes(role);

  const load = async () => {
    setLoading(true);
    const res = await api.get('/subjects/all');
    if (res.ok) setSubjects(await safeJson(res));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm({ title: '', icon: '📚', description: '', gradient: GRADIENTS[0].value }); setError(''); setModal('add'); };
  const openEdit = (s) => { setForm({ title: s.title, icon: s.icon || '📚', description: s.description || '', gradient: s.gradient || GRADIENTS[0].value }); setError(''); setModal({ edit: s }); };

  const save = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    const isEdit = modal?.edit;
    const res = isEdit ? await api.post(`/subjects/${isEdit.id}/update`, form) : await api.post('/subjects', form);
    setSaving(false);
    if (res.ok) { setModal(null); load(); } else { setError((await safeJson(res)).message); }
  };

  const toggleActive = async (s) => {
    if (!canEdit) return;
    await api.post(`/subjects/${s.id}/update`, { isActive: !s.isActive });
    load();
  };

  const confirmDelete = async () => {
    await api.post(`/subjects/${deleting.id}/delete`);
    setDeleting(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h3 className="text-white font-bold text-lg">Broad Areas</h3>
          <p className="text-slate-400 text-xs mt-0.5">Top-level subject categories for the student learning platform</p>
        </div>
        {canEdit && (
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20">
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5 text-slate-400">
          <Folder className="w-10 h-10 mx-auto mb-3 text-slate-500" />
          <p className="text-sm font-medium">No subjects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((s) => (
            <div key={s.id} className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${s.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                    {s.icon}
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleting(s)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
                <h4 className="text-white font-bold text-base mb-1">{s.title}</h4>
                {s.description && <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">{s.description}</p>}
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                {canEdit ? (
                  <ActiveBadge active={s.isActive} onClick={() => toggleActive(s)} />
                ) : (
                  <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-white/5 text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    {s.isActive ? 'Active' : 'Inactive'}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">{s._count?.labs || 0} Labs</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal?.edit ? 'Edit Subject' : 'Add Subject'} onClose={() => setModal(null)}>
          {error && <div className="mb-4 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}</div>}
          <Field label="Subject Name *">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Physics" />
          </Field>
          <Field label="Icon Emoji">
            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-950/50 border border-white/10 rounded-xl mb-2 max-h-36 overflow-y-auto">
              {ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
                  className={`w-8 h-8 text-lg rounded-lg border flex items-center justify-center transition-all ${form.icon === ic ? 'border-blue-500 bg-blue-500/10 scale-105' : 'border-transparent hover:bg-white/5'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Write a summary for students..." />
          </Field>
          <Field label="Theme Color Gradient">
            <Select value={form.gradient} onChange={(e) => setForm({ ...form, gradient: e.target.value })}>
              {GRADIENTS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </Select>
            <div className={`mt-3 h-8 rounded-xl bg-gradient-to-r ${form.gradient} border border-white/10 shadow-inner`} />
          </Field>
          <button onClick={save} disabled={saving} className="w-full py-3 mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4.5 h-4.5 animate-spin" />}
            {modal?.edit ? 'Save Changes' : 'Create Subject'}
          </button>
        </Modal>
      )}
      {deleting && <ConfirmDelete label={`"${deleting.title}"`} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  LABS TAB
// ════════════════════════════════════════════════════════════════
function LabsTab({ onSelectLab }) {
  const [labs,     setLabs]     = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filter,   setFilter]   = useState('');
  const [form,     setForm]     = useState({ title: '', icon: '🔬', description: '', subjectId: '', coverPic: '' });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const initialized = useRef(false);

  const load = async () => {
    setLoading(true);
    const [lr, sr] = await Promise.all([api.get('/labs/all'), api.get('/subjects/all')]);
    
    let loadedLabs = [];
    let loadedSubs = [];
    if (lr.ok) loadedLabs = await safeJson(lr);
    if (sr.ok) loadedSubs = await safeJson(sr);
    
    setLabs(loadedLabs);
    setSubjects(loadedSubs);

    if (!initialized.current && loadedSubs.length > 0) {
      initialized.current = true;
      setFilter(loadedSubs[0].id);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = filter ? labs.filter((l) => l.subjectId === filter) : labs;

  const openAdd  = () => { setForm({ title: '', icon: '🔬', description: '', subjectId: subjects[0]?.id || '', coverPic: '' }); setError(''); setModal('add'); };
  const openEdit = (l) => { setForm({ title: l.title, icon: l.icon, description: l.description || '', subjectId: l.subjectId, coverPic: l.coverPic || '' }); setError(''); setModal({ edit: l }); };

  const save = async () => {
    if (!form.title.trim() || !form.subjectId) { setError('Title and subject are required'); return; }
    setSaving(true);
    const isEdit = modal?.edit;
    const res = isEdit ? await api.post(`/labs/${isEdit.id}/update`, form) : await api.post('/labs', form);
    setSaving(false);
    if (res.ok) { setModal(null); load(); } else { setError((await safeJson(res)).message); }
  };

  const toggleActive = async (l) => { await api.post(`/labs/${l.id}/update`, { isActive: !l.isActive }); load(); };
  const confirmDelete = async () => { await api.post(`/labs/${deleting.id}/delete`); setDeleting(null); load(); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-white font-bold text-lg">Labs</h3>
          <p className="text-slate-400 text-xs mt-0.5">Organize experiments under different subject categories</p>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4" /> Add Lab
        </button>
      </div>

      {/* Select Filter */}
      <div className="max-w-xs">
        <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Subjects</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.title}</option>)}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5 text-slate-400">
          <Layers className="w-10 h-10 mx-auto mb-3 text-slate-500" />
          <p className="text-sm font-medium">No labs found under this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((l) => (
            <div key={l.id} className="bg-slate-900/40 border border-white/10 rounded-xl p-4 hover:border-blue-500/20 transition-all flex items-center gap-4">
              <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                {l.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-white font-bold text-sm truncate">{l.title}</h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400">
                    {l.subject?.icon} {l.subject?.title}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5 truncate">{l.description || 'No description available'}</p>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-3">
                  <span>{l._count?.experiments || 0} Experiments · Created by {l.createdBy?.name || 'Admin'}</span>
                  {onSelectLab && (
                    <button onClick={() => onSelectLab(l.id)} className="text-blue-400 hover:text-blue-300 font-semibold underline flex items-center gap-1">
                      View Experiments ➔
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <ActiveBadge active={l.isActive} onClick={() => toggleActive(l)} labels={['Published', 'Draft']} />
                <div className="flex items-center gap-1 border-l border-white/5 pl-3">
                  <button onClick={() => openEdit(l)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleting(l)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal?.edit ? 'Edit Lab' : 'Add Lab'} onClose={() => setModal(null)}>
          {error && <div className="mb-4 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}</div>}
          <Field label="Parent Subject *">
            <Select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
              <option value="">Select broad area...</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.title}</option>)}
            </Select>
          </Field>
          <Field label="Lab Title *">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Inorganic Chemistry" />
          </Field>
          <Field label="Icon Emoji">
            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-950/50 border border-white/10 rounded-xl mb-2 max-h-36 overflow-y-auto">
              {ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
                  className={`w-8 h-8 text-lg rounded-lg border flex items-center justify-center transition-all ${form.icon === ic ? 'border-blue-500 bg-blue-500/10 scale-105' : 'border-transparent hover:bg-white/5'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief summary of lab experiments..." />
          </Field>
          <Field label="Cover Image">
            <CloudinaryUploader
              value={form.coverPic || ''}
              onChange={(url) => setForm({ ...form, coverPic: url })}
            />
          </Field>
          <button onClick={save} disabled={saving} className="w-full py-3 mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4.5 h-4.5 animate-spin" />}
            {modal?.edit ? 'Save Changes' : 'Create Lab'}
          </button>
        </Modal>
      )}
      {deleting && <ConfirmDelete label={`"${deleting.title}"`} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  EXPERIMENTS TAB
// ════════════════════════════════════════════════════════════════
function ExperimentsTab({ role, initialLabId = '' }) {
  const [experiments, setExperiments] = useState([]);
  const [labs,        setLabs]        = useState([]);
  const [subjects,    setSubjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(null);
  const [deleting,    setDeleting]    = useState(null);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [labFilter,   setLabFilter]   = useState(initialLabId);
  const [form,        setForm]        = useState({ title: '', description: '', duration: '60 min', difficulty: 'Beginner', labId: '', coverPic: '' });
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  const [uploading,   setUploading]   = useState({});
  const [uploadMsg,   setUploadMsg]   = useState({});

  const initialized = useRef(false);

  const load = async () => {
    setLoading(true);
    const [er, lr, sr] = await Promise.all([
      api.get('/experiments/all/list'),
      api.get('/labs/all'),
      api.get('/subjects/all')
    ]);
    
    let loadedExps = [], loadedLabs = [], loadedSubs = [];
    if (er.ok) loadedExps = await safeJson(er);
    if (lr.ok) loadedLabs = await safeJson(lr);
    if (sr.ok) loadedSubs = await safeJson(sr);

    setExperiments(loadedExps);
    setLabs(loadedLabs);
    setSubjects(loadedSubs);

    // Set default filter if no initialLabId was provided
    if (!initialized.current && loadedSubs.length > 0 && !initialLabId) {
      initialized.current = true;
      const firstSub = loadedSubs[0];
      setSubjectFilter(firstSub.id);
      const firstLab = loadedLabs.find(l => l.subjectId === firstSub.id);
      if (firstLab) setLabFilter(firstLab.id);
    }

    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (initialLabId && labs.length > 0) {
      initialized.current = true;
      setLabFilter(initialLabId);
      const lab = labs.find((l) => l.id === initialLabId);
      if (lab) setSubjectFilter(lab.subjectId);
    }
  }, [initialLabId, labs]);

  const filtered = experiments.filter((e) => {
    const parentLab = labs.find((l) => l.id === e.labId);
    if (subjectFilter && parentLab?.subjectId !== subjectFilter) return false;
    if (labFilter && e.labId !== labFilter) return false;
    return true;
  });

  const openAdd  = () => { setForm({ title: '', description: '', duration: '60 min', difficulty: 'Beginner', labId: labFilter || labs[0]?.id || '', coverPic: '', zipFile: null }); setError(''); setModal('add'); };
  const openEdit = (e) => { setForm({ title: e.title, description: e.description || '', duration: e.duration, difficulty: e.difficulty, labId: e.labId, coverPic: e.coverPic || '', zipFile: null }); setError(''); setModal({ edit: e }); };

  const save = async () => {
    if (!form.title.trim() || !form.labId) { setError('Title and lab are required'); return; }
    setSaving(true);
    const isEdit = modal?.edit;
    const res = isEdit ? await api.post(`/experiments/${isEdit.id}/update`, form) : await api.post('/experiments', form);
    
    if (res.ok) { 
      const savedExp = await safeJson(res);
      // Upload ZIP if provided
      if (form.zipFile) {
        const fd = new FormData();
        fd.append('file', form.zipFile);
        await api.upload(`/experiments/${savedExp.id || isEdit.id}/upload-zip`, fd);
      }
      setSaving(false);
      setModal(null); 
      load(); 
    } else { 
      setSaving(false);
      setError((await safeJson(res)).message); 
    }
  };

  const toggleActive = async (e) => { await api.post(`/experiments/${e.id}/update`, { isActive: !e.isActive }); load(); };
  const confirmDelete = async () => { await api.post(`/experiments/${deleting.id}/delete`); setDeleting(null); load(); };



  const DIFF_STYLE = {
    Beginner:     'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
    Intermediate: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
    Advanced:     'bg-red-500/10 border-red-500/25 text-red-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-white font-bold text-lg">Experiments</h3>
          <p className="text-slate-400 text-xs mt-0.5">Upload documentation ZIPs and interactive simulation archives</p>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4" /> Add Experiment
        </button>
      </div>

      {/* Two-Level Filters */}
      <div className="flex flex-col sm:flex-row items-end gap-3 max-w-xl">
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Subject Area</label>
          <Select value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setLabFilter(''); }}>
            <option value="">All Subjects</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.title}</option>)}
          </Select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Laboratory</label>
          <Select value={labFilter} onChange={(e) => setLabFilter(e.target.value)}>
            <option value="">All Labs</option>
            {labs
              .filter((l) => !subjectFilter || l.subjectId === subjectFilter)
              .map((l) => <option key={l.id} value={l.id}>{l.icon} {l.title}</option>)
            }
          </Select>
        </div>
        {(subjectFilter || labFilter) && (
          <button onClick={() => { setSubjectFilter(''); setLabFilter(''); }} className="px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold whitespace-nowrap transition-colors">
            Clear Filters ✖
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5 text-slate-400">
          <Beaker className="w-10 h-10 mx-auto mb-3 text-slate-500" />
          <p className="text-sm font-medium">No experiments found. Create your first experiment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((exp) => (
            <div key={exp.id} className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 hover:border-blue-500/20 transition-all">
              <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h4 className="text-white font-bold text-base truncate">{exp.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFF_STYLE[exp.difficulty] || 'bg-slate-800 text-slate-400'}`}>
                      {exp.difficulty}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">⏱ {exp.duration}</span>
                  </div>
                  {exp.description && <p className="text-slate-400 text-xs mb-3 leading-relaxed">{exp.description}</p>}
                  <div className="text-[10px] text-slate-500 mb-4">{exp.lab?.subject?.title} ➔ {exp.lab?.title}</div>
                  
                  {/* Upload Actions */}
                  <div className="flex flex-wrap items-center gap-4 bg-slate-950/40 border border-white/5 p-3 rounded-xl max-w-lg">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">Assets:</div>
                    {(exp.contentPath || exp.simulationPath) ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Experiment ZIP Attached
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                        <AlertCircle className="w-3.5 h-3.5" /> No ZIP Uploaded
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-4 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                  <ActiveBadge active={exp.isActive} onClick={() => toggleActive(exp)} labels={['Published', 'Draft']} />
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(exp)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleting(exp)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal?.edit ? 'Edit Experiment' : 'Add Experiment'} onClose={() => setModal(null)}>
          {error && <div className="mb-4 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}</div>}
          <Field label="Parent Lab *">
            <Select value={form.labId} onChange={(e) => setForm({ ...form, labId: e.target.value })}>
              <option value="">Select laboratory...</option>
              {labs.map((l) => <option key={l.id} value={l.id}>{l.icon} {l.title}</option>)}
            </Select>
          </Field>
          <Field label="Experiment Title *">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Double Slit Interference" />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Provide experiment summary or instructions..." />
          </Field>
          <Field label="Cover Image">
            <CloudinaryUploader
              value={form.coverPic || ''}
              onChange={(url) => setForm({ ...form, coverPic: url })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estimated Duration">
              <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 45 min" />
            </Field>
            <Field label="Difficulty Level">
              <Select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Experiment ZIP (Optional)">
            <input 
              type="file" 
              accept=".zip" 
              onChange={(e) => setForm({ ...form, zipFile: e.target.files[0] })}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer bg-slate-950/50 border border-white/10 rounded-xl"
            />
            {form.zipFile && <p className="text-emerald-400 text-xs mt-2 truncate">Selected: {form.zipFile.name}</p>}
            <p className="text-slate-500 text-[10px] mt-1.5">You can upload the simulation ZIP here. If you edit the experiment later, you can upload a new ZIP to replace it.</p>
          </Field>
          <button onClick={save} disabled={saving} className="w-full py-3 mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4.5 h-4.5 animate-spin" />}
            {modal?.edit ? 'Save Changes' : 'Create Experiment'}
          </button>
        </Modal>
      )}
      {deleting && <ConfirmDelete label={`"${deleting.title}"`} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'subjects',    label: 'Broad Areas',  icon: <Folder className="w-4 h-4" /> },
  { id: 'labs',        label: 'Labs',         icon: <Layers className="w-4 h-4" /> },
  { id: 'experiments', label: 'Experiments',  icon: <Beaker className="w-4 h-4" /> },
];

export default function LabManagement() {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const tabs = ['admin', 'vl_manager', 'content_admin', 'vl_coordinator'].includes(role)
    ? TABS
    : TABS.filter((t) => t.id !== 'subjects');

  const [tab, setTab] = useState('labs');
  const [selectedLabId, setSelectedLabId] = useState('');

  return (
    <div className="space-y-6">
      {/* Dynamic Tab Bar */}
      <div className="flex gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl w-fit">
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                if (t.id !== 'experiments') setSelectedLabId('');
                setTab(t.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Render selected view */}
      <div className="bg-slate-900/25 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
        {tab === 'subjects'    && <SubjectsTab role={role} />}
        {tab === 'labs'        && <LabsTab onSelectLab={(id) => { setSelectedLabId(id); setTab('experiments'); }} />}
        {tab === 'experiments' && <ExperimentsTab role={role} initialLabId={selectedLabId} />}
      </div>
    </div>
  );
}
