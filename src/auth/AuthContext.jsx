import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { msalInstance, loginRequest, loginRequestFallback } from './msalConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize MSAL and check for existing session
  useEffect(() => {
    const init = async () => {
      try {
        // Handle redirect response (if returning from login)
        await msalInstance.initialize();
        const response = await msalInstance.handleRedirectPromise();

        if (response) {
          setUser({
            name: response.account.name,
            email: response.account.username,
            account: response.account
          });
        } else {
          // Check for existing signed-in account
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
        setError(err.message);
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async () => {
    try {
      setError(null);
      // Use popup flow (works in development and production)
      const response = await msalInstance.loginPopup(loginRequest).catch(async (err) => {
        // If /.default scope fails, try basic scopes
        if (err.errorCode === 'invalid_resource' || err.errorMessage?.includes('AADSTS')) {
          return msalInstance.loginPopup(loginRequestFallback);
        }
        throw err;
      });

      if (response?.account) {
        setUser({
          name: response.account.name,
          email: response.account.username,
          account: response.account
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
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
      return response.accessToken;
    } catch (err) {
      // If silent fails, try with basic scopes
      try {
        const response = await msalInstance.acquireTokenSilent({
          ...loginRequestFallback,
          account: user.account
        });
        return response.idToken; // Use idToken when access token isn't available
      } catch (err2) {
        // If still fails, try popup
        try {
          const response = await msalInstance.acquireTokenPopup(loginRequest);
          return response.accessToken || response.idToken;
        } catch (err3) {
          console.error('Token acquisition failed:', err3);
          setUser(null);
          return null;
        }
      }
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
