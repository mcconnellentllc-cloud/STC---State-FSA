import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { msalInstance } from './auth/msalConfig';
import { AuthProvider } from './auth/AuthContext';
import App from './App';
import './styles/global.css';

async function startApp() {
  await msalInstance.initialize();

  // Detect if we're running inside an MSAL popup or iframe.
  // When the popup returns from Microsoft with #code=..., MSAL needs to
  // process that code and send the result back to the parent window.
  // If we render the full React app in the popup, it interferes with this.
  const isPopup = window.opener && window.opener !== window;
  const isIframe = window.parent && window.parent !== window;
  const hasAuthCode = window.location.hash.includes('code=');

  if ((isPopup || isIframe) && hasAuthCode) {
    // We're in a popup/iframe returning from Microsoft login.
    // Just let handleRedirectPromise() process the auth code and
    // communicate it back to the parent window. Don't render the app.
    try {
      await msalInstance.handleRedirectPromise();
    } catch (err) {
      console.error('MSAL popup redirect error:', err);
    }
    return; // Don't render — MSAL will close this popup automatically
  }

  // Main window: handle any redirect response (for redirect flow fallback)
  try {
    await msalInstance.handleRedirectPromise();
  } catch (err) {
    console.error('MSAL redirect error:', err);
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
