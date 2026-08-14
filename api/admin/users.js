import { getAllUsersLite, getUser, saveUser, createUser, deleteUser, parseBody, applyBalanceChange, getActivities, mergeAiConfig, isRedactedSecret } from '../_db.js';
import { requireAdmin } from '../_adminAuth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === 'GET') {
      const userId = req.query.id || req.query.userId;
      if (userId) {
        const [user, activities] = await Promise.all([
          getUser(String(userId)),
          getActivities(String(userId).trim(), 200)
        ]);
        if (!user) return res.status(404).json({ error: 'Store account not found' });
        user.activities = activities;
        return res.status(200).json({ success: true, user });
      }
      const users = await getAllUsersLite();
      return res.status(200).json({ success: true, users });
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      const action = body.action;
      const data = body.data || body;

      if (action === 'delete_user' && data.id) {
        await deleteUser(data.id);
        return res.status(200).json({ success: true, deletedId: data.id });
      }

      if ((action === 'adjust_balance' || action === 'set_balance') && data.id) {
        const user = await applyBalanceChange(data.id, {
          delta: action === 'adjust_balance' ? data.delta : null,
          absolute: action === 'set_balance' ? data.balance : null,
          reason: data.reason || ''
        });
        if (!user) {
          return res.status(400).json({ error: 'Failed to update store balance' });
        }
        return res.status(200).json({ success: true, user });
      }

      if (action === 'create_user' || req.body?.isNewUser) {
        if (!data.id || !data.password) {
          return res.status(400).json({ error: 'User ID and Password are required to create a new user' });
        }
        const existing = await getUser(data.id);
        if (existing) {
          return res.status(400).json({ error: 'A store account with this User ID already exists' });
        }
        const newUser = await createUser(data);
        return res.status(201).json({ success: true, user: newUser });
      }

      if (data.id || data.oldId) {
        // Update existing user
        const targetId = data.oldId || data.id;
        let user = await getUser(targetId);
        if (!user) {
          return res.status(404).json({ error: 'Store account not found' });
        }
        if (data.aiConfig) {
          data.aiConfig = mergeAiConfig(user.aiConfig, data.aiConfig);
        }
        if (isRedactedSecret(data.password)) {
          delete data.password;
        }
        user = { ...user, ...data };
        const ok = await saveUser(user, data.oldId);
        if (!ok) {
          return res.status(500).json({ error: 'Failed to update store in database' });
        }
        user = await getUser(data.id || targetId);
        return res.status(200).json({ success: true, user });
      }

      return res.status(400).json({ error: 'Invalid request payload' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Admin users API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
