// Centralized Data & Persistence Layer for Cove Master Control & Client APKs
// Supports Vercel KV / Upstash Redis if configured, with global memory store.

const DEFAULT_USERS = {};

// Global in-memory cache shared across warm function invocations
if (!globalThis._coveUsersStore) {
  globalThis._coveUsersStore = { ...DEFAULT_USERS };
}

// Remote KV helpers (Upstash Redis or Vercel KV)
async function kvGet(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data && data.result) {
      return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
    }
  } catch (e) {
    console.error('KV get error:', e);
  }
  return null;
}

async function kvSet(key, value) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return false;

  try {
    await fetch(`${url}/set/${key}`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(typeof value === 'string' ? value : JSON.stringify(value))
    });
    return true;
  } catch (e) {
    console.error('KV set error:', e);
    return false;
  }
}

export async function getAllUsers() {
  const remote = await kvGet('cove_all_users');
  if (remote) {
    globalThis._coveUsersStore = { ...globalThis._coveUsersStore, ...remote };
  }
  return Object.values(globalThis._coveUsersStore);
}

export async function getUser(userId) {
  if (!userId) return null;
  const cleanId = userId.trim();
  const remote = await kvGet(`cove_user_${cleanId}`);
  if (remote) {
    globalThis._coveUsersStore[cleanId] = remote;
    return remote;
  }
  return globalThis._coveUsersStore[cleanId] || null;
}

export async function saveUser(user) {
  if (!user || !user.id) return false;
  const cleanId = user.id.trim();
  globalThis._coveUsersStore[cleanId] = {
    ...globalThis._coveUsersStore[cleanId],
    ...user,
    lastActive: Date.now()
  };

  // Sync to KV if available
  await kvSet(`cove_user_${cleanId}`, globalThis._coveUsersStore[cleanId]);
  await kvSet('cove_all_users', globalThis._coveUsersStore);
  return true;
}

export async function deleteUser(userId) {
  if (!userId) return false;
  const cleanId = userId.trim();
  delete globalThis._coveUsersStore[cleanId];
  await kvSet('cove_all_users', globalThis._coveUsersStore);
  return true;
}

export async function createUser(userData) {
  const userId = userData.id.trim();
  const newUser = {
    id: userId,
    password: userData.password.trim(),
    storeName: userData.storeName?.trim() || userId,
    phone: userData.phone?.trim() || '',
    address: userData.address?.trim() || '',
    balance: parseFloat(userData.balance) || 10.00,
    status: (parseFloat(userData.balance) || 10.00) <= 0 ? 'Paused (Zero Balance)' : 'Active',
    pricingMode: userData.pricingMode || 'fixed_fee',
    fixedFeePerMessage: parseFloat(userData.fixedFeePerMessage) || 0.0050,
    customInputPrice1M: parseFloat(userData.customInputPrice1M) || 0.25,
    customOutputPrice1M: parseFloat(userData.customOutputPrice1M) || 1.50,
    totalRequests: 0,
    lastActive: Date.now(),
    businessProfile: {
      businessName: userData.storeName?.trim() || userId,
      businessInfo: userData.businessInfo || '',
      replyTone: userData.replyTone || 'Professional, friendly, and concise',
      aiRules: userData.aiRules || ''
    },
    spamConfig: {
      spamEnabled: true,
      cooldownEnabled: true,
      cooldownSeconds: 90,
      maxRepliesEnabled: true,
      maxReplies: 3,
      windowEnabled: true,
      windowMinutes: 10,
      scheduleEnabled: false,
      scheduleMode: 'ONLY_DURING',
      scheduleStart: '09:00',
      scheduleEnd: '18:00',
      scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      outOfHoursMsg: 'Thanks for contacting us! We are currently closed.'
    },
    blacklist: [],
    activities: []
  };

  globalThis._coveUsersStore[userId] = newUser;
  await kvSet(`cove_user_${userId}`, newUser);
  await kvSet('cove_all_users', globalThis._coveUsersStore);
  return newUser;
}
