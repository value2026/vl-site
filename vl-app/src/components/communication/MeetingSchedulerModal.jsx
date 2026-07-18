import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Loader2, CheckCircle2, Search, Users, User } from 'lucide-react';
import { api } from '../../utils/api';

const ROLE_COLORS = {
  admin:        'bg-rose-500/20 text-rose-300',
  nodal_centre: 'bg-violet-500/20 text-violet-300',
  teacher:      'bg-blue-500/20 text-blue-300',
  student:      'bg-emerald-500/20 text-emerald-300',
};
const ROLE_LABELS = {
  admin: 'Admin', nodal_centre: 'Nodal Centre', teacher: 'Teacher', student: 'Student'
};

export default function MeetingSchedulerModal({ isOpen, onClose, contact: preContact, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', duration: '30' });

  const [contacts, setContacts]         = useState([]);
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState(preContact ? [preContact] : []);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  // Load full contacts list when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoadingContacts(true);
      try {
        const res = await api.get('/calls/contacts');
        if (res.ok) {
          const data = await res.json();
          setContacts(data);
          // Pre-select the contact passed in if any
          if (preContact) {
            setSelected([preContact]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingContacts(false);
      }
    };
    load();
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const isSelected = (id) => selected.some(s => s.id === id);

  const toggleContact = (c) => {
    if (isSelected(c.id)) {
      setSelected(prev => prev.filter(s => s.id !== c.id));
    } else {
      setSelected(prev => [...prev, c]);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (selected.length === 0) {
      setError('Please select at least one member to invite.');
      return;
    }
    if (!form.title || !form.date || !form.time) {
      setError('Title, date, and time are required.');
      return;
    }

    const scheduledAt = `${form.date}T${form.time}:00`;
    setLoading(true);
    try {
      const res = await api.post('/calls/schedule', {
        title:       form.title,
        description: form.description,
        scheduledAt,
        duration:    parseInt(form.duration, 10),
        inviteeIds:  selected.map(s => s.id)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to schedule meeting');
      }

      setSuccess(true);
      onSuccess?.();
      setTimeout(() => {
        setSuccess(false);
        setForm({ title: '', description: '', date: '', time: '', duration: '30' });
        setSelected([]);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Schedule Consultation</h2>
              <p className="text-slate-400 text-xs mt-0.5">Set up a video call appointment</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-xs text-rose-400">{error}</div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-xs text-emerald-400 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Meeting scheduled successfully!</span>
            </div>
          )}

          {/* ── Invite Members ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Invite Members
              </label>
              {selected.length > 0 && (
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  {selected.length} selected
                </span>
              )}
            </div>

            {/* Selected chips */}
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selected.map(s => (
                  <span key={s.id} className="flex items-center gap-1 bg-blue-500/15 border border-blue-500/25 text-blue-300 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    {s.name.split(' ')[0]}
                    <button type="button" onClick={() => toggleContact(s)} className="ml-0.5 hover:text-white transition-colors">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Contacts list */}
            <div className="bg-slate-950/30 border border-white/5 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
              {loadingContacts ? (
                <div className="flex items-center justify-center gap-2 py-6 text-slate-500 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading contacts...
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-600 italic">
                  {contacts.length === 0 ? 'No contacts available.' : 'No results match your search.'}
                </div>
              ) : (
                filtered.map(c => {
                  const sel = isSelected(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleContact(c)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0 ${sel ? 'bg-blue-500/5' : ''}`}
                    >
                      {/* Checkbox */}
                      <div className={`w-4 h-4 flex-shrink-0 rounded border transition-all ${sel ? 'bg-blue-500 border-blue-500' : 'border-white/20 bg-white/5'} flex items-center justify-center`}>
                        {sel && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      {/* Avatar */}
                      <div className="w-7 h-7 flex-shrink-0 rounded-lg bg-slate-700 flex items-center justify-center text-white text-[10px] font-bold">
                        {c.name[0]?.toUpperCase()}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold truncate transition-colors ${sel ? 'text-blue-300' : 'text-white'}`}>{c.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{c.email}</div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${ROLE_COLORS[c.role] || 'bg-slate-600 text-slate-300'}`}>
                        {ROLE_LABELS[c.role] || c.role}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Meeting Title ── */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Meeting Title</label>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Acid-Base titration support"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description (Optional)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief context or notes..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Time</label>
              <input name="time" type="time" value={form.time} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer" required />
            </div>
          </div>

          {/* Duration pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Duration</label>
            <div className="flex gap-2">
              {['15', '30', '45', '60', '90'].map(d => (
                <button key={d} type="button" onClick={() => setForm({ ...form, duration: d })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    form.duration === d
                      ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/5 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selected.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
            {loading ? 'Scheduling...' : `Schedule Call${selected.length > 1 ? ` (${selected.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
