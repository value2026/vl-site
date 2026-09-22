import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';
import { assetUrl } from '../utils/url';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to request password reset link.');
      setMessage(data.message || 'If this email is registered, a password reset link has been sent.');
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
            <h1 className="text-2xl sm:text-[1.75rem] font-bold text-slate-900 mb-2">Forgot Password?</h1>
            <p className="text-slate-500 text-[14px] sm:text-[15px]">
              No worries! Enter your email and we'll send you a password reset link.
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {message ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-slate-900 font-bold text-lg">Check your email</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[300px] mx-auto">
                  {message}
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 text-sm font-bold text-primary-800 hover:text-primary-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="block text-[14px] font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@institution.edu"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-[15px] text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-700 transition-all"
                  />
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
                      <Loader2 className="w-4.5 h-4.5 animate-spin" /> Sending link…
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>

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
