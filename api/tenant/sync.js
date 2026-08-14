import { getUser, patchUser, addActivities, parseBody, mergeAiConfig } from '../_db.js';
import { requireStoreAuth } from '../_adminAuth.js';

function storeRev(user) {
  return user?.lastActive || user?.updatedAt || null;
}

function sameRev(clientRev, serverRev) {
  if (clientRev == null || clientRev === '' || serverRev == null || serverRev === '') return false;
  return String(clientRev) === String(serverRev);
}

function apkPayload(user) {
  return {
    success: true,
    unchanged: false,
    userId: user.id,
    storeName: user.storeName,
    phone: user.phone || '',
    address: user.address || '',
    balance: user.balance,
    status: user.forcedPause ? 'Force Paused' : (user.balance <= 0 ? 'Paused (Zero Balance)' : 'Active'),
    forcedPause: Boolean(user.forcedPause),
    updatedAt: storeRev(user),
    pricing: {
      pricingMode: user.pricingMode,
      fixedFeePerMessage: user.fixedFeePerMessage,
      customInputPrice1M: user.customInputPrice1M,
      customOutputPrice1M: user.customOutputPrice1M
    },
    pricingMode: user.pricingMode,
    fixedFeePerMessage: user.fixedFeePerMessage,
    businessProfile: user.businessProfile,
    spamConfig: user.spamConfig,
    aiConfig: user.aiConfig || {},
    blacklist: user.blacklist || [],
    balanceHistory: (user.balanceHistory || []).slice(0, 80),
    serverTime: Date.now()
  };
}

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = parseBody(req);
  const userId = req.query.userId || body.userId;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  if (!requireStoreAuth(req, res, String(userId).trim(), body.token || '')) return;

  try {
    let user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found on master server' });
    }

    const recentLogs = Array.isArray(body.recentLogs) ? body.recentLogs.slice(0, 50) : [];
    const recentTx = Array.isArray(body.recentTx) ? body.recentTx.slice(0, 50) : [];
    const { businessProfile, spamConfig, aiConfig, blacklist, storeName, phone, clientEdited } = body;
    const edited = clientEdited === true;

    // Cheap poll: nothing new from the phone, and the store row has not changed since last pull.
    if (!edited && recentLogs.length === 0 && recentTx.length === 0 && sameRev(body.updatedAt, storeRev(user))) {
      return res.status(200).json({
        success: true,
        unchanged: true,
        userId: user.id,
        balance: user.balance,
        forcedPause: Boolean(user.forcedPause),
        updatedAt: storeRev(user),
        serverTime: Date.now()
      });
    }

    // 1. Only update store settings when APK explicitly sends an intentional edit.
    //    Never write balance on this path — a full-row save was overwriting admin top-ups.
    if (edited) {
      const configPatch = {};
      if (businessProfile && typeof businessProfile === 'object') {
        configPatch.businessProfile = { ...(user.businessProfile || {}), ...businessProfile };
      }
      if (spamConfig && typeof spamConfig === 'object') {
        configPatch.spamConfig = { ...(user.spamConfig || {}), ...spamConfig };
      }
      if (aiConfig && typeof aiConfig === 'object') {
        configPatch.aiConfig = mergeAiConfig(user.aiConfig, aiConfig);
      }
      if (Array.isArray(blacklist)) {
        configPatch.blacklist = blacklist;
      }
      if (storeName && typeof storeName === 'string') {
        configPatch.storeName = storeName.trim();
      }
      if (phone && typeof phone === 'string') {
        configPatch.phone = phone.trim();
      }
      if (Object.keys(configPatch).length > 0) {
        const patched = await patchUser(user.id, configPatch, { includeBalance: false });
        if (patched) user = patched;
      }
    }

    // 2. If APK reports recent activity logs, record them in activities table
    if (recentLogs.length > 0) {
      await addActivities(user.id, recentLogs);
    }

    // 3. Apply only NEW SMS deductions. Ignore echoed admin top-ups (positive amounts)
    //    and re-read first so we never add deductions onto a stale pre-top-up snapshot.
    if (recentTx.length > 0) {
      const latest = await getUser(userId);
      if (latest) user = latest;

      const existingIds = new Set((user.balanceHistory || []).map(t => String(t.id)));
      const newDeductions = recentTx.filter(t => {
        const amt = parseFloat(t.amount);
        return Number.isFinite(amt) && amt < 0 && !existingIds.has(String(t.id));
      });

      if (newDeductions.length > 0) {
        const sortedNewTx = [...newDeductions].sort((a, b) => (a.timestampMillis || 0) - (b.timestampMillis || 0));
        const formattedNewTx = [];
        let nextBal = Number.isFinite(parseFloat(user.balance)) ? parseFloat(user.balance) : 0;

        for (const t of sortedNewTx) {
          const amt = parseFloat(t.amount);
          nextBal = Math.max(0, nextBal + amt);

          formattedNewTx.unshift({
            id: t.id || Date.now(),
            timestampMillis: t.timestampMillis || Date.now(),
            time: new Date(t.timestampMillis || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(t.timestampMillis || Date.now()).toLocaleDateString(),
            type: 'SMS Reply',
            amount: amt,
            balanceAfter: nextBal,
            description: t.description || (t.recipientNumber ? `SMS reply to ${t.recipientNumber}` : 'Auto-reply SMS')
          });
        }

        const patched = await patchUser(user.id, {
          balance: nextBal,
          status: user.forcedPause ? 'Force Paused' : (nextBal <= 0 ? 'Paused (Zero Balance)' : 'Active'),
          balanceHistory: [...formattedNewTx, ...(user.balanceHistory || [])].slice(0, 200)
        }, { includeBalance: true });
        if (patched) user = patched;
      }
    }

    // No empty last_active heartbeat — that was a write on every poll.

    return res.status(200).json(apkPayload(user));
  } catch (error) {
    console.error('Tenant sync error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
