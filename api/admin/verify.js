import { parseBody } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = parseBody(req);
    const password = body.password || body.pass;
    const masterAdminPassword = process.env.MASTER_ADMIN_PASSWORD || process.env.VITE_MASTER_ADMIN_PASSWORD;

    if (!masterAdminPassword) {
      // If no env variable is set, require password to be provided in environment
      return res.status(500).json({ error: 'Master admin password is not configured on server environment' });
    }

    if (!password || password !== masterAdminPassword) {
      return res.status(401).json({ error: 'Invalid Master Admin Password' });
    }

    const sessionToken = `admin_auth_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    return res.status(200).json({
      success: true,
      token: sessionToken,
      message: 'Master Admin Access Granted'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
