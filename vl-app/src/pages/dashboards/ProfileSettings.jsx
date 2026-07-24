import { useState } from 'react';
import {
  User, KeyRound, Mail, Loader2, CheckCircle2, AlertCircle,
  Save, AtSign, ArrowRight, Building2, ShieldCheck, Pencil, X,
  Activity, Clock, Monitor
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

const ROLE_LABELS = {
  admin:        { label: 'Super Admin',   gradient: 'from-red-500 to-rose-600',      badge: 'bg-red-500/20 text-red-300 border-red-500/30' },
  vl_manager:   { label: 'VL Manager',    gradient: 'from-pink-500 to-rose-500',     badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  nodal_centre: { label: 'Nodal Centre',  gradient: 'from-orange-500 to-amber-500',  badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  teacher:      { label: 'Teacher',       gradient: 'from-blue-500 to-indigo-600',   badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  student:      { label: 'Student',       gradient: 'from-emerald-500 to-green-600', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
};

export default function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const cfg = ROLE_LABELS[user?.role] || ROLE_LABELS.student;

  // Edit mode toggle
  const [editing, setEditing] = useState(false);

  // Profile Form
  const [name,  setName]  = useState(user?.name  || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError,   setProfileError]   = useState('');

  // Password Reset
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent,    setResetSent]    = useState(false);
  const [resetError,   setResetError]   = useState('');

  const handleCancelEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setProfileError('');
    setEditing(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    if (!name || !email) { setProfileError('Name and email are required.'); return; }

    setProfileLoading(true);
    try {
      const res  = await api.put(`/users/${user.id}`, { name, email });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile.');
      setProfileSuccess(true);
      updateProfile({ name, email });
      setEditing(false);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    setResetError('');
    setResetSent(false);
    setResetLoading(true);
    try {
      if (!user?.email) throw new Error('No email address found for your account.');
      const res  = await api.post('/auth/forgot-password', { email: user.email });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset email.');
      setResetSent(true);
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const initials = (user?.name || name)?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Profile Hero Banner ─────────────────────────────── */}
      <div className={`relative rounded-3xl bg-gradient-to-br ${cfg.gradient} p-px mb-8 shadow-2xl overflow-hidden`}>
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none rounded-3xl" />
        <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-[calc(1.5rem-1px)] px-10 py-10 flex flex-col sm:flex-row items-center gap-8 border-b border-white/5">
          {/* Avatar */}
          <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-black/30 flex-shrink-0`}>
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-3 ${cfg.badge}`}>
              <ShieldCheck className="w-3 h-3" /> {cfg.label}
            </div>
            <h1 className="text-white text-2xl font-extrabold tracking-tight">{user?.name}</h1>
            <p className="text-white/60 text-sm mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
            {user?.nodalCentre?.name && (
              <p className="text-white/40 text-xs mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Building2 className="w-3 h-3" /> {user.nodalCentre.name}
              </p>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 self-start mt-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/40 text-xs">Active</span>
          </div>
        </div>
      </div>

      {/* ── Two Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Personal Details Card ───────────────────────── */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl">
          {/* Card header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">Personal Details</h2>
                <p className="text-slate-500 text-xs">{editing ? 'Make your changes below' : 'View your profile info'}</p>
              </div>
            </div>

            {/* Edit / Cancel toggle */}
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-500 shadow-sm shadow-blue-500/30 transition-all"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
              >
                <X className="w-3 h-3" /> Cancel
              </button>
            )}
          </div>

          {profileError && (
            <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-400 flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-xs text-emerald-400 flex gap-2 items-center">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> <span>Profile saved successfully!</span>
            </div>
          )}

          {/* View mode */}
          {!editing ? (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Full Name</p>
                <p className="text-white text-sm font-medium">{user?.name}</p>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Email Address</p>
                <p className="text-white text-sm font-medium">{user?.email}</p>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Role</p>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.badge}`}>
                  <ShieldCheck className="w-3 h-3" /> {cfg.label}
                </div>
              </div>
            </div>
          ) : (
            /* Edit mode */
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-white/5 border border-blue-500/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <AtSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@institution.edu"
                    className="w-full bg-white/5 border border-blue-500/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold border ${cfg.badge}`}>
                  <ShieldCheck className="w-3 h-3" /> {cfg.label}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {profileLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Change Password Card ─────────────────────────── */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Change Password</h2>
              <p className="text-slate-500 text-xs">Secure reset link sent to your email</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Sending to</p>
                <p className="text-white text-sm font-medium truncate">{user?.email}</p>
              </div>
            </div>

            {resetError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-400 flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span>{resetError}</span>
              </div>
            )}

            {resetSent ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-6 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Email sent!</p>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-[220px]">
                    Check your inbox at <span className="text-emerald-400 font-semibold">{user?.email}</span> and click the link to set a new password.
                  </p>
                </div>
                <button
                  onClick={() => setResetSent(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
                >
                  Resend email
                </button>
              </div>
            ) : (
              <>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We'll send a secure one-time link to your email. Click it to create a new password — no old password needed.
                </p>
                <button
                  onClick={handleSendResetEmail}
                  disabled={resetLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {resetLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    : <><Mail className="w-4 h-4" /> Send Reset Link <ArrowRight className="w-4 h-4" /></>}
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ── Account Activity Section ────────────────────────────── */}
      <div className="mt-8 bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">Account Activity</h2>
            <p className="text-slate-500 text-xs">Recent security events and sessions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Meta */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Account Created</p>
                <p className="text-xs text-slate-400 mt-1">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }) : 'Unknown date'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Security Status</p>
                <p className="text-xs text-slate-400 mt-1">Your account is active and in good standing. No security alerts detected.</p>
              </div>
            </div>
          </div>

          {/* Sessions (Mock) */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Sessions</h3>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <Monitor className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs font-medium text-white">Current Session</p>
                  <p className="text-[10px] text-slate-400">Windows • Chrome • IP: 192.168.1.1</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded-md">Active Now</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 opacity-60">
              <div className="flex items-center gap-3">
                <Monitor className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs font-medium text-white">Previous Session</p>
                  <p className="text-[10px] text-slate-400">Mac OS • Safari • IP: 10.0.0.45</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500">2 days ago</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
