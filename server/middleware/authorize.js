import { get } from '../services/database.js';

/**
 * Requires the authenticated user to have role = 'admin'. Run AFTER requireAuth.
 * Rejects with 403 for members.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/**
 * Factory: returns middleware that checks recusal for the appeal identified by
 * req.params[paramName]. Recused members get 404 (not 403) so the existence of
 * the appeal itself is not leaked. Admins bypass the gate.
 *
 * Usage:
 *   router.get('/appeals/:id', requireAuth, requireAppealAccess('id'), handler)
 *
 * Exported unused from PR A; wired to appeal routes in PR B.
 */
export function requireAppealAccess(paramName = 'id') {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.role === 'admin') return next();

    const appealId = req.params[paramName];
    if (!appealId) return res.status(400).json({ error: 'Appeal id missing from route' });

    try {
      const recused = await get(
        `SELECT 1 FROM appeal_recusals
          WHERE appeal_id = ? AND user_id = ? AND revoked_at IS NULL`,
        [appealId, req.user.id]
      );
      if (recused) return res.status(404).json({ error: 'Not found' });
      next();
    } catch (err) {
      console.error('Recusal check failed:', err);
      return res.status(500).json({ error: 'Access check failed' });
    }
  };
}
