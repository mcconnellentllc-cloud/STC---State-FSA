import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { msalInstance, loginRequest } from './msalConfig';
import { InteractionRequiredAuthError, BrowserAuthError } from '@azure/msal-browser';

const AuthContext = createContext(null);

// Sanitize MSAL errors into user-friendly messages
function friendlyError(err) {
  const code = err?.errorCode || '';
  if (code === 'interaction_in_progress') return null;
  if (code === 'user_cancelled') return null;
  if (code === 'popup_window_error') return null; // Will fall back to redirect
  return 'Sign-in failed \u2014 please try again';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // { id, email, role, display_name } from /api/me
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount, check if MSAL already has an authenticated account
  // (either from redirect processing in main.jsx, or from cached session)
  useEffect(() => {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      setUser({
        name: accounts[0].name,
        email: accounts[0].username,
        account: accounts[0]
      });
    }
    setLoading(false);
  }, []);

  // Once we have a user session, fetch the app-side profile (role + display_name)
  // from the server. Runs after user is set and MSAL is ready to issue tokens.
  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      if (!user?.account) { setProfile(null); return; }
      try {
        const response = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: user.account
        });
        const token = response.idToken || response.accessToken;
        const res = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (cancelled) return;
        if (res.ok) {
          setProfile(await res.json());
        } else if (res.status === 403) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || 'Account not authorized');
          setProfile(null);
        }
      } catch (err) {
        if (!cancelled) console.error('Profile load failed:', err);
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  }, [user]);

  const login = useCallback(async () => {
    try {
      setError(null);

      // Use redirect flow — works reliably across Chrome, Edge, Firefox, Safari, mobile.
      // The page navigates to Microsoft login, then returns with #code= in the URL,
      // which main.jsx processes via handleRedirectPromise() on reload.
      await msalInstance.loginRedirect(loginRequest);

    } catch (err) {
      console.error('Login error:', err);
      const msg = friendlyError(err);
      if (msg) setError(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await msalInstance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin
      });
    } catch (err) {
      console.error('Logout error:', err);
      // Force clear on error
      try { msalInstance.clearCache(); } catch (_) { /* ignore */ }
      setUser(null);
    }
  }, []);

  const getAccessToken = useCallback(async () => {
    if (!user?.account) return null;

    try {
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: user.account
      });
      return response.idToken || response.accessToken;
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError ||
          err instanceof BrowserAuthError) {
        try {
          const response = await msalInstance.acquireTokenPopup(loginRequest);
          return response.idToken || response.accessToken;
        } catch (popupErr) {
          console.error('Token acquisition failed:', popupErr);
          // Last resort: redirect for token
          try {
            await msalInstance.acquireTokenRedirect(loginRequest);
            return null; // Page will redirect
          } catch (_) {
            setUser(null);
            return null;
          }
        }
      }
      console.error('Token acquisition failed:', err);
      setUser(null);
      return null;
    }
  }, [user]);

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, error, login, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
