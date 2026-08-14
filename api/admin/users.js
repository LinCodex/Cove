import { getAllUsers, getUser, saveUser, createUser, deleteUser, parseBody } from '../_db.js';

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

  try {
    if (req.method === 'GET') {
      const users = await getAllUsers();
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
          user = await createUser(data);
        } else {
          user = { ...user, ...data };
          await saveUser(user, data.oldId);
          user = await getUser(data.id || targetId);
        }
        return res.status(200).json({ success: true, user });
      }

      return res.status(400).json({ error: 'Invalid request payload' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Admin users API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
