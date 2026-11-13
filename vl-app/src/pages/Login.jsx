import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { assetUrl } from '../utils/url';
import { getAuthRedirectPath } from '../utils/authRedirect';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [guestBusy, setGuestBusy] = useState(false);
  const [guestError, setGuestError] = useState('');
  const [guestInfo, setGuestInfo] = useState('');

  const completeAuthRedirect = (loggedInUser) => {
    navigate(getAuthRedirectPath(loggedInUser, location.state), { replace: true });
  };

  const [form, setForm] = useState({
    email: location.state?.prefillEmail || '',
    password: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [verifyPendingEmail, setVerifyPendingEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setVerifyPendingEmail('');
    if (!form.email || !form.password) {
      setError('Please enter your email/username and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      completeAuthRedirect(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      if (err.requiresVerification && err.email) {
        setVerifyPendingEmail(err.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestClick = () => {
    navigate('/guest', { state: location.state });
  };

  return (
    <main className="pt-20 min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[25%] w-[45rem] h-[45rem] bg-indigo-100/60 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[35rem] h-[35rem] bg-rose-100/40 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[28rem] relative z-10">
        <div className="bg-white rounded-[1.75rem] border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 sm:p-10">
          {/* Amrita Logo & Card Header */}
          <div className="text-center mb-8 flex flex-col items-center">
            <Link to="/" className="inline-flex items-center justify-center mb-5 hover:opacity-90 transition-all group">
              <img 
                src={assetUrl('/amrita-vishwa-vidyapeetham-university-logo-colored-version.svg')} 
                alt="Amrita Vishwa Vidyapeetham" 
                className="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
              />
            </Link>
            <h1 className="text-2xl sm:text-[1.75rem] font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-500 text-[14px] sm:text-[15px]">Sign in to your Amrita Virtual Labs account</p>
          </div>

          {/* Verified notification */}
          {location.state?.verifiedMessage && !error && (
            <div
              role="status"
              aria-live="polite"
              className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-emerald-800 font-medium text-center"
            >
              {location.state.verifiedMessage}
            </div>
          )}

          {/* Info notification */}
          {location.state?.message && !location.state?.verifiedMessage && !error && (
            <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-blue-700 font-medium text-center">
              {location.state.message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div role="alert" aria-live="assertive" className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              <p>{error}</p>
              {verifyPendingEmail && (
                <Link
                  to={`/guest?verifyEmail=${encodeURIComponent(verifyPendingEmail)}`}
                  state={location.state}
                  className="mt-2 inline-block font-semibold text-primary-800 hover:text-primary-900 underline"
                >
                  Verify your email now
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email / Username */}
            <div className="mb-5">
              <label htmlFor="login-email" className="block text-[14px] font-semibold text-slate-700 mb-2">
                Email or Username
              </label>
              <input
                id="login-email"
                name="email"
                type="text"
                autoComplete="username"
                value={form.email}
                onChange={handleChange}
                placeholder="you@institution.edu or username"
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3.5 text-[15px] text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-700 transition-all"
              />
            </div>

            {/* Password */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="text-[14px] font-semibold text-slate-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[13px] text-primary-700 hover:text-primary-800 font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3.5 pr-12 text-[15px] text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-700 transition-all tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full bg-primary-800 hover:bg-primary-900 text-white font-bold rounded-xl py-3.5 text-[15px] flex items-center justify-center gap-2 transition-all shadow-md shadow-primary-900/10 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Alternative Sign-In Options */}
          <section aria-label="Alternative sign-in options" className="mt-6">
            <div className="flex items-center gap-3 mb-5" aria-hidden="true">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                or
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {guestError && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
              >
                {guestError}
              </div>
            )}

            {guestInfo && (
              <div
                role="status"
                aria-live="polite"
                className="mb-3 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs font-medium text-blue-800"
              >
                {guestInfo}
              </div>
            )}

            <div className="space-y-3">
              <SocialAuthButtons
                onSuccess={completeAuthRedirect}
                onError={(msg) => setGuestError(msg)}
                onInfo={(msg) => setGuestInfo(msg)}
                onBusyChange={setGuestBusy}
                disabled={loading}
              />

              <button
                type="button"
                onClick={handleGuestClick}
                disabled={loading || guestBusy}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
              >
                Register as a Guest
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-slate-500">
              Continue with Google, or register as a guest to explore labs, run simulations, and practice quizzes.
            </p>
          </section>

          <div className="mt-8 pt-4">
            <div className="bg-gradient-to-r from-primary-50/90 via-indigo-50/80 to-blue-50/90 border border-primary-200/60 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-[14px] text-slate-700 font-medium">
                Don't have an account?{' '}
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-1 text-primary-800 hover:text-primary-900 font-bold underline decoration-primary-300 hover:decoration-primary-800 underline-offset-4 transition-all ml-1"
                >
                  Contact your institution &rarr;
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
