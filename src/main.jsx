import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { msalInstance } from './auth/msalConfig';
import { AuthProvider } from './auth/AuthContext';
import App from './App';
import './styles/global.css';

async function startApp() {
  // Initialize MSAL before rendering
  await msalInstance.initialize();

  // Process any redirect response (user returning from Microsoft login).
  // This handles the #code= hash in the URL after loginRedirect().
  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response) {
      // Successfully authenticated via redirect — clear the hash
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
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
