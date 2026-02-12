import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { msalInstance } from './auth/msalConfig';
import { AuthProvider } from './auth/AuthContext';
import App from './App';
import './styles/global.css';

async function startApp() {
  // If we're in a popup window (opened by MSAL loginPopup), do NOTHING.
  // The parent window's loginPopup() call monitors this popup's URL,
  // extracts the #code= hash, exchanges it for a token, and closes the popup.
  // If we call handleRedirectPromise() here, it interferes with that process.
  const isPopup = window.opener && window.opener !== window;
  if (isPopup) {
    // Don't initialize MSAL, don't call handleRedirectPromise(), don't render.
    // The parent window handles everything.
    return;
  }

  await msalInstance.initialize();

  // Main window: handle any redirect response (for redirect flow fallback)
  // This processes #code= if the user was redirected (not popup) back to the app
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
