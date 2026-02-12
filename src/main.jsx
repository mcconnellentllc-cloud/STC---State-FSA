import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { msalInstance } from './auth/msalConfig';
import { AuthProvider } from './auth/AuthContext';
import App from './App';
import './styles/global.css';

// CRITICAL: Initialize MSAL and handle redirect response BEFORE React renders.
// When returning from a Microsoft login redirect, the URL contains #code=...
// MSAL must process this hash before React mounts, otherwise the auth code
// is lost and login fails with a timeout.
async function startApp() {
  try {
    await msalInstance.initialize();
    // Process any redirect response — this consumes the #code= hash fragment
    await msalInstance.handleRedirectPromise();
  } catch (err) {
    console.error('MSAL startup error:', err);
    // Continue to render app even if redirect handling fails —
    // user can retry login from the UI
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}

startApp();

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
