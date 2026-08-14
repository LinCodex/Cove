import crypto from 'crypto';

function adminSecret() {
  return process.env.MASTER_ADMIN_PASSWORD || process.env.VITE_MASTER_ADMIN_PASSWORD || '';
}

function storeSecret() {
  return process.env.STORE_TOKEN_SECRET || adminSecret();
}

function tokenForDay(day) {
  const secret = adminSecret();
  if (!secret) return '';
  return crypto.createHmac('sha256', secret).update(`cove-admin:${day}`).digest('hex');
}

function hmacHex(secret, value) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function tokensEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function createAdminToken() {
  return tokenForDay(Math.floor(Date.now() / 86400000));
}

export function isValidAdminToken(token) {
  if (!token || !adminSecret()) return false;
  const day = Math.floor(Date.now() / 86400000);
  for (const d of [day, day - 1]) {
    const expected = tokenForDay(d);
    if (tokensEqual(token, expected)) return true;
  }
  return false;
}

export function requireAdmin(req, res) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!isValidAdminToken(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

/** Long-lived store token. Does not expire so installed APKs stay signed in. */
export function createStoreToken(userId) {
  const secret = storeSecret();
  if (!secret || !userId) return '';
  return `cove_s1_${hmacHex(secret, `cove-store:${userId}`)}`;
}

function isLegacyStoreToken(token, userId) {
  const prefix = `cove_jwt_${userId}_`;
  if (!token.startsWith(prefix)) return false;
  return /^\d+$/.test(token.slice(prefix.length));
}

export function isValidStoreToken(token, userId) {
  if (!token || !userId) return false;
  if (isLegacyStoreToken(token, userId)) return true;
  const expected = createStoreToken(userId);
  return tokensEqual(token, expected);
}

/**
 * Require a store session. Legacy cove_jwt_<id>_<ts> tokens from already-logged-in
 * APKs are accepted so phones are not signed out on deploy.
 * If no signing secret is configured, allow the request so sync cannot hard-fail.
 */
export function requireStoreAuth(req, res, userId, bodyToken = '') {
  const secret = storeSecret();
  if (!secret) return true;
  const header = req.headers.authorization || req.headers.Authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const token = bearer || bodyToken || '';
  if (!isValidStoreToken(token, userId)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
