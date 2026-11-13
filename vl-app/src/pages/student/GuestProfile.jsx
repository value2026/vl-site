import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, ShieldCheck, CheckCircle2, AlertCircle, Pencil,
  X, Save, Loader2, Compass, BookOpen, ArrowRight,
} from 'lucide-react';
import StudentNav from '../../components/student/StudentNav';
import GuestSelectField from '../../components/auth/GuestSelectField';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { COUNTRIES } from '../../data/countries';
import {
  PHONE_REGEX,
  AGE_GROUPS,
  GENDERS,
  PROFESSIONS,
  CONTROL_BASE,
  CONTROL_OK,
  CONTROL_ERR,
  buildDescribedBy,
} from '../../data/guestOptions';

const GUEST_SYSTEM_EMAIL = 'guest@virtuallabs.local';

const toFormState = (u) => ({
  name:       u?.name       || '',
  ageGroup:   u?.ageGroup   || '',
  gender:     u?.gender     || '',
  mobile:     u?.mobile     || '',
  profession: u?.profession || '',
  college:    u?.org        || '',
  subject:    u?.dept       || '',
  university: u?.university || '',
  country:    u?.country    || '',
  state:      u?.state      || '',
});

const PROFILE_ROWS = [
  { key: 'name',       label: 'Full Name',    getValue: (u) => u?.name },
  { key: 'email',      label: 'Email Address', getValue: (u) => u?.email },
  { key: 'ageGroup',   label: 'Age Group',    getValue: (u) => u?.ageGroup },
  { key: 'gender',     label: 'Gender',       getValue: (u) => u?.gender },
  { key: 'mobile',     label: 'Phone Number', getValue: (u) => u?.mobile },
  { key: 'profession', label: 'Profession',   getValue: (u) => u?.profession },
  { key: 'org',        label: 'College',      getValue: (u) => u?.org },
  { key: 'dept',       label: 'Subject',      getValue: (u) => u?.dept },
  { key: 'university', label: 'University',   getValue: (u) => u?.university },
  { key: 'country',    label: 'Country',      getValue: (u) => u?.country },
  { key: 'state',      label: 'State',        getValue: (u) => u?.state },
  {
    key: 'createdAt',
    label: 'Member Since',
    getValue: (u) =>
      u?.createdAt
        ? new Date(u.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : '',
  },
];

export default function GuestProfile() {
  const { user, updateProfile } = useAuth();
  const isSharedDemo = user?.email === GUEST_SYSTEM_EMAIL;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => toFormState(user));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState({ type: '', text: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fieldRefs = useRef({});
  const interactedRef = useRef(new Set());

  useEffect(() => {
    let cancelled = false;
    const syncFreshProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await api.get('/auth/me');
        if (res.ok && !cancelled) {
          const fresh = await res.json();
          updateProfile(fresh);
          if (!editing) {
            setForm(toFormState(fresh));
          }
        }
      } catch {
        // Ignore silent refresh failures; keep existing context user state
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };
    syncFreshProfile();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editing && user) {
      setForm(toFormState(user));
    }
  }, [user, editing]);

  const validateField = (field, values) => {
    if (field === 'name') {
      if (!values.name.trim()) return 'Full name is required.';
    }
    if (field === 'mobile') {
      const val = values.mobile.trim();
      if (val && !PHONE_REGEX.test(val)) {
        return 'Enter a valid phone number (7–24 characters).';
      }
    }
    return '';
  };

  const handleFieldChange = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (interactedRef.current.has(field) || errors[field]) {
      const nextErr = validateField(field, next);
      setErrors((prev) => ({ ...prev, [field]: nextErr || undefined }));
    }
  };

  const handleFieldBlur = (field) => {
    interactedRef.current.add(field);
    const err = validateField(field, form);
    setErrors((prev) => ({ ...prev, [field]: err || undefined }));
  };

  const startEditing = () => {
    setForm(toFormState(user));
    setErrors({});
    setBanner({ type: '', text: '' });
    interactedRef.current.clear();
    setEditing(true);
  };

  const cancelEditing = () => {
    setForm(toFormState(user));
    setErrors({});
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner({ type: '', text: '' });

    const nextErrors = {};
    for (const key of ['name', 'mobile']) {
      const err = validateField(key, form);
      if (err) nextErrors[key] = err;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstKey = ['name', 'mobile'].find((k) => nextErrors[k]);
      fieldRefs.current[firstKey]?.focus();
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/auth/guest/profile', {
        name:       form.name.trim(),
        ageGroup:   form.ageGroup,
        gender:     form.gender,
        mobile:     form.mobile.trim(),
        profession: form.profession,
        college:    form.college.trim(),
        subject:    form.subject.trim(),
        university: form.university.trim(),
        country:    form.country,
        state:      form.state.trim(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Could not update profile.');
      }

      if (data.user) {
        updateProfile(data.user);
        setForm(toFormState(data.user));
      }
      setEditing(false);
      setBanner({ type: 'success', text: data.message || 'Profile updated successfully.' });
    } catch (err) {
      setBanner({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <StudentNav breadcrumb={[{ label: 'Profile' }]} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 space-y-6">
        {/* Profile Header Card */}
        <section
          aria-label="Guest account overview"
          className="bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#3730a3] rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center text-2xl font-bold shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'G'}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold truncate">{user?.name || 'Guest Learner'}</h1>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-400/20 border border-indigo-300/30 text-indigo-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                    Guest
                  </span>
                  {user?.emailVerified !== false && !isSharedDemo && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-100">
                      <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-indigo-200 text-sm flex items-center gap-1.5 mt-1 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{user?.email || 'Guest session'}</span>
                </p>
              </div>
            </div>

            <Link
              to="/labs"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 text-sm font-semibold transition-colors shrink-0 shadow-sm"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              Browse All Labs
            </Link>
          </div>
        </section>

        {/* Status / Feedback Banner */}
        {banner.text && (
          <div
            role={banner.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2.5 border ${
              banner.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {banner.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span>{banner.text}</span>
          </div>
        )}

        {/* Profile Information / Edit Card */}
        <section
          aria-labelledby="guest-profile-heading"
          className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <User className="w-4 h-4 text-indigo-700" aria-hidden="true" />
              </div>
              <div>
                <h2 id="guest-profile-heading" className="text-base font-bold text-gray-900">
                  Guest Profile Information
                </h2>
                <p className="text-xs text-gray-500">
                  {editing
                    ? 'Update your personal and academic details below.'
                    : 'Your registered guest account details.'}
                </p>
              </div>
            </div>

            {!editing && !isSharedDemo && (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                Edit Profile
              </button>
            )}
          </div>

          {loadingProfile && !user?.ageGroup && !editing ? (
            <div className="py-10 flex items-center justify-center text-gray-500 text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" aria-hidden="true" />
              Loading profile details...
            </div>
          ) : editing ? (
            <form onSubmit={handleSubmit} noValidate aria-labelledby="guest-profile-heading" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gp-name" className="block text-[14px] font-semibold text-slate-700 mb-1.5">
                    Full Name <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={(el) => { fieldRefs.current.name = el; }}
                    id="gp-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    maxLength={80}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={buildDescribedBy(null, 'gp-name-error', Boolean(errors.name))}
                    value={form.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    onBlur={() => handleFieldBlur('name')}
                    className={`${CONTROL_BASE} ${errors.name ? CONTROL_ERR : CONTROL_OK}`}
                  />
                  {errors.name && (
                    <p id="gp-name-error" role="alert" className="mt-1 text-xs font-medium text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="gp-email" className="block text-[14px] font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="gp-email"
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    disabled
                    aria-describedby="gp-email-help"
                    className={`${CONTROL_BASE} border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed`}
                  />
                  <p id="gp-email-help" className="mt-1 text-xs text-slate-500">
                    Verified login email cannot be changed here.
                  </p>
                </div>

                <GuestSelectField
                  id="gp-age-group"
                  name="ageGroup"
                  label="Age Group"
                  allowEmpty
                  value={form.ageGroup}
                  options={AGE_GROUPS}
                  onChange={(e) => handleFieldChange('ageGroup', e.target.value)}
                />

                <fieldset>
                  <legend className="block text-[14px] font-semibold text-slate-700 mb-1.5">
                    Gender
                  </legend>
                  <div className="flex items-center gap-6 min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-slate-50/80">
                    {GENDERS.map((g) => (
                      <div key={g} className="flex items-center gap-2">
                        <input
                          id={`gp-gender-${g.toLowerCase()}`}
                          name="gender"
                          type="radio"
                          value={g}
                          checked={form.gender === g}
                          onChange={(e) => handleFieldChange('gender', e.target.value)}
                          className="w-4 h-4 accent-primary-800 cursor-pointer"
                        />
                        <label
                          htmlFor={`gp-gender-${g.toLowerCase()}`}
                          className="text-sm font-medium text-slate-800 cursor-pointer"
                        >
                          {g}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="gp-mobile" className="block text-[14px] font-semibold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    ref={(el) => { fieldRefs.current.mobile = el; }}
                    id="gp-mobile"
                    name="mobile"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={24}
                    placeholder="+91 00000 00000"
                    aria-invalid={errors.mobile ? 'true' : 'false'}
                    aria-describedby={buildDescribedBy(null, 'gp-mobile-error', Boolean(errors.mobile))}
                    value={form.mobile}
                    onChange={(e) => handleFieldChange('mobile', e.target.value)}
                    onBlur={() => handleFieldBlur('mobile')}
                    className={`${CONTROL_BASE} ${errors.mobile ? CONTROL_ERR : CONTROL_OK}`}
                  />
                  {errors.mobile && (
                    <p id="gp-mobile-error" role="alert" className="mt-1 text-xs font-medium text-red-600">
                      {errors.mobile}
                    </p>
                  )}
                </div>

                <GuestSelectField
                  id="gp-profession"
                  name="profession"
                  label="Profession"
                  allowEmpty
                  value={form.profession}
                  options={PROFESSIONS}
                  onChange={(e) => handleFieldChange('profession', e.target.value)}
                />

                <div>
                  <label htmlFor="gp-college" className="block text-[14px] font-semibold text-slate-700 mb-1.5">
                    College
                  </label>
                  <input
                    id="gp-college"
                    name="college"
                    type="text"
                    autoComplete="organization"
                    maxLength={120}
                    placeholder="Enter your college name"
                    value={form.college}
                    onChange={(e) => handleFieldChange('college', e.target.value)}
                    className={`${CONTROL_BASE} ${CONTROL_OK}`}
                  />
                </div>

                <div>
                  <label htmlFor="gp-subject" className="block text-[14px] font-semibold text-slate-700 mb-1.5">
                    Subject
                  </label>
                  <input
                    id="gp-subject"
                    name="subject"
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Computer Science, Physics"
                    value={form.subject}
                    onChange={(e) => handleFieldChange('subject', e.target.value)}
                    className={`${CONTROL_BASE} ${CONTROL_OK}`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="gp-university" className="block text-[14px] font-semibold text-slate-700 mb-1.5">
                    University
                  </label>
                  <input
                    id="gp-university"
                    name="university"
                    type="text"
                    maxLength={120}
                    placeholder="Enter your university name"
                    value={form.university}
                    onChange={(e) => handleFieldChange('university', e.target.value)}
                    className={`${CONTROL_BASE} ${CONTROL_OK}`}
                  />
                </div>

                <GuestSelectField
                  id="gp-country"
                  name="country"
                  label="Country"
                  allowEmpty
                  autoComplete="country-name"
                  value={form.country}
                  options={COUNTRIES}
                  onChange={(e) => handleFieldChange('country', e.target.value)}
                />

                <div>
                  <label htmlFor="gp-state" className="block text-[14px] font-semibold text-slate-700 mb-1.5">
                    State
                  </label>
                  <input
                    id="gp-state"
                    name="state"
                    type="text"
                    autoComplete="address-level1"
                    maxLength={80}
                    placeholder="Enter your state or region"
                    value={form.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    className={`${CONTROL_BASE} ${CONTROL_OK}`}
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-800 hover:bg-primary-900 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="w-4 h-4" aria-hidden="true" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROFILE_ROWS.map((item) => {
                const rawVal = item.getValue(user);
                return (
                  <div
                    key={item.key}
                    className="rounded-xl bg-slate-50/90 border border-slate-200/70 px-4 py-3"
                  >
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {item.label}
                    </dt>
                    <dd className="text-sm font-semibold text-slate-900 mt-1 break-words">
                      {rawVal || <span className="text-slate-400 font-normal">Not specified</span>}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </section>

        {/* Guest Privileges Footer Card */}
        <section
          aria-label="Guest learner privileges"
          className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-950">Guest Learner Access</h3>
              <p className="text-xs text-indigo-800/80 mt-0.5">
                Explore all subjects, labs, theory materials, interactive simulations, and self-practice quizzes anytime.
              </p>
            </div>
          </div>
          <Link
            to="/labs"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
          >
            Go to Labs
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
    </div>
  );
}
