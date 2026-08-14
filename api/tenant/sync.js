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
      const { recentLogs, recentTx } = body;

      // If APK reports recent activity logs, record them in activities table
      if (Array.isArray(recentLogs) && recentLogs.length > 0) {
        await addActivities(user.id, recentLogs);
        user.totalRequests = (user.totalRequests || 0) + recentLogs.length;

        // Deduct cost of new activities from server balance
        const totalDeduction = recentLogs.reduce((acc, log) => acc + (parseFloat(log.cost) || user.fixedFeePerMessage || 0.005), 0);
        if (totalDeduction > 0 && user.balance > 0) {
          user.balance = Math.max(0, user.balance - totalDeduction);
          user.status = user.balance <= 0 ? 'Paused (Zero Balance)' : 'Active';
        }
      }

      // If APK reports recent balance transactions, merge them
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
      status: user.balance <= 0 ? 'Paused (Zero Balance)' : 'Active',
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
