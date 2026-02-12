import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { msalInstance, loginRequest } from './msalConfig';
import { InteractionRequiredAuthError, BrowserAuthError } from '@azure/msal-browser';

const AuthContext = createContext(null);

// Sanitize MSAL errors into user-friendly messages
function friendlyError(err) {
  // Never show raw MSAL error codes/messages to users
  const code = err?.errorCode || '';
  if (code === 'interaction_in_progress') return null; // Suppress — will retry
  if (code === 'user_cancelled') return null; // User closed popup, no error needed
  if (code === 'popup_window_error') return 'Pop-up was blocked. Please allow pop-ups and try again.';
  return 'Sign-in failed \u2014 please try again';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize MSAL and check for existing session
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        await msalInstance.initialize();

        // Process any redirect response (if returning from login redirect flow)
        const response = await msalInstance.handleRedirectPromise();

        if (cancelled) return;

        if (response?.account) {
          setUser({
            name: response.account.name,
            email: response.account.username,
            account: response.account
          });
        } else {
          // Check for existing signed-in account in cache
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            setUser({
              name: accounts[0].name,
              email: accounts[0].username,
              account: accounts[0]
            });
          }
        }
      } catch (err) {
        console.error('MSAL init error:', err);
        // Don't show init errors to user — they can click Sign In
        if (err?.errorCode === 'interaction_in_progress') {
          // Clear stuck interaction state
          try {
            msalInstance.clearCache();
          } catch (_) { /* ignore */ }
        }
      }
      if (!cancelled) setLoading(false);
    };
    init();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async () => {
    try {
      setError(null);

      const response = await msalInstance.loginPopup(loginRequest);

      if (response?.account) {
        setUser({
          name: response.account.name,
          email: response.account.username,
          account: response.account
        });
      }
    } catch (err) {
      console.error('Login error:', err);

      // Handle interaction_in_progress by clearing state and retrying once
      if (err?.errorCode === 'interaction_in_progress') {
        try {
          // Wait a moment then try clearing and retrying
          await new Promise(r => setTimeout(r, 1000));
          const response = await msalInstance.loginPopup(loginRequest);
          if (response?.account) {
            setUser({
              name: response.account.name,
              email: response.account.username,
              account: response.account
            });
            return;
          }
        } catch (retryErr) {
          console.error('Login retry error:', retryErr);
          const msg = friendlyError(retryErr);
          if (msg) setError(msg);
          return;
        }
      }

      const msg = friendlyError(err);
      if (msg) setError(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await msalInstance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
        mainWindowRedirectUri: window.location.origin
      });
      setUser(null);
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
      // Try to silently acquire token
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: user.account
      });
      return response.idToken || response.accessToken;
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError ||
          err instanceof BrowserAuthError) {
        // Silent failed, try popup
        try {
          const response = await msalInstance.acquireTokenPopup(loginRequest);
          return response.idToken || response.accessToken;
        } catch (popupErr) {
          console.error('Token popup failed:', popupErr);
          setUser(null);
          return null;
        }
      }
      console.error('Token acquisition failed:', err);
      setUser(null);
      return null;
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
