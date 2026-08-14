import { getUser, saveUser, addActivities, getActivities, parseBody } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const body = parseBody(req);
  const userId = req.query.userId || body.userId;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  try {
    let user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found on master server' });
    }

    if (req.method === 'POST') {
      const { recentLogs, recentTx, businessProfile, spamConfig, aiConfig, blacklist, storeName, phone, clientEdited } = body;

      // 1. Only update store settings when APK explicitly sends an intentional edit
      if (clientEdited === true) {
        if (businessProfile && typeof businessProfile === 'object') {
          user.businessProfile = { ...(user.businessProfile || {}), ...businessProfile };
        }
        if (spamConfig && typeof spamConfig === 'object') {
          user.spamConfig = { ...(user.spamConfig || {}), ...spamConfig };
        }
        if (aiConfig && typeof aiConfig === 'object') {
          user.aiConfig = { ...(user.aiConfig || {}), ...aiConfig };
        }
        if (Array.isArray(blacklist)) {
          user.blacklist = blacklist;
        }
        if (storeName && typeof storeName === 'string') {
          user.storeName = storeName.trim();
        }
        if (phone && typeof phone === 'string') {
          user.phone = phone.trim();
        }
      }

      // 2. If APK reports recent activity logs, record them in activities table
      if (Array.isArray(recentLogs) && recentLogs.length > 0) {
        await addActivities(user.id, recentLogs);
      }

      // 3. If APK reports recent balance transactions, merge them into store history
      if (Array.isArray(recentTx) && recentTx.length > 0) {
        const existingIds = new Set((user.balanceHistory || []).map(t => String(t.id)));
        const newTx = recentTx
          .filter(t => !existingIds.has(String(t.id)))
          .map(t => ({
            id: t.id || Date.now(),
            timestampMillis: t.timestampMillis || Date.now(),
            time: new Date(t.timestampMillis || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(t.timestampMillis || Date.now()).toLocaleDateString(),
            type: (parseFloat(t.amount) || 0) >= 0 ? 'Top-Up' : 'SMS Reply',
            amount: parseFloat(t.amount) || 0,
            balanceAfter: user.balance,
            description: t.description || (t.recipientNumber ? `SMS reply to ${t.recipientNumber}` : 'Auto-reply SMS')
          }));

        if (newTx.length > 0) {
          user.balanceHistory = [...newTx, ...(user.balanceHistory || [])].slice(0, 200);
        }
      }

      // 4. Safely sync client deductions into server balance without decay loops
      if (body.currentBalance != null && !isNaN(parseFloat(body.currentBalance))) {
        const apkBalance = parseFloat(body.currentBalance);
        if (apkBalance < user.balance) {
          user.balance = Math.max(0, apkBalance);
          user.status = user.balance <= 0 ? 'Paused (Zero Balance)' : (user.forcedPause ? 'Force Paused' : 'Active');
        }
      }

      await saveUser(user);
    }

    // Load recent activities for this store
    const activities = await getActivities(user.id, 200);

    // Return authoritative live config from Master Control to client APK
    return res.status(200).json({
      success: true,
      userId: user.id,
      storeName: user.storeName,
      phone: user.phone || '',
      address: user.address || '',
      balance: user.balance,
      status: user.forcedPause ? 'Force Paused' : (user.balance <= 0 ? 'Paused (Zero Balance)' : 'Active'),
      forcedPause: Boolean(user.forcedPause),
      pricing: {
        pricingMode: user.pricingMode,
        fixedFeePerMessage: user.fixedFeePerMessage,
        customInputPrice1M: user.customInputPrice1M,
        customOutputPrice1M: user.customOutputPrice1M
      },
      businessProfile: user.businessProfile,
      spamConfig: user.spamConfig,
      aiConfig: user.aiConfig || {},
      blacklist: user.blacklist || [],
      balanceHistory: user.balanceHistory || [],
      activities,
      serverTime: Date.now()
    });
  } catch (error) {
    console.error('Tenant sync error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
