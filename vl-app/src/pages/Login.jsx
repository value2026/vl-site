import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FlaskConical, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { assetUrl } from '../utils/url';

const DASHBOARD_MAP = {
  admin:        '/dashboard/admin',
  vl_manager:   '/dashboard/vl-manager',
  nodal_centre: '/dashboard/nodal',
  teacher:      '/dashboard/teacher',
  student:      '/dashboard/student',
};

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [form,   setForm]   = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error,  setError]  = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please enter your email/username and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const source = location.state?.from;
      const redirectTo = typeof source === 'string'
        ? source
        : source?.pathname + source?.search || DASHBOARD_MAP[user.role] || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
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

          {/* Info notification */}
          {location.state?.message && !error && (
            <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-blue-700 font-medium text-center">
              {location.state.message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {error}
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
