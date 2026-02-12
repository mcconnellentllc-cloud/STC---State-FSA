import { PublicClientApplication, LogLevel } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
const tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID;

export const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin + '/auth/callback',
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning
    }
  }
};

// Scopes to request — we need the user's profile info and an ID token
// The openid + profile + email scopes get us an ID token with user claims
// We also request an access token scoped to our own app
export const loginRequest = {
  scopes: [`${clientId}/.default`]
};

// Fallback: use openid scopes if /.default doesn't work
export const loginRequestFallback = {
  scopes: ['openid', 'profile', 'email']
};

export const msalInstance = new PublicClientApplication(msalConfig);
