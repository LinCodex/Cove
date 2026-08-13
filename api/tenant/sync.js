import { getUser, saveUser } from '../_db.js';

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

  const userId = req.query.userId || req.body?.userId;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  try {
    let user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found on master server' });
    }

    if (req.method === 'POST') {
      const { currentBalance, recentLogs } = req.body || {};

      // If APK reports recent activity logs, append to server activities
      if (Array.isArray(recentLogs) && recentLogs.length > 0) {
        const existingIds = new Set((user.activities || []).map(a => String(a.id)));
        const newActivities = recentLogs
          .filter(l => l && !existingIds.has(String(l.id)))
          .map(l => ({
            id: String(l.id || `act_${Date.now()}_${Math.random()}`),
            time: new Date(l.timestampMillis || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            sender: l.sender || 'Customer',
            incoming: l.incoming || '',
            reply: l.reply || '',
            status: l.status || 'Sent',
            tokensIn: l.inputTokens || 0,
            tokensOut: l.outputTokens || 0,
            cost: user.fixedFeePerMessage || 0.0050
          }));

        if (newActivities.length > 0) {
          user.activities = [...newActivities, ...(user.activities || [])].slice(0, 200);
          user.totalRequests = (user.totalRequests || 0) + newActivities.length;
        }
      }

      // If APK sent a valid deduction, update server balance if server didn't explicitly override
      if (typeof currentBalance === 'number' && !isNaN(currentBalance)) {
        // If server balance wasn't manually set to 0.000 by admin
        if (user.balance > 0 && currentBalance < user.balance) {
          user.balance = Math.max(0, currentBalance);
          user.status = user.balance <= 0 ? 'Paused (Zero Balance)' : 'Active';
        }
      }

      await saveUser(user);
    }

    // Return latest live config to client APK
    return res.status(200).json({
      success: true,
      userId: user.id,
      storeName: user.storeName,
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
      blacklist: user.blacklist || [],
      serverTime: Date.now()
    });
  } catch (error) {
    console.error('Tenant sync error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
