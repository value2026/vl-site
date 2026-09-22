import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '../utils/api';
import { assetUrl } from '../utils/url';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link. Reset token is missing.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword: password });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password.');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
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
            <h1 className="text-2xl sm:text-[1.75rem] font-bold text-slate-900 mb-2">Create New Password</h1>
            <p className="text-slate-500 text-[14px] sm:text-[15px]">
              Please enter your secure new login password.
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-slate-900 font-bold text-lg">Password Updated</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[300px] mx-auto">
                  Your new login password has been saved. You can now log in to your Virtual Labs account.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold bg-primary-800 hover:bg-primary-900 text-white shadow-md shadow-primary-900/10 hover:shadow-lg transition-all"
                >
                  Log In Now
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* New Password */}
              <div>
                <label className="block text-[14px] font-semibold text-slate-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-11 pr-11 py-3.5 text-[15px] text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-700 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[14px] font-semibold text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-11 pr-11 py-3.5 text-[15px] text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-700 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-800 hover:bg-primary-900 text-white font-bold rounded-xl py-3.5 text-[15px] flex items-center justify-center gap-2 transition-all shadow-md shadow-primary-900/10 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" /> Resetting password…
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>

              {!token && (
                <div className="text-center pt-2">
                  <p className="text-[12px] text-amber-600 font-medium leading-normal bg-amber-50 border border-amber-200 rounded-lg p-2">
                    ⚠️ The URL is missing a security token. If you followed a link in your email, please verify you copied the full URL.
                  </p>
                </div>
              )}

              <div className="text-center pt-5 border-t border-slate-100">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 text-sm font-bold text-primary-800 hover:text-primary-900 hover:underline transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
