import { parseBody, getSystemMasterRule, saveSystemMasterRule } from '../_db.js';
import { requireAdmin } from '../_adminAuth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === 'GET') {
      const masterAiRule = await getSystemMasterRule();
      return res.status(200).json({ success: true, masterAiRule });
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      const masterAiRule = typeof body.masterAiRule === 'string' ? body.masterAiRule : '';
      await saveSystemMasterRule(masterAiRule);
      return res.status(200).json({ success: true, masterAiRule });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Admin system API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
