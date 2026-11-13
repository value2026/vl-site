import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

const FULL_GOOGLE_BTN =
  'w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 shadow-xs transition-all disabled:opacity-60 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700';

/**
 * Custom full-width Google OAuth button ("Continue to Google").
 * Uses GIS OAuth2 tokenClient so it always renders the crisp Google icon and static label
 * without Chrome auto-replacing the button with a personalized "Continue as ..." iframe.
 */
export default function SocialAuthButtons({
  onSuccess,
  onError,
  onInfo,
  onBusyChange,
  disabled = false,
  googleUnavailableMessage = 'Google Sign-In is currently unavailable. Please register as a Guest or sign in with your institutional account.',
}) {
  const { googleLogin, API_URL } = useAuth();
  const [googleClientId, setGoogleClientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
  const [scriptLoaded, setScriptLoaded] = useState(() => Boolean(window.google?.accounts?.oauth2));
  const [busy, setBusy] = useState(false);

  const tokenClientRef = useRef(null);
  const googleLoginRef = useRef(googleLogin);
  googleLoginRef.current = googleLogin;

  const callbacksRef = useRef({ onSuccess, onError, onInfo, onBusyChange });
  callbacksRef.current = { onSuccess, onError, onInfo, onBusyChange };

  useEffect(() => {
    let active = true;
    const loadAuthConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/config`);
        if (res.ok && active) {
          const data = await res.json();
          if (data.googleClientId) {
            setGoogleClientId(data.googleClientId);
          }
        }
      } catch {
        // Keep build-time fallback value if config request fails
      }
    };
    loadAuthConfig();
    return () => { active = false; };
  }, [API_URL]);

  useEffect(() => {
    if (!googleClientId) return undefined;
    let cancelled = false;

    const initTokenClient = () => {
      if (cancelled || !window.google?.accounts?.oauth2) return;
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'openid email profile',
        callback: async (response) => {
          const cb = callbacksRef.current;
          if (response?.error || !response?.access_token) {
            setBusy(false);
            cb.onBusyChange?.(false);
            cb.onError?.(response?.error_description || 'Google sign-in did not complete.');
            return;
          }
          try {
            const authUser = await googleLoginRef.current({ accessToken: response.access_token });
            cb.onSuccess?.(authUser);
          } catch (err) {
            cb.onError?.(err.message || 'Google sign-in failed');
          } finally {
            setBusy(false);
            cb.onBusyChange?.(false);
          }
        },
        error_callback: () => {
          setBusy(false);
          callbacksRef.current.onBusyChange?.(false);
        },
      });
      setScriptLoaded(true);
    };

    if (window.google?.accounts?.oauth2) {
      initTokenClient();
      return () => { cancelled = true; };
    }

    const existingScript = document.querySelector(`script[src="${GIS_SCRIPT_URL}"]`);
    const script = existingScript || document.createElement('script');
    if (!existingScript) {
      script.src = GIS_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => initTokenClient();
    const handleError = () => {
      if (!cancelled) {
        callbacksRef.current.onError?.('Unable to load Google Sign-In script. Please use the email form instead.');
      }
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    return () => {
      cancelled = true;
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, [googleClientId]);

  const handleClick = () => {
    const cb = callbacksRef.current;
    cb.onError?.('');
    cb.onInfo?.('');

    if (!googleClientId) {
      cb.onInfo?.(googleUnavailableMessage);
      return;
    }

    if (!tokenClientRef.current) {
      cb.onError?.('Google Sign-In is still initializing. Please try again in a moment.');
      return;
    }

    setBusy(true);
    cb.onBusyChange?.(true);
    tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
  };

  return (
    <button
      type="button"
      disabled={disabled || busy || (Boolean(googleClientId) && !scriptLoaded)}
      aria-label="Continue to Google"
      onClick={handleClick}
      className={FULL_GOOGLE_BTN}
    >
      {busy ? (
        <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
          <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
        </svg>
      )}
      <span>{busy ? 'Connecting to Google…' : 'Continue to Google'}</span>
    </button>
  );
}
