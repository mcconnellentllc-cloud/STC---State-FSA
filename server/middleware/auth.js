import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

const TENANT_ID = process.env.MICROSOFT_TENANT_ID;
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;

const ALLOWED_USERS = [
  'kyle@togoag.com',
  'brandi@togoag.com'
];

// JWKS client to fetch Microsoft's signing keys
const jwksClient = jwksRsa({
  jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000 // 10 minutes
});

function getSigningKey(header, callback) {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

/**
 * Express middleware that validates Microsoft Entra ID JWT tokens.
 * - Verifies signature using Microsoft's JWKS endpoint
 * - Checks audience matches our Client ID
 * - Checks issuer matches our tenant
 * - Checks token is not expired
 * - Checks user email is in the allowed list
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const token = authHeader.substring(7);

  // Decode without verifying first to inspect claims
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  // Verify the token
  jwt.verify(
    token,
    getSigningKey,
    {
      algorithms: ['RS256'],
      audience: CLIENT_ID,
      issuer: [
        `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
        `https://sts.windows.net/${TENANT_ID}/`
      ]
    },
    (err, decoded) => {
      if (err) {
        console.error('JWT verification failed:', err.message);
        return res.status(401).json({ error: 'Token verification failed', detail: err.message });
      }

      // Extract email from token claims
      // Microsoft tokens use 'preferred_username', 'email', or 'upn'
      const email = (
        decoded.preferred_username ||
        decoded.email ||
        decoded.upn ||
        ''
      ).toLowerCase();

      if (!email) {
        return res.status(401).json({ error: 'No email found in token' });
      }

      // Check user is in allowed list
      if (!ALLOWED_USERS.includes(email)) {
        console.warn(`Access denied for user: ${email}`);
        return res.status(403).json({ error: 'Access denied. Your account is not authorized.' });
      }

      // Attach user info to request for downstream use
      req.user = {
        email,
        name: decoded.name || email,
        oid: decoded.oid,
        tid: decoded.tid
      };

      next();
    }
  );
}
