import { PublicClientApplication, LogLevel, BrowserCacheLocation } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
const tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID;

// Redirect URI should be the origin root for SPA popup/redirect flows.
// Azure App Registration redirect URIs should include:
//   - https://stc-state-fsa.onrender.com
//   - http://localhost:5173
//   - http://localhost:3000
// (Also keep /auth/callback variants if previously registered)
const redirectUri = window.location.origin;

export const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: true // Helps with IE/Edge issues and redirect flows
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning
    },
    allowRedirectInIframe: false
  }
};

// Scopes — openid/profile/email get us an ID token with user claims
export const loginRequest = {
  scopes: ['openid', 'profile', 'email']
};

export const msalInstance = new PublicClientApplication(msalConfig);
