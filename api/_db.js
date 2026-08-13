// Centralized Data & Persistence Layer for Cove Master Control & Client APKs
// Supports Vercel KV / Upstash Redis if configured, with global memory fallback.

const DEFAULT_USERS = {
  'store_boba_01': {
    id: 'store_boba_01',
    password: 'boba123',
    storeName: 'Tiger Boba Tea House',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Springfield',
    balance: 14.850,
    status: 'Active',
    pricingMode: 'fixed_fee',
    fixedFeePerMessage: 0.0050,
    customInputPrice1M: 0.25,
    customOutputPrice1M: 1.50,
    totalRequests: 428,
    lastActive: Date.now(),
    businessProfile: {
      businessName: 'Tiger Boba Tea House',
      businessInfo: 'Open Daily 11:00 AM - 10:00 PM. Authentic brown sugar boba, taro milk tea, and fresh fruit teas. Free parking behind store. Dairy-free milk alternatives available.',
      replyTone: 'Friendly, youthful, and energetic',
      aiRules: 'Do not promise custom unapproved discounts. Direct large catering orders to boba-catering@tigerboba.com.'
    },
    spamConfig: {
      spamEnabled: true,
      cooldownEnabled: true,
      cooldownSeconds: 90,
      maxRepliesEnabled: true,
      maxReplies: 3,
      windowEnabled: true,
      windowMinutes: 10,
      scheduleEnabled: true,
      scheduleMode: 'ONLY_DURING',
      scheduleStart: '11:00',
      scheduleEnd: '22:00',
      scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      outOfHoursMsg: 'Thanks for reaching out to Tiger Boba! We are currently closed (Hours: 11am-10pm daily). We will reply first thing tomorrow!'
    },
    blacklist: ['+1 (555) 000-1111', '+1 (555) 999-0000'],
    activities: [
      {
        id: 'act_101',
        time: new Date().toLocaleTimeString(),
        sender: '+1 (555) 890-1234',
        incoming: 'Hey! Are you guys open today and do you have oat milk?',
        reply: 'Hi there! Yes, Tiger Boba is open today until 10:00 PM! We gladly offer oat milk and other dairy-free alternatives for any drink. Hope to see you soon! 🧋',
        keyUsed: 'Primary (Gemini ...D987)',
        status: 'Sent',
        tokensIn: 342,
        tokensOut: 68,
        cost: 0.0050
      }
    ]
  },
  'store_auto_02': {
    id: 'store_auto_02',
    password: 'auto123',
    storeName: 'Apex Motor Care',
    phone: '+1 (555) 789-0123',
    address: '1200 Industrial Blvd, Austin, TX',
    balance: 0.000,
    status: 'Paused (Zero Balance)',
    pricingMode: 'token_custom',
    fixedFeePerMessage: 0.0080,
    customInputPrice1M: 0.50,
    customOutputPrice1M: 2.00,
    totalRequests: 1250,
    lastActive: Date.now(),
    businessProfile: {
      businessName: 'Apex Motor Care',
      businessInfo: 'Mon-Fri 8:00 AM - 6:00 PM, Sat 9:00 AM - 3:00 PM. Diagnostics, brakes, synthetic oil changes, and transmission service.',
      replyTone: 'Professional, trustworthy, and precise',
      aiRules: 'Do not provide exact diagnostic quotes over SMS without vehicle inspection.'
    },
    spamConfig: {
      spamEnabled: true,
      cooldownEnabled: true,
      cooldownSeconds: 120,
      maxRepliesEnabled: true,
      maxReplies: 2,
      windowEnabled: true,
      windowMinutes: 15,
      scheduleEnabled: true,
      scheduleMode: 'ONLY_DURING',
      scheduleStart: '08:00',
      scheduleEnd: '18:00',
      scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      outOfHoursMsg: 'Thanks for contacting Apex Motor Care. Our shop is currently closed. We will reply during business hours!'
    },
    blacklist: ['+1 (555) 444-3322'],
    activities: [
      {
        id: 'act_201',
        time: new Date().toLocaleTimeString(),
        sender: '+1 (555) 999-1122',
        incoming: 'Can I come in right now?',
        reply: 'Auto-reply paused: Insufficient balance ($0.00)',
        keyUsed: 'None (Blocked by balance)',
        status: 'Blocked (Zero Balance)',
        tokensIn: 0,
        tokensOut: 0,
        cost: 0.0000
      }
    ]
  }
};

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
      businessInfo: userData.businessInfo || 'Open Daily. Full store details and customer service FAQ.',
      replyTone: userData.replyTone || 'Professional, friendly, and concise',
      aiRules: userData.aiRules || 'Do not promise custom unapproved discounts.'
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
