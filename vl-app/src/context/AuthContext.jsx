import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { getApiBaseUrl } from '../utils/url';

const AuthContext = createContext(null);

const API_URL = getApiBaseUrl();

export function AuthProvider({ children }) {
  const [user,       setUser]       = useState(null);
  const [token,      setToken]      = useState(() => localStorage.getItem('vl_token'));
  const [loading,    setLoading]    = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutReason, setLogoutReason] = useState(null);
  const timeoutRef = useRef(null);

  const isLoggingOutRef = useRef(false);

  const logout = useCallback((options) => {
    // Prevent duplicate logout calls locally without breaking cross-tab synchronization
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    const showAnimation = options !== false && options?.animate !== false;
    const finalReason = options?.reason || 'USER_LOGOUT';
    setLogoutReason(finalReason);
    
    const currentToken = localStorage.getItem('vl_token');

    // Always remove from storage immediately so other tabs sync ASAP
    localStorage.removeItem('vl_token');
    localStorage.removeItem('vl_refresh_token');

    if (currentToken) {
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ reason: finalReason })
      }).catch(() => {});
    }

    if (showAnimation) {
      setSigningOut(true);
      setTimeout(() => {
        setToken(null);
        setUser(null);
        setSigningOut(false);
        setLogoutReason(null);
        isLoggingOutRef.current = false;
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }, 2000); // slightly longer for reading "Session Expired"
    } else {
      setToken(null);
      setUser(null);
      setSigningOut(false);
      setLogoutReason(null);
      isLoggingOutRef.current = false;
    }
  }, []);

  const updateProfile = useCallback((newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }));
  }, []);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (token) {
      // 20 minutes inactivity timeout
      timeoutRef.current = setTimeout(() => {
        logout({ animate: true, reason: 'SESSION_TIMEOUT' });
      }, 20 * 60 * 1000);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      resetTimeout();
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      const handleActivity = () => resetTimeout();
      
      events.forEach((event) => {
        window.addEventListener(event, handleActivity, { passive: true });
      });

      const handleStorage = (e) => {
        if (e.key === 'vl_token' && !e.newValue) {
          logout({ animate: false });
        }
      };
      
      const handleSessionExpired = (e) => {
        const reason = e.detail?.reason || 'TOKEN_EXPIRED';
        logout({ animate: true, reason });
      };

      window.addEventListener('storage', handleStorage);
      window.addEventListener('vl_session_expired', handleSessionExpired);
      
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        events.forEach((event) => {
          window.removeEventListener(event, handleActivity);
        });
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('vl_session_expired', handleSessionExpired);
      };
    }
  }, [token, resetTimeout]);

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
    let res;
    try {
      res = await fetch(`${API_URL}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
    } catch (err) {
      throw new Error('Network error. Please check your connection or try again later.');
    }

    let data;
    const isJson = res.headers.get('content-type')?.includes('application/json');
    
    if (isJson) {
      data = await res.json();
    } else {
      throw new Error(`Server is currently unavailable (Status: ${res.status}). Please try again later.`);
    }

    if (!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.removeItem('vl_token');
    localStorage.removeItem('vl_refresh_token');
    localStorage.setItem('vl_token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('vl_refresh_token', data.refreshToken);
    }
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
                {logoutReason === 'SESSION_TIMEOUT' || logoutReason === 'TOKEN_EXPIRED' ? 'Session Expired' : 'Signing Out...'}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {logoutReason === 'SESSION_TIMEOUT' 
                  ? 'You have been logged out due to inactivity.'
                  : logoutReason === 'TOKEN_EXPIRED'
                  ? 'Your session has expired.'
                  : 'Securing your account. See you next time!'}
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
