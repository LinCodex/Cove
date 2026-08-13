// Centralized Data & Persistence Layer for Cove Master Control & Client APKs
// Supports Cloud REST DB (restful-api.dev) + Vercel KV / Upstash Redis + In-Memory Fallback.

const DB_OBJECT_ID = process.env.COVE_DB_OBJECT_ID || 'ff8081819ff5b110019ffcd34e2814e9';
const CLOUD_DB_URL = `https://api.restful-api.dev/objects/${DB_OBJECT_ID}`;

// Global in-memory cache shared across warm function invocations
if (!globalThis._coveUsersStore) {
  globalThis._coveUsersStore = {};
}

export function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      return {};
    }
  }
  return {};
}

// Pull latest store state from persistent cloud database with zero cache
async function syncFromCloud() {
  try {
    const res = await fetch(`${CLOUD_DB_URL}?_cb=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.users) {
        globalThis._coveUsersStore = { ...json.data.users };
        return globalThis._coveUsersStore;
      }
    }
  } catch (e) {
    console.error('Cloud DB pull error:', e);
  }
  return globalThis._coveUsersStore;
}

// Push updated store state to persistent cloud database with fresh merge
async function syncToCloud() {
  try {
    // 1. Pull latest from cloud first to avoid overwriting other instances
    const res = await fetch(`${CLOUD_DB_URL}?_cb=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    let cloudUsers = {};
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.users) {
        cloudUsers = json.data.users;
      }
    }

    // 2. Merge local updates with cloud users
    const merged = { ...cloudUsers, ...globalThis._coveUsersStore };
    globalThis._coveUsersStore = merged;

    // 3. Persist back to cloud
    await fetch(CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'cove_store_db',
        data: { users: merged }
      })
    });
  } catch (e) {
    console.error('Cloud DB push error:', e);
  }
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
  await syncFromCloud();
  const remote = await kvGet('cove_all_users');
  if (remote) {
    globalThis._coveUsersStore = { ...globalThis._coveUsersStore, ...remote };
  }
  return Object.values(globalThis._coveUsersStore);
}

export async function getUser(userId) {
  if (!userId) return null;
  const cleanId = userId.trim();

  // 1. Always pull latest from Cloud Database
  await syncFromCloud();
  if (globalThis._coveUsersStore[cleanId]) {
    return globalThis._coveUsersStore[cleanId];
  }

  // 2. Pull from KV if available
  const remote = await kvGet(`cove_user_${cleanId}`);
  if (remote) {
    globalThis._coveUsersStore[cleanId] = remote;
    return remote;
  }
  return null;
}

export async function saveUser(user) {
  if (!user || !user.id) return false;
  const cleanId = user.id.trim();
  globalThis._coveUsersStore[cleanId] = {
    ...globalThis._coveUsersStore[cleanId],
    ...user,
    lastActive: Date.now()
  };

  // Sync to Cloud DB & KV
  await syncToCloud();
  await kvSet(`cove_user_${cleanId}`, globalThis._coveUsersStore[cleanId]);
  await kvSet('cove_all_users', globalThis._coveUsersStore);
  return true;
}

export async function deleteUser(userId) {
  if (!userId) return false;
  const cleanId = userId.trim();
  delete globalThis._coveUsersStore[cleanId];
  await syncToCloud();
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
  await syncToCloud();
  await kvSet(`cove_user_${userId}`, newUser);
  await kvSet('cove_all_users', globalThis._coveUsersStore);
  return newUser;
}
