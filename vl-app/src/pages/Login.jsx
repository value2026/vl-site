import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FlaskConical, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <main className="pt-20 min-h-screen bg-[#1c213f] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[30%] w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[26rem] relative z-10">
        {/* Transparent Logo Construction */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-90 transition-opacity">
            <div className="bg-white p-1 rounded-full flex-shrink-0">
              <img src="/amrita-icon.jpg" alt="Amrita Logo" className="h-10 w-10 object-contain rounded-full" />
            </div>
            <div className="flex flex-col justify-center text-left">
              <span className="text-white font-serif text-3xl leading-none tracking-wide font-bold">
                AMRITA
              </span>
              <span className="text-white text-[11px] tracking-[0.2em] leading-none mt-1.5 uppercase opacity-90">
                Vishwa Vidyapeetham
              </span>
            </div>
          </Link>
          <h1 className="text-[1.75rem] font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-[15px]">Sign in to your Amrita Virtual Labs account</p>
        </div>

        <div className="bg-[#24294a] rounded-[1.5rem] border border-slate-600/30 shadow-2xl p-8">

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email / Username */}
            <div className="mb-5">
              <label htmlFor="login-email" className="block text-[14px] font-semibold text-slate-200 mb-2">
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
                className="w-full bg-[#2a3056] border border-slate-600/40 rounded-xl px-4 py-3.5 text-[15px] text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>

            {/* Password */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="text-[14px] font-semibold text-slate-200">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[13px] text-indigo-400 hover:text-indigo-300 hover:underline">
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
                  className="w-full bg-[#2a3056] border border-slate-600/40 rounded-xl px-4 py-3.5 pr-12 text-[15px] text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
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
              className="w-full bg-[#5d63ec] hover:bg-[#4d53d8] text-white font-bold rounded-xl py-3.5 text-[15px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
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

          <div className="mt-8 pt-6 border-t border-slate-600/40 text-center">
            <p className="text-[14px] text-slate-400">
              Don't have an account?{' '}
              <Link to="/contact" className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline">
                Contact your institution
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
