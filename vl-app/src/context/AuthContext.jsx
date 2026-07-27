import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

const AuthContext = createContext(null);

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
};
const API_URL = getApiUrl();

export function AuthProvider({ children }) {
  const [user,       setUser]       = useState(null);
  const [token,      setToken]      = useState(() => localStorage.getItem('vl_token'));
  const [loading,    setLoading]    = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const logout = useCallback((options) => {
    const showAnimation = options !== false && options?.animate !== false;
    if (showAnimation) {
      setSigningOut(true);
      setTimeout(() => {
        localStorage.removeItem('vl_token');
        setToken(null);
        setUser(null);
        setSigningOut(false);
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }, 1500);
    } else {
      localStorage.removeItem('vl_token');
      setToken(null);
      setUser(null);
      setSigningOut(false);
    }
  }, []);

  const updateProfile = useCallback((newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }));
  }, []);

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setUser(data))
      .catch(() => logout(false))
      .finally(() => setLoading(false));
  }, [token, logout]);

  const login = async (email, password) => {
    const res  = await fetch(`${API_URL}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.removeItem('vl_token');
    localStorage.setItem('vl_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateProfile, API_URL }}>
      {children}

      {/* Sign Out Animation Overlay */}
      {signingOut && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 transition-all duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden transform transition-all duration-300 scale-100">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-rose-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              {/* Animated Icon Ring */}
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Ending Session
              </div>

              <h3 className="text-white font-extrabold text-xl tracking-tight mb-2">
                Signing Out...
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Securing your account. See you next time!
              </p>

              {/* Progress bar animation */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 h-full w-full animate-pulse rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}