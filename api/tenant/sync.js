import { getUser, createUser, saveUser, addActivities, getActivities, parseBody } from '../_db.js';

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
      const { currentBalance, recentLogs } = body;

      // If APK reports recent activity logs, insert into activities table
      if (Array.isArray(recentLogs) && recentLogs.length > 0) {
        await addActivities(user.id, recentLogs);

        // Update total request count
        user.totalRequests = (user.totalRequests || 0) + recentLogs.length;
      }

      // If APK sent a valid deduction, update server balance
      if (typeof currentBalance === 'number' && !isNaN(currentBalance)) {
        if (user.balance > 0 && currentBalance < user.balance) {
          user.balance = Math.max(0, currentBalance);
          user.status = user.balance <= 0 ? 'Paused (Zero Balance)' : 'Active';
        }
      }

      await saveUser(user);
    }

    // Load recent activities for this store
    const activities = await getActivities(user.id, 200);

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
      activities,
      serverTime: Date.now()
    });
  } catch (error) {
    console.error('Tenant sync error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
