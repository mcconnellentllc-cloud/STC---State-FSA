import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { get, run } from '../services/database.js';

const TENANT_ID = process.env.MICROSOFT_TENANT_ID;
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;

const jwksClient = jwksRsa({
  jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000
});

function getSigningKey(header, callback) {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

/**
 * Validates Microsoft Entra ID JWT tokens and authorizes access against the
 * users table. The hardcoded ALLOWED_USERS allowlist that lived here has been
 * replaced with a DB lookup; add/remove users via admin UI (PR D) or direct
 * INSERT on the users table for now.
 *
 * On success, attaches req.user = { id, email, role, display_name, name, oid, tid }.
 * On unknown or inactive email: 403 with "Account not authorized — contact admin."
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const token = authHeader.substring(7);

  const decodedPeek = jwt.decode(token, { complete: true });
  if (!decodedPeek) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

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
    async (err, decoded) => {
      if (err) {
        console.error('JWT verification failed:', err.message);
        return res.status(401).json({ error: 'Token verification failed', detail: err.message });
      }

      const email = (
        decoded.preferred_username ||
        decoded.email ||
        decoded.upn ||
        ''
      ).toLowerCase();

      if (!email) {
        return res.status(401).json({ error: 'No email found in token' });
      }

      try {
        const userRow = await get(
          'SELECT id, email, role, display_name, active FROM users WHERE email = ?',
          [email]
        );

        if (!userRow) {
          console.warn(`Access denied for unknown user: ${email}`);
          return res.status(403).json({ error: 'Account not authorized — contact admin.' });
        }
        if (!userRow.active) {
          console.warn(`Access denied for inactive user: ${email}`);
          return res.status(403).json({ error: 'Account deactivated — contact admin.' });
        }

        req.user = {
          id: userRow.id,
          email: userRow.email,
          role: userRow.role,
          display_name: userRow.display_name,
          name: decoded.name || userRow.display_name || email,
          oid: decoded.oid,
          tid: decoded.tid
        };

        run('UPDATE users SET last_login = datetime(\'now\') WHERE id = ?', [userRow.id])
          .catch(e => console.warn('last_login update failed:', e.message));

        next();
      } catch (dbErr) {
        console.error('Auth DB lookup failed:', dbErr);
        return res.status(500).json({ error: 'Auth check failed' });
      }
    }
  );
}
