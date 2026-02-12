import fetch from 'node-fetch';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
const TOKEN_URL_TEMPLATE = 'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token';

let tokenCache = { accessToken: null, expiresAt: 0 };

export async function getAccessToken() {
  // Return cached token if still valid (with 5 min buffer)
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt - 300000) {
    return tokenCache.accessToken;
  }

  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Microsoft Graph credentials not configured');
  }

  const tokenUrl = TOKEN_URL_TEMPLATE.replace('{tenant}', tenantId);

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default'
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Token request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000)
  };

  return tokenCache.accessToken;
}

export async function graphGet(endpoint) {
  const token = await getAccessToken();
  const url = endpoint.startsWith('http') ? endpoint : `${GRAPH_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Graph API error (${response.status}): ${errText}`);
  }

  return response.json();
}

export async function graphGetBinary(endpoint) {
  const token = await getAccessToken();
  const url = endpoint.startsWith('http') ? endpoint : `${GRAPH_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Graph API binary error (${response.status})`);
  }

  return response.buffer();
}

export async function getSiteId() {
  const siteUrl = process.env.SHAREPOINT_SITE_URL;
  if (!siteUrl) throw new Error('SHAREPOINT_SITE_URL not configured');

  // Parse the URL to get hostname and site path
  const url = new URL(siteUrl);
  const hostname = url.hostname;
  const sitePath = url.pathname;

  const data = await graphGet(`/sites/${hostname}:${sitePath}`);
  return data.id;
}

export async function getDriveId(siteId) {
  const data = await graphGet(`/sites/${siteId}/drives`);
  const libraryName = process.env.SHAREPOINT_LIBRARY || 'Shared Documents';
  // Match on the drive name (Documents library)
  const drive = data.value.find(d =>
    d.name === libraryName || d.name === 'Documents'
  );
  if (!drive) throw new Error(`Drive "${libraryName}" not found`);
  return drive.id;
}

/**
 * Upload a file to SharePoint via Graph API.
 * Puts the file in the watch folder (Teams channel) under the given subfolder path.
 */
export async function graphUploadFile(driveId, folderPath, fileName, fileBuffer, contentType) {
  const token = await getAccessToken();
  const watchFolder = process.env.SHAREPOINT_WATCH_FOLDER || 'FSA - State Committee';
  const fullPath = folderPath ? `${watchFolder}/${folderPath}` : watchFolder;
  const encodedPath = fullPath.split('/').map(seg => encodeURIComponent(seg)).join('/');
  const encodedFileName = encodeURIComponent(fileName);

  const url = `${GRAPH_BASE}/drives/${driveId}/root:/${encodedPath}/${encodedFileName}:/content`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': contentType || 'application/octet-stream'
    },
    body: fileBuffer
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Graph upload error (${response.status}): ${errText}`);
  }

  return response.json();
}

export async function testConnection() {
  try {
    const token = await getAccessToken();
    const siteId = await getSiteId();
    const driveId = await getDriveId(siteId);
    return {
      connected: true,
      siteId,
      driveId,
      message: 'Successfully connected to Microsoft Graph'
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message
    };
  }
}
